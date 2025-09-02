#!/usr/bin/env node
/**
 * High-level Gemini Pro 2.5 Review Runner
 *
 * Goals:
 * - Produce a structured, high-signal code review targeting security, correctness, performance, style, and tests.
 * - Be auditable: produce a JSON artifact (artifacts/gemini-review-<sha>.json) with model prompt, model response, and metadata.
 * - Optionally post a compact summary back to the PR (controlled by POST_BACK=true and GITHUB_TOKEN).
 * - Reject "flash" model names and avoid sending large binary files to the model.
 *
 * Rationale decisions (inline where non-obvious):
 * - Use Node 18 built-in fetch for HTTP requests (no external deps) to keep CI footprint small and auditable.
 * - Keep prompt templates per language so the model receives context-sensitive guidance (JS, Python, Shell).
 * - Require GEMINI_API_ENDPOINT & GEMINI_API_KEY as secrets (avoid hardcoding).
 * - Output JSON schema: { meta, prompt, model_request, model_response, issues_parsed (if available) }
 *
 * Exit codes:
 *  0 - success
 *  2 - missing config
 *  3 - disallowed model
 *  4 - runtime error
 *
 * References and further instructions are appended in the file footer.
 */

import { execSync } from "child_process";
import { statSync, readFileSync, mkdirSync, writeFileSync, existsSync } from "fs";
import { env, exit } from "process";
import { URL } from "url";
import https from "https";
import http from "http";

const MAX_FILE_BYTES = 300 * 1024; // 300 KB per file safeguard (higher for "high-level" scans)
const MAX_PROMPT_CHARS_PER_FILE = 32 * 1024; // 32 KB truncated per-file snippet for richer context
const MAX_FILES_IN_PROMPT = 75; // tradeoff between signal and cost
const MODEL = env.GEMINI_MODEL || "gemini-pro-2.5";
const API_ENDPOINT = env.GEMINI_API_ENDPOINT;
const API_KEY = env.GEMINI_API_KEY;
const REVIEWERS = env.REVIEWERS || "Gemini Pro 2.5 (high-level)";
const STANDARDS = env.STANDARDS || "vault";
const POST_BACK = (env.POST_BACK || "false").toLowerCase() === "true";
const GITHUB_TOKEN = env.GITHUB_TOKEN || null;
const CI_COMMIT_SHA = env.CI_COMMIT_SHA || (run("git rev-parse HEAD") || null);
const CI_PR_NUMBER = env.CI_PR_NUMBER || "";

if (!API_ENDPOINT || !API_KEY) {
  console.error("Missing GEMINI_API_ENDPOINT or GEMINI_API_KEY. Abort.");
  exit(2);
}
if (/flash/i.test(MODEL)) {
  console.error(`Model "${MODEL}" appears to be a flash variant. This workflow enforces non-flash Gemini Pro models.`);
  exit(3);
}

// Utility: safely run shell commands (stderr suppressed)
function run(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

// Determine changed files in PR or push
function getChangedFiles() {
  // Prefer PR diff if available
  const prNumber = CI_PR_NUMBER;
  let base = "origin/main";
  run("git fetch origin main --depth=1 || true");
  let diff;
  if (prNumber) {
    // Try to use the merge-base diff if checkout provides it
    diff = run(`git diff --name-only origin/main...HEAD`);
  } else {
    diff = run(`git diff --name-only ${base}...HEAD`) || run("git show --name-only --pretty=\"\" HEAD");
  }
  if (!diff) {
    // fallback to staged/tracked files (defensive)
    diff = run('git ls-files').slice(0, 2000);
  }
  return diff.split("\n").filter(Boolean);
}

function readFileSnippet(path) {
  try {
    const size = statSync(path).size;
    if (size > MAX_FILE_BYTES) return `<<skipped ${path} (size ${size} bytes) - exceeds ${MAX_FILE_BYTES} bytes limit>>`;
    const content = readFileSync(path, "utf8");
    return content.length > MAX_PROMPT_CHARS_PER_FILE ? content.slice(0, MAX_PROMPT_CHARS_PER_FILE) + "\n<<truncated>>" : content;
  } catch (e) {
    return `<<unreadable ${path}: ${String(e)}>>`;
  }
}

// Language-specific prompt fragments for higher signal
const languageGuides = {
  ".js": "Focus on Node/Browser JS idioms, common security pitfalls (XSS, eval, prototype pollution), async/await misuse, and performance hot-spots.",
  ".ts": "Treat as TypeScript: check types/any usage, incorrect casting, and missing runtime guards.",
  ".py": "Check for injection patterns, unsafe use of eval/exec, IO blocking patterns, and packaging/venv expectations.",
  ".sh": "Check for unsafe shell expansions, word splitting, and unvalidated use of sudo or PATH assumptions.",
  ".env": "Look for secrets; mark any apparent secrets for manual review; do NOT print secrets in the artifact."
};

// Build a rich, high-level prompt
function buildPrompt(changedFiles) {
  const header = [
    `You are an advanced automated reviewer: "${REVIEWERS}"`,
    `Standards profile: ${STANDARDS}`,
    `Model directive: Use "${MODEL}" and NEVER any "flash" variant.`,
    "",
    "Required output: JSON with keys: summary, issues[], suggestions[], confidence (0-1).",
    "- summary: 1-2 paragraph high-level summary of the repository state and risk posture.",
    "- issues[]: objects { file, line_hint, category (security|correctness|style|performance|tests|docs), severity (low|medium|high), message }",
    "- suggestions[]: objects { file, snippet_or_diff (if short), rationale }",
    "",
    "Prioritize: security > correctness > tests > performance > style. Only include high-confidence findings; mark uncertain items with confidence <= 0.6.",
    "If files are too large or binary, note and skip content-level review for them.",
    "",
    "Changed files included below (truncated where necessary):",
    ""
  ].join("\n");

  const fileBodies = changedFiles.map(p => {
    const ext = p.includes(".") ? p.slice(p.lastIndexOf(".")) : "";
    const langHint = languageGuides[ext] ? `\n[LANGUAGE GUIDANCE] ${languageGuides[ext]}` : "";
    const content = readFileSnippet(p);
    return `-- ${p} --${langHint}\n${content}\n`;
  });

  const tail = [
    "",
    "Formatting constraints: Return strict JSON only. For code suggestions, prefer unified diff snippets under suggestions[].",
    "If you cannot provide a precise line number, use 'line_hint' such as 'near function <name>' or 'top-of-file'.",
  ].join("\n");

  return [header, ...fileBodies, tail].join("\n");
}

// Generic HTTP POST using fetch-like behavior without external deps
async function postJson(endpoint, apiKey, body) {
  const url = new URL(endpoint);
  const payload = JSON.stringify(body);
  const isHttps = url.protocol === "https:";
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
      Authorization: `Bearer ${apiKey}`,
    }
  };

  return new Promise((resolve, reject) => {
    const lib = isHttps ? https : http;
    const req = lib.request(endpoint, options, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

// Post a compact PR comment via GitHub REST (issues API) - conditional on token & PR
async function postPrComment(prNumber, bodyText) {
  if (!GITHUB_TOKEN) {
    console.warn("GITHUB_TOKEN not available; skipping PR comment.");
    return;
  }
  if (!prNumber) {
    console.warn("No PR number available; skipping PR comment.");
    return;
  }
  const owner = run("git remote get-url origin | sed -E 's#.*[:/](.*)/(.*).git#\\1#'") || "";
  const repo = run("git remote get-url origin | sed -E 's#.*[:/](.*)/(.*).git#\\2#'") || "";
  if (!owner || !repo) {
    console.warn("Cannot determine owner/repo from git remote; skipping PR comment.");
    return;
  }
  const url = `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`;
  const payload = { body: bodyText };
  const res = await postJson(url, GITHUB_TOKEN, payload);
  if (res.status >= 200 && res.status < 300) {
    console.log("Posted PR comment successfully.");
  } else {
    console.warn("Failed to post PR comment:", res.status, res.body);
  }
}

(async function main() {
  try {
    const changed = getChangedFiles();
    if (!changed.length) {
      console.log("No changed files detected. Exiting cleanly.");
      exit(0);
    }
    console.log(`Detected ${changed.length} changed files; including up to ${MAX_FILES_IN_PROMPT} in prompt.`);
    const selected = changed.slice(0, MAX_FILES_IN_PROMPT);
    selected.forEach(f => console.log(" -", f));

    const prompt = buildPrompt(selected);

    // Prepare request payload. NOTE: adapt this to your Gemini/Vertex contract if needed.
    const requestPayload = {
      model: MODEL,
      input: prompt,
      meta: {
        commit: CI_COMMIT_SHA,
        pr: CI_PR_NUMBER,
        files_count: changed.length
      },
      // Optional tuning knobs for your proxy/endpoint (left generic)
      options: {
        temperature: 0.0,
        max_output_tokens: 2000
      }
    };

    // Send to configured endpoint
    console.log("Sending review request to model endpoint...");
    const res = await postJson(API_ENDPOINT, API_KEY, requestPayload);

    // Persist artifact
    const artifactsDir = "./artifacts";
    if (!existsSync(artifactsDir)) mkdirSync(artifactsDir, { recursive: true });
    const artifactPath = `${artifactsDir}/gemini-review-${CI_COMMIT_SHA.slice(0, 8)}.json`;
    const artifact = {
      meta: requestPayload.meta,
      model_request: requestPayload,
      model_response: res,
      generated_at: new Date().toISOString()
    };
    writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));
    console.log("Wrote artifact:", artifactPath);

    // Try parsing model response to extract JSON if it returned text
    let parsedOutput = null;
    if (res && res.body) {
      if (typeof res.body === "object") {
        parsedOutput = res.body;
      } else if (typeof res.body === "string") {
        // attempt to find JSON blob in text
        const match = res.body.match(/(\{[\s\S]*\})/m);
        if (match) {
          try { parsedOutput = JSON.parse(match[1]); } catch { parsedOutput = null; }
        }
      }
    }

    // Optionally post a concise PR comment
    if (POST_BACK && parsedOutput) {
      const summary = parsedOutput.summary || "Automated Gemini review summary (compact)";
      const issues = Array.isArray(parsedOutput.issues) ? parsedOutput.issues.slice(0, 10) : [];
      const commentLines = [
        "### Automated Gemini Pro 2.5 Review (compact)",
        `Commit: \`${CI_COMMIT_SHA}\``,
        "",
        "**Summary:**",
        summary,
        "",
        "**Top issues (up to 10):**",
        ...issues.map((it, idx) => `- (${it.severity || "unknown"}) ${it.file || "unknown file"}: ${it.message || "(no message)"}${it.line_hint ? ` — ${it.line_hint}` : ""}`),
        "",
        "_Full machine-readable artifact is attached to the workflow run._"
      ];
      await postPrComment(CI_PR_NUMBER, commentLines.join("\n"));
    } else if (POST_BACK) {
      console.warn("POST_BACK requested but model response couldn't be parsed; skipping PR comment.");
    }

    console.log("Review run complete. Artifact path:", artifactPath);
    exit(0);
  } catch (err) {
    console.error("Runtime error during Gemini review:", err);
    exit(4);
  }
})();