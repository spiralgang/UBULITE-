/**
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
