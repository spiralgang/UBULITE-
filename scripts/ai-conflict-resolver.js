#!/usr/bin/env node
/* AI Conflict Resolver Script
   - Analyzes conflicts in issues, PRs, and comments
   - Uses Gemini Pro 2.5 to provide conflict resolution suggestions
   - Posts intelligent resolution recommendations back to the issue/PR
*/

const { execSync } = require('child_process');
const { existsSync, mkdirSync, readFileSync, writeFileSync } = require('fs');
const https = require('https');
const http = require('http');
const { URL } = require('url');
const process = require('process');

const MODEL = process.env.GEMINI_MODEL || 'gemini-pro-2.5';
const API_ENDPOINT = process.env.GEMINI_API_ENDPOINT;
const API_KEY = process.env.GEMINI_API_KEY || null;
const ACCESS_TOKEN = process.env.GEMINI_ACCESS_TOKEN || null;
const AUTH_MODE = process.env.GEMINI_AUTH_MODE || 'secret';

const ISSUE_NUMBER = process.env.ISSUE_NUMBER;
const CONTEXT_TYPE = process.env.CONTEXT_TYPE;
const ISSUE_TITLE = process.env.ISSUE_TITLE;

function fatal(code, msg) { 
  console.error(msg); 
  process.exit(code); 
}

if (!API_ENDPOINT) fatal(2, 'Missing GEMINI_API_ENDPOINT. Set as repository secret GEMINI_API_ENDPOINT.');
if (!ACCESS_TOKEN && !API_KEY) fatal(2, 'No authentication configured. Provide GEMINI secret or use gcloud Workload Identity.');
if (/flash/i.test(MODEL)) fatal(3, `Model ${MODEL} looks like a flash variant; disallowed.`);

function run(cmd) { 
  try { 
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe','pipe','ignore'] }).trim(); 
  } catch { 
    return ''; 
  } 
}

function postJson(endpoint, tokenOrKey, body, useBearer = true) {
  const url = new URL(endpoint);
  const payload = JSON.stringify(body);
  const isHttps = url.protocol === 'https:';
  const options = {
    hostname: url.hostname,
    port: url.port || (isHttps ? 443 : 80),
    path: url.pathname + url.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      Authorization: useBearer ? `Bearer ${tokenOrKey}` : `${tokenOrKey}`
    }
  };

  return new Promise((resolve, reject) => {
    const lib = isHttps ? https : http;
    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', (err) => reject(err));
    req.write(payload);
    req.end();
  });
}

async function getIssueContext() {
  const appToken = process.env.GITHUB_APP_INSTALLATION_TOKEN || null;
  const repoToken = process.env.GITHUB_TOKEN || null;
  const tokenToUse = appToken || repoToken;
  
  if (!tokenToUse || !ISSUE_NUMBER) {
    return { comments: [], files: [] };
  }

  const remoteUrl = run("git remote get-url origin || true");
  const m = (remoteUrl || '').match(/[:\/]([^\/]*)\/([^\/]*?)(?:\.git)?$/);
  if (!m) return { comments: [], files: [] };
  
  const owner = m[1];
  const repo = m[2];
  
  try {
    // Get issue/PR comments
    const endpoint = CONTEXT_TYPE === 'pull_request' 
      ? `https://api.github.com/repos/${owner}/${repo}/pulls/${ISSUE_NUMBER}/comments`
      : `https://api.github.com/repos/${owner}/${repo}/issues/${ISSUE_NUMBER}/comments`;
    
    const res = await postJson(endpoint, tokenToUse, {}, true);
    const comments = res.status === 200 ? (Array.isArray(res.body) ? res.body : []) : [];
    
    // Get changed files if PR
    let files = [];
    if (CONTEXT_TYPE === 'pull_request') {
      const changedFiles = run('git diff --name-only origin/main...HEAD') || '';
      files = changedFiles.split('\n').filter(Boolean).slice(0, 20); // Limit to 20 files
    }
    
    return { comments, files };
  } catch (error) {
    console.warn('Error fetching context:', error.message);
    return { comments: [], files: [] };
  }
}

function buildConflictResolutionPrompt(context) {
  const prompt = [
    `You are an AI Conflict Resolver for the UBULITE project.`,
    ``,
    `TASK: Analyze and resolve conflicts in ${CONTEXT_TYPE}: "${ISSUE_TITLE}"`,
    ``,
    `CONFLICT ANALYSIS GUIDELINES:`,
    `- Identify disagreements between team members, AI systems, or technical conflicts`,
    `- Look for merge conflicts, build failures, or incompatible changes`,
    `- Detect workflow failures or CI/CD issues`,
    `- Find contradictory requirements or implementation approaches`,
    ``,
    `RESOLUTION STRATEGY:`,
    `- Provide clear, actionable steps to resolve the conflict`,
    `- Suggest compromise solutions when multiple valid approaches exist`,
    `- Prioritize technical correctness and project maintainability`,
    `- Recommend specific code changes, workflow fixes, or process improvements`,
    ``,
    `CONTEXT TYPE: ${CONTEXT_TYPE}`,
    `ISSUE/PR NUMBER: ${ISSUE_NUMBER}`,
    `TITLE: ${ISSUE_TITLE}`,
    ``
  ];

  if (context.comments && context.comments.length > 0) {
    prompt.push(`RECENT COMMENTS (potential conflict sources):`);
    context.comments.slice(-10).forEach((comment, i) => {
      prompt.push(`Comment ${i + 1} by ${comment.user?.login || 'unknown'}:`);
      prompt.push(comment.body || '');
      prompt.push('');
    });
  }

  if (context.files && context.files.length > 0) {
    prompt.push(`CHANGED FILES (potential merge conflicts):`);
    context.files.forEach(file => {
      prompt.push(`- ${file}`);
      try {
        const content = readFileSync(file, 'utf8');
        if (content.includes('<<<<<<<') || content.includes('>>>>>>>') || content.includes('=======')) {
          prompt.push(`  ⚠️ MERGE CONFLICT DETECTED in ${file}`);
        }
      } catch {
        // File might not exist or be readable
      }
    });
    prompt.push('');
  }

  prompt.push(...[
    `OUTPUT REQUIREMENTS:`,
    `Return JSON with this exact structure:`,
    `{`,
    `  "conflict_detected": boolean,`,
    `  "conflict_type": "merge|workflow|technical|communication|requirements",`,
    `  "severity": "low|medium|high|critical",`,
    `  "summary": "Brief description of the conflict",`,
    `  "resolution_steps": [`,
    `    "Step 1: Specific action to take",`,
    `    "Step 2: Next action",`,
    `    "Step 3: Final verification"`,
    `  ],`,
    `  "recommended_assignee": "username or role who should handle this",`,
    `  "urgency": "low|medium|high",`,
    `  "automated_fix_possible": boolean,`,
    `  "follow_up_required": boolean`,
    `}`,
    ``,
    `Analyze the context above and provide a conflict resolution recommendation.`
  ]);

  return prompt.join('\n');
}

async function postIssueComment(issueNumber, bodyText) {
  const appToken = process.env.GITHUB_APP_INSTALLATION_TOKEN || null;
  const repoToken = process.env.GITHUB_TOKEN || null;
  const tokenToUse = appToken || repoToken;
  
  if (!tokenToUse) {
    console.warn('No token available for posting comment; skipping.');
    return;
  }
  
  if (!issueNumber) {
    console.warn('No issue number available; skipping comment.');
    return;
  }

  const remoteUrl = run("git remote get-url origin || true");
  const m = (remoteUrl || '').match(/[:\/]([^\/]*)\/([^\/]*?)(?:\.git)?$/);
  if (!m) {
    console.warn('Cannot parse owner/repo from git remote; skipping comment.');
    return;
  }
  
  const owner = m[1];
  const repo = m[2];
  const url = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`;
  const payload = { body: bodyText };
  
  const res = await postJson(url, tokenToUse, payload, true);
  if (res.status >= 200 && res.status < 300) {
    console.log('Posted conflict resolution comment successfully.');
  } else {
    console.warn('Failed to post comment:', res.status, typeof res.body === 'object' ? JSON.stringify(res.body) : res.body);
  }
}

function formatResolutionComment(resolution) {
  if (!resolution.conflict_detected) {
    return `## 🤖 AI Conflict Resolver

No conflicts detected in this ${CONTEXT_TYPE}. Everything appears to be in order.

*Resolution confidence: ${resolution.confidence || 'high'}*`;
  }

  const severityEmoji = {
    low: '🟡',
    medium: '🟠', 
    high: '🔴',
    critical: '🚨'
  };

  const urgencyEmoji = {
    low: '⏰',
    medium: '⚡',
    high: '🚨'
  };

  let comment = [
    `## 🤖 AI Conflict Resolver`,
    ``,
    `${severityEmoji[resolution.severity] || '🔍'} **Conflict Detected:** ${resolution.conflict_type} conflict`,
    `${urgencyEmoji[resolution.urgency] || '⏰'} **Urgency:** ${resolution.urgency}`,
    ``,
    `### Summary`,
    resolution.summary,
    ``,
    `### Resolution Steps`,
  ];

  resolution.resolution_steps.forEach((step, i) => {
    comment.push(`${i + 1}. ${step}`);
  });

  comment.push(``);

  if (resolution.recommended_assignee) {
    comment.push(`**Recommended Assignee:** @${resolution.recommended_assignee}`);
  }

  if (resolution.automated_fix_possible) {
    comment.push(`✅ **Automated fix possible:** This conflict may be resolvable automatically`);
  }

  if (resolution.follow_up_required) {
    comment.push(`⚠️ **Follow-up required:** Additional manual intervention needed after initial resolution`);
  }

  comment.push(``);
  comment.push(`*Powered by Gemini Pro 2.5 AI Conflict Resolution System*`);

  return comment.join('\n');
}

(async function main() {
  try {
    console.log(`Starting AI conflict resolution for ${CONTEXT_TYPE} #${ISSUE_NUMBER}`);
    
    // Get issue/PR context
    const context = await getIssueContext();
    console.log(`Retrieved ${context.comments.length} comments and ${context.files.length} files`);
    
    // Build conflict analysis prompt
    const prompt = buildConflictResolutionPrompt(context);
    
    // Call Gemini for conflict analysis
    const requestPayload = {
      model: MODEL,
      input: prompt,
      meta: {
        issue_number: ISSUE_NUMBER,
        context_type: CONTEXT_TYPE,
        title: ISSUE_TITLE
      },
      options: {
        temperature: 0.1, // Low temperature for consistent conflict resolution
        max_output_tokens: 1500
      }
    };

    console.log('Analyzing conflict with AI...');
    const token = ACCESS_TOKEN || API_KEY;
    const res = await postJson(API_ENDPOINT, token, requestPayload, true);

    // Save artifact
    const artifactsDir = './artifacts';
    if (!existsSync(artifactsDir)) mkdirSync(artifactsDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const artifactPath = `${artifactsDir}/conflict-resolution-${ISSUE_NUMBER}-${timestamp}.json`;
    
    const artifact = {
      meta: requestPayload.meta,
      request: {
        model: requestPayload.model,
        options: requestPayload.options
      },
      response: res,
      generated_at: new Date().toISOString()
    };
    
    writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));
    console.log('Wrote conflict analysis artifact:', artifactPath);

    // Parse AI response and post comment
    let parsedOutput = null;
    if (res && res.body) {
      if (typeof res.body === 'object') {
        parsedOutput = res.body;
      } else if (typeof res.body === 'string') {
        const match = res.body.match(/(\{[\s\S]*\})/m);
        if (match) {
          try { 
            parsedOutput = JSON.parse(match[1]); 
          } catch { 
            parsedOutput = null; 
          }
        }
      }
    }

    if (parsedOutput && typeof parsedOutput === 'object') {
      const commentText = formatResolutionComment(parsedOutput);
      await postIssueComment(ISSUE_NUMBER, commentText);
      console.log('Posted conflict resolution comment');
    } else {
      console.warn('Could not parse AI response for comment posting');
      // Post a fallback comment
      const fallbackComment = `## 🤖 AI Conflict Resolver

I detected a potential conflict in this ${CONTEXT_TYPE} but encountered an issue analyzing it fully. 

**Manual review recommended:** Please review the recent changes and comments for any conflicts that need resolution.

*If this appears to be a false positive, you can ignore this message.*`;
      
      await postIssueComment(ISSUE_NUMBER, fallbackComment);
    }

  } catch (error) {
    console.error('Error in conflict resolution:', error);
    
    // Post error notification
    const errorComment = `## 🤖 AI Conflict Resolver - Error

I encountered an error while analyzing this ${CONTEXT_TYPE} for conflicts:

\`\`\`
${error.message}
\`\`\`

**Manual review recommended:** Please check for any conflicts manually.

*This is an automated message from the AI Conflict Resolution system.*`;
    
    try {
      await postIssueComment(ISSUE_NUMBER, errorComment);
    } catch (commentError) {
      console.error('Failed to post error comment:', commentError);
    }
    
    process.exit(1);
  }
})();

async function postIssueComment(issueNumber, bodyText) {
  const appToken = process.env.GITHUB_APP_INSTALLATION_TOKEN || null;
  const repoToken = process.env.GITHUB_TOKEN || null;
  const tokenToUse = appToken || repoToken;
  
  if (!tokenToUse) {
    console.warn('No token available for posting comment; skipping.');
    return;
  }
  
  if (!issueNumber) {
    console.warn('No issue number available; skipping comment.');
    return;
  }

  const remoteUrl = run("git remote get-url origin || true");
  const m = (remoteUrl || '').match(/[:\/]([^\/]*)\/([^\/]*?)(?:\.git)?$/);
  if (!m) {
    console.warn('Cannot parse owner/repo from git remote; skipping comment.');
    return;
  }
  
  const owner = m[1];
  const repo = m[2];
  const url = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`;
  const payload = { body: bodyText };
  
  const res = await postJson(url, tokenToUse, payload, true);
  if (res.status >= 200 && res.status < 300) {
    console.log('Posted conflict resolution comment successfully.');
  } else {
    console.warn('Failed to post comment:', res.status, typeof res.body === 'object' ? JSON.stringify(res.body) : res.body);
  }
}