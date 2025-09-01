// Snippet: updated postPrComment to prefer GitHub App installation token if present
// (This is the function replacement / integration point — the rest of the file remains unchanged.)

// Usage: the script will read process.env.GITHUB_APP_INSTALLATION_TOKEN first, then process.env.GITHUB_TOKEN.

async function postPrComment(prNumber, bodyText) {
  // Prefer installation token (more scoped) when available
  const appToken = process.env.GITHUB_APP_INSTALLATION_TOKEN || null;
  const repoToken = process.env.GITHUB_TOKEN || null;
  const tokenToUse = appToken || repoToken;

  if (!tokenToUse) {
    console.warn("No token available for posting PR comment; skipping.");
    return;
  }
  if (!prNumber) {
    console.warn("No PR number available; skipping PR comment.");
    return;
  }

  // Determine owner/repo from git remote
  const remoteUrl = run("git remote get-url origin || true");
  const m = (remoteUrl || "").match(/[:\/]([^\/]+)\/([^\/]+?)(?:\.git)?$/);
  if (!m) {
    console.warn("Cannot parse owner/repo from git remote; skipping PR comment.");
    return;
  }
  const owner = m[1];
  const repo = m[2];

  const url = `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`;
  const payload = { body: bodyText };

  // Use bearer auth for both token types
  const res = await postJson(url, tokenToUse, payload, true);

  if (res.status >= 200 && res.status < 300) {
    console.log("Posted PR comment successfully.");
  } else {
    console.warn("Failed to post PR comment:", res.status, typeof res.body === 'object' ? JSON.stringify(res.body) : res.body);
  }
}