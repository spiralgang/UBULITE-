#!/usr/bin/env node
/**
 * GitHub App Token Generator for UBULITE
 * Generates installation tokens for GitHub App authentication
 */

const crypto = require('crypto');
const https = require('https');

const APP_ID = process.env.GITHUB_APP_ID;
const INSTALLATION_ID = process.env.GITHUB_APP_INSTALLATION_ID;
const PRIVATE_KEY = process.env.GITHUB_APP_PRIVATE_KEY;

function generateJWT() {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now - 60,
    exp: now + (10 * 60),
    iss: APP_ID
  };
  
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  const signature = crypto
    .createSign('sha256')
    .update(`${header}.${body}`)
    .sign(PRIVATE_KEY, 'base64url');
  
  return `${header}.${body}.${signature}`;
}

async function getInstallationToken() {
  return new Promise((resolve, reject) => {
    const jwt = generateJWT();
    const postData = JSON.stringify({});
    
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: `/app/installations/${INSTALLATION_ID}/access_tokens`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'UBULITE-GitHub-App',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 201) {
            resolve(response.token);
          } else {
            reject(new Error(`GitHub API error: ${res.statusCode} ${data}`));
          }
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  try {
    if (!APP_ID || !INSTALLATION_ID || !PRIVATE_KEY) {
      throw new Error('Missing required environment variables: GITHUB_APP_ID, GITHUB_APP_INSTALLATION_ID, GITHUB_APP_PRIVATE_KEY');
    }
    
    const token = await getInstallationToken();
    console.log(token);
  } catch (error) {
    console.error('Error generating token:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateJWT, getInstallationToken };