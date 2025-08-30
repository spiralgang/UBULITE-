#!/usr/bin/env node
/* High-level Gemini Pro 2.5 review runner (CommonJS-style with Node 18 APIs)
   - Auth selection: prefer GEMINI_ACCESS_TOKEN (gcloud OIDC) then GEMINI secret.
   - Auth for PR comments: prefer GITHUB_APP_INSTALLATION_TOKEN then GITHUB_TOKEN.
   - Uses no external dependencies.
*/

const { execSync } = require('child_process');
const { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } = require('fs');
const https = require('https');
const http = require('http');
const { URL } = require('url');
const process = require('process');

const MAX_FILE_BYTES = 300 * 1024;
const MAX_PROMPT_CHARS_PER_FILE = 32 * 1024;
const MAX_FILES_IN_PROMPT = 75;

const MODEL = process.env.GEMINI_MODEL || 'gemini-pro-2.5';
const API_ENDPOINT = process.env.GEMINI_API_ENDPOINT;
const API_KEY = process.env.GEMINI_API_KEY || null; // maps from workflow's GEMINI secret var
const ACCESS_TOKEN = process.env.GEMINI_ACCESS_TOKEN || null;
const AUTH_MODE = process.env.GEMINI_AUTH_MODE || 'secret';

function fatal(code, msg) { console.error(msg); process.exit(code); }
if (!API_ENDPOINT) fatal(2, 'Missing GEMINI_API_ENDPOINT. Set as repository secret GEMINI_API_ENDPOINT.');
if (!ACCESS_TOKEN && !API_KEY) fatal(2, 'No authentication configured. Provide GEMINI (secret) or use gcloud Workload Identity.');
if (/flash/i.test(MODEL)) fatal(3, `Model ${MODEL} looks like a flash variant; disallowed.`);

function run(cmd) { try { return execSync(cmd, { encoding: 'utf8', stdio: ['pipe','pipe','ignore'] }).trim(); } catch { return ''; } }

function getChangedFiles() { run('git fetch origin main --depth=1 || true'); const diff = run('git diff --name-only origin/main...HEAD') || run('git show --name-only --pretty="" HEAD') || run('git ls-files'); return diff.split('\n').filter(Boolean); }

function readFileSnippet(path) { try { const size = statSync(path).size; if (size > MAX_FILE_BYTES) return `<<skipped ${path} (size ${size} bytes)>>`; const content = readFileSync(path, 'utf8'); return content.length > MAX_PROMPT_CHARS_PER_FILE ? content.slice(0, MAX_PROMPT_CHARS_PER_FILE) + '\n<<truncated>>' : content; } catch (e) { return `<<unreadable ${path}: ${String(e)}>>`; } }

const languageGuides = { '.js': 'Focus on Node/Browser JS idioms, security pitfalls (XSS, eval), async misuse, and performance.', '.py': 'Check for injection, unsafe eval/exec, blocking IO, packaging.', '.sh': 'Check unsafe expansions, word-splitting, sudo usage.' };

function buildPrompt(changedFiles) { const header = [ `You are an advanced automated reviewer: "Gemini Pro 2.5 (high-level)"`, `Standards: ${process.env.STANDARDS || 'vault'}`, `Model directive: Use "${MODEL}". NEVER use any "flash" variant.`, '', 'Required output: JSON: { summary, issues[], suggestions[], confidence }. Issues must include file, category, severity.', '', 'Changed files (truncated where necessary):', '' ].join('\n'); const fileBodies = changedFiles.map(p => { const ext = p.includes('.') ? p.slice(p.lastIndexOf('.')) : ''; const langHint = languageGuides[ext] ? `\n[LANGUAGE GUIDANCE] ${languageGuides[ext]}` : ''; const content = readFileSnippet(p); return `-- ${p} --${langHint}\n${content}\n`; }); const tail = ['', 'Return strict JSON only. If uncertain, mark findings with low confidence.',].join('\n'); return [header, ...fileBodies, tail].join('\n'); }

function postJson(endpoint, tokenOrKey, body, useBearer = true) { const url = new URL(endpoint); const payload = JSON.stringify(body); const isHttps = url.protocol === 'https:'; const options = { hostname: url.hostname, port: url.port || (isHttps ? 443 : 80), path: url.pathname + url.search, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload), Authorization: useBearer ? `Bearer ${tokenOrKey}` : `${tokenOrKey}` } }; return new Promise((resolve, reject) => { const lib = isHttps ? https : http; const req = lib.request(options, (res) => { let data = ''; res.on('data', (chunk) => data += chunk); res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(data) }); } catch { resolve({ status: res.statusCode, body: data }); } }); }); req.on('error', (err) => reject(err)); req.write(payload); req.end(); }); }

async function postPrComment(prNumber, bodyText) { const appToken = process.env.GITHUB_APP_INSTALLATION_TOKEN || null; const repoToken = process.env.GITHUB_TOKEN || null; const tokenToUse = appToken || repoToken; if (!tokenToUse) { console.warn('No token available for posting PR comment; skipping.'); return; } if (!prNumber) { console.warn('No PR number available; skipping PR comment.'); return; } const remoteUrl = run("git remote get-url origin || true"); const m = (remoteUrl || '').match(/[:\/]([^\/]*)\/([^\/]*?)(?:\.git)?$/); if (!m) { console.warn('Cannot parse owner/repo from git remote; skipping PR comment.'); return; } const owner = m[1]; const repo = m[2]; const url = `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`; const payload = { body: bodyText }; const res = await postJson(url, tokenToUse, payload, true); if (res.status >= 200 && res.status < 300) { console.log('Posted PR comment successfully.'); } else { console.warn('Failed to post PR comment:', res.status, typeof res.body === 'object' ? JSON.stringify(res.body) : res.body); } }

(async function main() { try { const changed = getChangedFiles(); if (!changed.length) { console.log('No changed files detected. Nothing to review.'); process.exit(0); } console.log(`Detected ${changed.length} changed files; including up to ${MAX_FILES_IN_PROMPT} files.`); const selected = changed.slice(0, MAX_FILES_IN_PROMPT); selected.forEach(f => console.log(' -', f)); const prompt = buildPrompt(selected); const requestPayload = { model: MODEL, input: prompt, meta: { commit: process.env.CI_COMMIT_SHA || run('git rev-parse HEAD'), pr: process.env.CI_PR_NUMBER || '' }, options: { temperature: 0.0, max_output_tokens: 2000 } }; console.log('Preparing request to model endpoint...'); const token = ACCESS_TOKEN || API_KEY; const useBearer = true; const res = await postJson(API_ENDPOINT, token, requestPayload, useBearer); const artifactsDir = './artifacts'; if (!existsSync(artifactsDir)) mkdirSync(artifactsDir, { recursive: true }); const sha = (process.env.CI_COMMIT_SHA || run('git rev-parse --short HEAD') || 'unknown').slice(0,12); const artifactPath = `${artifactsDir}/gemini-review-${sha}.json`; const artifact = { meta: requestPayload.meta, model_request: { model: requestPayload.model, input_summary: `(omitted)`, options: requestPayload.options }, model_response: res, generated_at: new Date().toISOString() }; writeFileSync(artifactPath, JSON.stringify(artifact, null, 2)); console.log('Wrote artifact:', artifactPath); // Try parsing body to post short PR comment
    let parsedOutput = null;
    if (res && res.body) {
      if (typeof res.body === 'object') parsedOutput = res.body;
      else if (typeof res.body === 'string') {
        const match = res.body.match(/(\{[\s\S]*\})/m);
        if (match) try { parsedOutput = JSON.parse(match[1]); } catch { parsedOutput = null; }
      }
    }
    if ((process.env.POST_BACK || 'false') === 'true' && parsedOutput) {
      const summary = parsedOutput.summary || 'Automated Gemini review summary (compact)';
      const issues = Array.isArray(parsedOutput.issues) ? parsedOutput.issues.slice(0,10) : [];
      const commentLines = [ '### Automated Gemini Pro 2.5 Review (compact)', `Commit: \`${requestPayload.meta.commit}\``, '', '**Summary:**', summary, '', '**Top issues (up to 10):**', ...issues.map((it) => `- (${it.severity || 'unknown'}) ${it.file || 'unknown file'}: ${it.message || '(no message)'}${it.line_hint ? ` — ${it.line_hint}` : ''}`), '', '_Full machine-readable artifact is attached to the workflow run._' ];
      await postPrComment(process.env.CI_PR_NUMBER || '', commentLines.join('\n'));
    } else if ((process.env.POST_BACK || 'false') === 'true') {
      console.warn('POST_BACK requested but model response could not be parsed; skipping PR comment.');
    }
    process.exit(0);
  } catch (err) { console.error('Runtime error during Gemini review:', err); process.exit(4); }
})();
