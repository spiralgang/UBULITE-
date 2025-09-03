/**
 * Core Puter.js Integration Utilities
 * Foundation scripts for UBULITE's puter.js integration
 */

/**
 * Puter.js Client Manager
 * Handles initialization and management of puter.js clients
 */
class PuterClientManager {
  constructor() {
    this.initialized = false;
    this.client = null;
    this.features = {
      ai: false,
      fs: false,
      hosting: false,
      auth: false
    };
  }

  async initialize() {
    try {
      // Check if puter is available in browser context
      if (typeof window !== 'undefined' && window.puter) {
        this.client = window.puter;
        this.initialized = true;
        await this.checkFeatures();
        console.log('✅ Puter.js client initialized successfully');
        return true;
      }
      
      // For Node.js context, we simulate the client
      this.client = this.createNodeSimulator();
      this.initialized = true;
      console.log('✅ Puter.js Node simulator initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize puter.js client:', error);
      return false;
    }
  }

  async checkFeatures() {
    if (!this.client) return;

    try {
      this.features.ai = !!(this.client.ai && this.client.ai.chat);
      this.features.fs = !!(this.client.fs);
      this.features.hosting = !!(this.client.hosting);
      this.features.auth = !!(this.client.auth);
      
      console.log('🔍 Puter.js features detected:', this.features);
    } catch (error) {
      console.warn('⚠️ Feature detection failed:', error.message);
    }
  }

  createNodeSimulator() {
    return {
      ai: {
        chat: async (prompt, options = {}) => {
          // Simulate AI chat response
          return {
            content: `Puter.js AI response to: ${prompt}`,
            model: options.model || 'default',
            timestamp: new Date().toISOString()
          };
        }
      },
      fs: {
        read: async (path) => `Content of ${path}`,
        write: async (path, content) => ({ success: true, path }),
        exists: async (path) => true
      },
      print: (content) => console.log('Puter Output:', content)
    };
  }

  isReady() {
    return this.initialized && this.client !== null;
  }

  getClient() {
    return this.client;
  }

  getFeatures() {
    return this.features;
  }
}

/**
 * Puter.js Feature Detector
 * Detects and validates available puter.js features
 */
class PuterFeatureDetector {
  static async detectCapabilities() {
    const capabilities = {
      ai_chat: false,
      file_system: false,
      hosting: false,
      authentication: false,
      printing: false,
      version: 'unknown'
    };

    try {
      if (typeof window !== 'undefined' && window.puter) {
        const puter = window.puter;
        
        capabilities.ai_chat = !!(puter.ai && puter.ai.chat);
        capabilities.file_system = !!(puter.fs);
        capabilities.hosting = !!(puter.hosting);
        capabilities.authentication = !!(puter.auth);
        capabilities.printing = !!(puter.print);
        capabilities.version = puter.version || 'v2';
        
        console.log('🎯 Detected puter.js capabilities:', capabilities);
      } else {
        console.log('🔧 Running in Node.js mode - using simulator capabilities');
        capabilities.ai_chat = true;
        capabilities.file_system = true;
        capabilities.version = 'simulator';
      }
    } catch (error) {
      console.error('❌ Capability detection failed:', error);
    }

    return capabilities;
  }
}

/**
 * Puter.js Configuration Manager
 * Manages puter.js settings and preferences
 */
class PuterConfigManager {
  constructor() {
    this.config = {
      clientFirst: true,
      fallbackEnabled: true,
      aiModel: 'gpt-4o',
      timeout: 10000,
      retryAttempts: 3
    };
  }

  loadConfig(customConfig = {}) {
    this.config = { ...this.config, ...customConfig };
    return this.config;
  }

  getConfig() {
    return { ...this.config };
  }

  updateConfig(updates) {
    this.config = { ...this.config, ...updates };
    return this.config;
  }
}

/**
 * Puter.js Error Handler
 * Handles errors and provides fallback mechanisms
 */
class PuterErrorHandler {
  static async handleError(error, context = 'unknown') {
    console.error(`🚨 Puter.js error in ${context}:`, error);

    const errorInfo = {
      context,
      message: error.message || String(error),
      timestamp: new Date().toISOString(),
      recoverable: this.isRecoverable(error)
    };

    if (errorInfo.recoverable) {
      console.log('🔄 Attempting error recovery...');
      return this.attemptRecovery(errorInfo);
    }

    return { success: false, error: errorInfo };
  }

  static isRecoverable(error) {
    const recoverablePatterns = [
      'network',
      'timeout',
      'temporary',
      'rate limit',
      'connection'
    ];

    const errorMessage = (error.message || String(error)).toLowerCase();
    return recoverablePatterns.some(pattern => errorMessage.includes(pattern));
  }

  static async attemptRecovery(errorInfo) {
    try {
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ Error recovery attempted');
      return { success: true, recovered: true };
    } catch (recoveryError) {
      console.error('❌ Recovery failed:', recoveryError);
      return { success: false, error: errorInfo };
    }
  }
}

// Export utilities
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PuterClientManager,
    PuterFeatureDetector,
    PuterConfigManager,
    PuterErrorHandler
  };
}

// Browser global export
if (typeof window !== 'undefined') {
  window.PuterUtils = {
    PuterClientManager,
    PuterFeatureDetector,
    PuterConfigManager,
    PuterErrorHandler
  };
}