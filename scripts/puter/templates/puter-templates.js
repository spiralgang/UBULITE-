/**
 * Puter.js Script Templates
 * Reusable templates for common puter.js integrations
 */

/**
 * Basic Puter.js AI Chat Template
 */
const AI_CHAT_TEMPLATE = `/**
 * Puter.js AI Chat Integration Template
 * Use this template to add AI chat functionality to your application
 */

class PuterAIChat {
  constructor(options = {}) {
    this.model = options.model || 'gpt-4o';
    this.temperature = options.temperature || 0.7;
    this.maxTokens = options.maxTokens || 1000;
    this.initialized = false;
  }

  async initialize() {
    if (typeof puter === 'undefined') {
      throw new Error('Puter.js not available. Include the puter script first.');
    }
    
    if (!puter.ai || !puter.ai.chat) {
      throw new Error('Puter.js AI features not available.');
    }
    
    this.initialized = true;
    console.log('✅ Puter.js AI Chat initialized');
  }

  async chat(message, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const response = await puter.ai.chat(message, {
        model: options.model || this.model,
        temperature: options.temperature || this.temperature,
        max_tokens: options.maxTokens || this.maxTokens
      });

      return {
        success: true,
        response: response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Puter AI Chat error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async streamChat(message, onChunk, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Note: Streaming support depends on puter.js implementation
      if (puter.ai.streamChat) {
        return await puter.ai.streamChat(message, onChunk, {
          model: options.model || this.model,
          temperature: options.temperature || this.temperature
        });
      } else {
        // Fallback to regular chat
        const response = await this.chat(message, options);
        if (response.success && onChunk) {
          onChunk(response.response);
        }
        return response;
      }
    } catch (error) {
      console.error('Puter Stream Chat error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Usage Example:
/*
const aiChat = new PuterAIChat({
  model: 'gpt-4o',
  temperature: 0.7
});

// Simple chat
const response = await aiChat.chat('Hello, how are you?');
console.log(response.response);

// Streaming chat
await aiChat.streamChat('Tell me a story', (chunk) => {
  console.log('Chunk:', chunk);
});
*/
`;

/**
 * Puter.js File System Template
 */
const FILE_SYSTEM_TEMPLATE = `/**
 * Puter.js File System Integration Template
 * Use this template to add file system functionality
 */

class PuterFileManager {
  constructor() {
    this.initialized = false;
  }

  async initialize() {
    if (typeof puter === 'undefined') {
      throw new Error('Puter.js not available');
    }
    
    if (!puter.fs) {
      throw new Error('Puter.js File System not available');
    }
    
    this.initialized = true;
    console.log('✅ Puter.js File Manager initialized');
  }

  async readFile(path) {
    if (!this.initialized) await this.initialize();

    try {
      const content = await puter.fs.read(path);
      return { success: true, content, path };
    } catch (error) {
      return { success: false, error: error.message, path };
    }
  }

  async writeFile(path, content) {
    if (!this.initialized) await this.initialize();

    try {
      const result = await puter.fs.write(path, content);
      return { success: true, result, path };
    } catch (error) {
      return { success: false, error: error.message, path };
    }
  }

  async fileExists(path) {
    if (!this.initialized) await this.initialize();

    try {
      const exists = await puter.fs.exists(path);
      return { success: true, exists, path };
    } catch (error) {
      return { success: false, error: error.message, path };
    }
  }

  async listFiles(directory = '/') {
    if (!this.initialized) await this.initialize();

    try {
      const files = await puter.fs.list(directory);
      return { success: true, files, directory };
    } catch (error) {
      return { success: false, error: error.message, directory };
    }
  }
}

// Usage Example:
/*
const fileManager = new PuterFileManager();

// Read a file
const fileContent = await fileManager.readFile('/path/to/file.txt');
if (fileContent.success) {
  console.log('File content:', fileContent.content);
}

// Write a file
const writeResult = await fileManager.writeFile('/path/to/newfile.txt', 'Hello World');
if (writeResult.success) {
  console.log('File written successfully');
}

// List files
const fileList = await fileManager.listFiles('/');
if (fileList.success) {
  console.log('Files:', fileList.files);
}
*/
`;

/**
 * Puter.js Authentication Template  
 */
const AUTH_TEMPLATE = `/**
 * Puter.js Authentication Template
 * Use this template to add authentication functionality
 */

class PuterAuth {
  constructor() {
    this.initialized = false;
    this.user = null;
  }

  async initialize() {
    if (typeof puter === 'undefined') {
      throw new Error('Puter.js not available');
    }
    
    if (!puter.auth) {
      throw new Error('Puter.js Authentication not available');
    }
    
    this.initialized = true;
    
    // Check if user is already logged in
    try {
      this.user = await puter.auth.getUser();
    } catch (error) {
      console.log('No user currently logged in');
    }
    
    console.log('✅ Puter.js Auth initialized');
  }

  async login(credentials) {
    if (!this.initialized) await this.initialize();

    try {
      const user = await puter.auth.login(credentials);
      this.user = user;
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async logout() {
    if (!this.initialized) await this.initialize();

    try {
      await puter.auth.logout();
      this.user = null;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getCurrentUser() {
    if (!this.initialized) await this.initialize();

    try {
      const user = await puter.auth.getUser();
      this.user = user;
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  isLoggedIn() {
    return this.user !== null;
  }

  getUser() {
    return this.user;
  }
}

// Usage Example:
/*
const auth = new PuterAuth();

// Login
const loginResult = await auth.login({
  username: 'user@example.com',
  password: 'password123'
});

if (loginResult.success) {
  console.log('Logged in as:', loginResult.user);
}

// Check current user
if (auth.isLoggedIn()) {
  console.log('Current user:', auth.getUser());
}

// Logout
await auth.logout();
*/
`;

/**
 * Complete Puter.js Integration Template
 */
const COMPLETE_INTEGRATION_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Puter.js Complete Integration Template</title>
  <script>window.FEAT_PUTER = true;</script>
  <script src="https://js.puter.com/v2/"></script>
</head>
<body>
  <div id="app">
    <h1>Puter.js Complete Integration</h1>
    
    <div id="ai-section">
      <h2>AI Chat</h2>
      <input type="text" id="ai-input" placeholder="Ask something..." />
      <button onclick="askAI()">Ask AI</button>
      <div id="ai-response"></div>
    </div>

    <div id="file-section">
      <h2>File Operations</h2>
      <button onclick="listFiles()">List Files</button>
      <button onclick="createTestFile()">Create Test File</button>
      <div id="file-output"></div>
    </div>

    <div id="auth-section">
      <h2>Authentication</h2>
      <button onclick="checkAuth()">Check Auth Status</button>
      <div id="auth-output"></div>
    </div>
  </div>

  <script>
    // Initialize Puter.js components
    let aiChat, fileManager, auth;

    async function initializePuter() {
      try {
        // Initialize AI Chat
        aiChat = new PuterAIChat();
        await aiChat.initialize();

        // Initialize File Manager
        fileManager = new PuterFileManager();
        await fileManager.initialize();

        // Initialize Auth
        auth = new PuterAuth();
        await auth.initialize();

        console.log('✅ All Puter.js components initialized');
        document.getElementById('app').style.opacity = '1';
      } catch (error) {
        console.error('❌ Failed to initialize Puter.js:', error);
        document.getElementById('app').innerHTML = \`
          <h1>Puter.js Integration Error</h1>
          <p>Failed to initialize: \${error.message}</p>
        \`;
      }
    }

    async function askAI() {
      const input = document.getElementById('ai-input');
      const output = document.getElementById('ai-response');
      
      if (!input.value.trim()) return;

      output.innerHTML = '<p>Thinking...</p>';
      
      try {
        const response = await aiChat.chat(input.value);
        if (response.success) {
          output.innerHTML = \`<p><strong>AI:</strong> \${response.response.content || response.response}</p>\`;
        } else {
          output.innerHTML = \`<p style="color: red;">Error: \${response.error}</p>\`;
        }
      } catch (error) {
        output.innerHTML = \`<p style="color: red;">Error: \${error.message}</p>\`;
      }
      
      input.value = '';
    }

    async function listFiles() {
      const output = document.getElementById('file-output');
      output.innerHTML = '<p>Loading files...</p>';

      try {
        const result = await fileManager.listFiles('/');
        if (result.success) {
          const filesList = result.files.map(file => \`<li>\${file.name || file}</li>\`).join('');
          output.innerHTML = \`<ul>\${filesList}</ul>\`;
        } else {
          output.innerHTML = \`<p style="color: red;">Error: \${result.error}</p>\`;
        }
      } catch (error) {
        output.innerHTML = \`<p style="color: red;">Error: \${error.message}</p>\`;
      }
    }

    async function createTestFile() {
      const output = document.getElementById('file-output');
      
      try {
        const content = \`Test file created at \${new Date().toISOString()}\`;
        const result = await fileManager.writeFile('/test.txt', content);
        
        if (result.success) {
          output.innerHTML = '<p style="color: green;">Test file created successfully!</p>';
        } else {
          output.innerHTML = \`<p style="color: red;">Error: \${result.error}</p>\`;
        }
      } catch (error) {
        output.innerHTML = \`<p style="color: red;">Error: \${error.message}</p>\`;
      }
    }

    async function checkAuth() {
      const output = document.getElementById('auth-output');
      
      try {
        const result = await auth.getCurrentUser();
        if (result.success && result.user) {
          output.innerHTML = \`<p style="color: green;">Logged in as: \${result.user.username || result.user.email || 'User'}</p>\`;
        } else {
          output.innerHTML = '<p>Not logged in</p>';
        }
      } catch (error) {
        output.innerHTML = \`<p style="color: red;">Error: \${error.message}</p>\`;
      }
    }

    // Initialize when page loads
    window.addEventListener('load', initializePuter);

    // Add Enter key support for AI input
    document.addEventListener('DOMContentLoaded', () => {
      const aiInput = document.getElementById('ai-input');
      if (aiInput) {
        aiInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            askAI();
          }
        });
      }
    });
  </script>

  <!-- Include the class definitions -->
  <script>\${AI_CHAT_TEMPLATE}</script>
  <script>\${FILE_SYSTEM_TEMPLATE}</script>
  <script>\${AUTH_TEMPLATE}</script>

  <style>
    body { font-family: system-ui; margin: 2rem; }
    #app { opacity: 0.5; transition: opacity 0.3s; }
    div[id$="-section"] { margin: 2rem 0; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
    input { padding: 0.5rem; margin: 0.5rem; width: 300px; }
    button { padding: 0.5rem 1rem; margin: 0.5rem; cursor: pointer; }
    #ai-response, #file-output, #auth-output { 
      margin: 1rem 0; 
      padding: 1rem; 
      background: #f5f5f5; 
      border-radius: 4px; 
      min-height: 2rem;
    }
  </style>
</body>
</html>`;

// Export all templates
module.exports = {
  AI_CHAT_TEMPLATE,
  FILE_SYSTEM_TEMPLATE,
  AUTH_TEMPLATE,
  COMPLETE_INTEGRATION_TEMPLATE
};

// Save templates to files if running in Node.js
if (typeof require !== 'undefined' && require.main === module) {
  const fs = require('fs');
  const path = require('path');

  const templates = {
    'ai-chat-template.js': AI_CHAT_TEMPLATE,
    'file-system-template.js': FILE_SYSTEM_TEMPLATE,
    'auth-template.js': AUTH_TEMPLATE,
    'complete-integration.html': COMPLETE_INTEGRATION_TEMPLATE
  };

  const templatesDir = path.dirname(__filename);

  Object.entries(templates).forEach(([filename, content]) => {
    const filepath = path.join(templatesDir, filename);
    fs.writeFileSync(filepath, content);
    console.log('✅ Saved template: ' + filepath);
  });

  console.log('🎉 All Puter.js templates saved successfully!');
}