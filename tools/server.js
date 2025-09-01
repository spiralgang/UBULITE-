/**
 * Server module for UBULITE
 * Handles server-side operations and API endpoints
 */

const express = require('express');
const { ProviderManager } = require('./providers');

class UBULITEServer {
  constructor(port = 3000) {
    this.app = express();
    this.port = port;
    this.providerManager = new ProviderManager();
    
    this.setupMiddleware();
    this.setupRoutes();
  }
  
  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.static('public'));
    
    // CORS middleware
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      next();
    });
  }
  
  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });
    
    // AI endpoints
    this.app.post('/api/ai/chat', async (req, res) => {
      try {
        const { prompt, model = 'gpt-3.5-turbo' } = req.body;
        
        if (!process.env.OPENAI_API_KEY) {
          return res.status(502).json({ 
            error: 'No API key configured',
            message: 'Please use client-side model or configure OPENAI_API_KEY' 
          });
        }
        
        // Mock AI response
        const response = await this.providerManager.callProvider('openai', 'chat', 'completions', {
          model,
          messages: [{ role: 'user', content: prompt }]
        });
        
        res.json(response);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Code review endpoint
    this.app.post('/api/review/gemini', async (req, res) => {
      try {
        const { files, model = 'gemini-pro-2.5' } = req.body;
        
        const response = await this.providerManager.callProvider('gemini', 'review', 'analyze', {
          model,
          files
        });
        
        res.json(response);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Security audit endpoint
    this.app.post('/api/security/audit', async (req, res) => {
      try {
        const { files, options = {} } = req.body;
        
        // Mock security audit
        const issues = [
          {
            type: 'security',
            severity: 'medium',
            file: files[0] || 'unknown',
            line: 42,
            message: 'Potential security vulnerability detected',
            suggestion: 'Use input validation'
          }
        ];
        
        res.json({ issues, status: 'completed' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // File upload endpoint
    this.app.post('/api/upload', (req, res) => {
      // Mock file upload
      res.json({ 
        success: true, 
        fileId: 'mock-file-id',
        message: 'File uploaded successfully' 
      });
    });
    
    // Error handling middleware
    this.app.use((error, req, res, next) => {
      console.error('Server error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    });
    
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Endpoint not found' });
    });
  }
  
  start() {
    this.app.listen(this.port, () => {
      console.log(`UBULITE server running on port ${this.port}`);
    });
  }
  
  stop() {
    if (this.server) {
      this.server.close();
    }
  }
}

module.exports = { UBULITEServer };

// Start server if this file is run directly
if (require.main === module) {
  const server = new UBULITEServer(process.env.PORT || 3000);
  server.start();
}