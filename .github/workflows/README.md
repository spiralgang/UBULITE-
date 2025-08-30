# Gemini Pro 2.5 CI Review (UBULITE)

This branch adds a high-level Gemini Pro 2.5 review pipeline that can run in one of two secure auth modes:

- gcloud (recommended): uses GitHub OIDC -> GCP Workload Identity to mint short-lived access tokens for Vertex AI / Gemini.
- secret (fallback): uses a repository secret named `GEMINI` for internal proxy endpoints that accept a static key.

It also supports a GitHub App installation token (recommended) for posting PR comments. If the following App secrets exist, the workflow will generate an installation token automatically:

- `GITHUB_APP_PRIVATE_KEY` (PEM)
- `GITHUB_APP_ID`
- `GITHUB_APP_INSTALLATION_ID`

Required repository secrets (set these in Settings -> Secrets):

- `GEMINI` (the repository secret containing your API key when using secret mode)
- `GEMINI_API_ENDPOINT` (Vertex AI or proxy endpoint for Gemini model)
- `GEMINI_AUTH_MODE` (optional: `gcloud` or `secret`; default `secret`)
- `GCP_WORKLOAD_IDENTITY_PROVIDER` (required for gcloud mode)
- `GCP_SERVICE_ACCOUNT_EMAIL` (required for gcloud mode)
- `GCP_PROJECT_ID` (optional but recommended)
- `GITHUB_APP_PRIVATE_KEY` (optional, PEM multiline)
- `GITHUB_APP_ID` (optional)
- `GITHUB_APP_INSTALLATION_ID` (optional)
- `GEMINI_POST_BACK` (optional: `true` to post compact PR comments; default `false`)

How it works (high level):

1. The workflow checks out full history and optionally authenticates to GCP via Workload Identity.
2. If GitHub App secrets are present the workflow generates an installation token and exports it to the runner.
3. The runner chooses an auth token (GEMINI_ACCESS_TOKEN from gcloud or the `GEMINI` repo secret) and calls the configured GEMINI_API_ENDPOINT with a language-aware prompt containing changed-file snippets.
4. The runner writes a machine-readable artifact under `artifacts/` and (optionally) posts a compact PR comment using the installation token.

Testing:

- Ensure required secrets are configured.
- Open a small PR against `main` and verify the workflow run produces an artifact `artifacts/gemini-review-<sha>.json` and (if `GEMINI_POST_BACK=true`) a PR comment.

Security notes:

- Do NOT paste keys into chat or commit them. Use repository secrets and Workload Identity where possible.
- The runner avoids printing tokens/keys to logs and truncates file contents to limit prompt size.
