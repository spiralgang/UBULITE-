/**
 * UBULITE Puter.js Script Index
 * Central registry of all puter.js integrations and scripts
 * 
 * This replaces Google/Gemini dependencies with puter.js powered solutions!
 */

const path = require('path');

// Core Integration Scripts
const CORE_SCRIPTS = {
  'puter-core-utils': {
    path: './integration/puter-core-utils.js',
    description: 'Core puter.js utilities and client management',
    exports: ['PuterClientManager', 'PuterFeatureDetector', 'PuterConfigManager', 'PuterErrorHandler'],
    category: 'core'
  }
};

// Conflict Resolution Scripts  
const CONFLICT_RESOLUTION_SCRIPTS = {
  'puter-conflict-resolver': {
    path: './conflict-resolution/puter-conflict-resolver.js',
    description: 'AI-powered conflict detection and resolution using puter.js (replaces Gemini)',
    exports: ['PuterAIClient', 'ConflictDetector', 'GitHubIntegration'],
    category: 'conflict-resolution',
    replaces: 'Google Gemini AI'
  }
};

// AI Assistance Scripts
const AI_ASSISTANCE_SCRIPTS = {
  'puter-dev-assistant': {
    path: './ai-assistance/puter-dev-assistant.js',
    description: 'AI-powered development tools using puter.js',
    exports: ['PuterCodeReviewer', 'PuterDocGenerator', 'PuterTestGenerator', 'PuterRefactorer'],
    category: 'ai-assistance'
  }
};

// Automation Scripts
const AUTOMATION_SCRIPTS = {
  'puter-quality-automation': {
    path: './automation/puter-quality-automation.js',
    description: 'Automated code quality checking and dependency management',
    exports: ['PuterQualityChecker', 'PuterDependencyManager'],
    category: 'automation'
  },
  'puter-ubulite-integration': {
    path: './automation/puter-ubulite-integration.js', 
    description: 'UBULITE system integration with puter.js capabilities',
    exports: ['PuterTerminalIntegration', 'PuterAppManager', 'PuterThemeManager'],
    category: 'automation'
  }
};

// Template Scripts
const TEMPLATE_SCRIPTS = {
  'puter-templates': {
    path: './templates/puter-templates.js',
    description: 'Reusable puter.js script templates and generators',
    exports: ['AI_CHAT_TEMPLATE', 'FILE_SYSTEM_TEMPLATE', 'AUTH_TEMPLATE', 'COMPLETE_INTEGRATION_TEMPLATE'],
    category: 'templates'
  },
  'ai-chat-template': {
    path: './templates/ai-chat-template.js',
    description: 'Ready-to-use AI chat integration template',
    category: 'templates',
    type: 'template'
  },
  'file-system-template': {
    path: './templates/file-system-template.js',
    description: 'File system integration template',
    category: 'templates',
    type: 'template'
  },
  'auth-template': {
    path: './templates/auth-template.js',
    description: 'Authentication integration template',
    category: 'templates',
    type: 'template'
  },
  'complete-integration': {
    path: './templates/complete-integration.html',
    description: 'Complete puter.js integration example with UI',
    category: 'templates',
    type: 'demo'
  }
};

// All Scripts Registry
const ALL_SCRIPTS = {
  ...CORE_SCRIPTS,
  ...CONFLICT_RESOLUTION_SCRIPTS,
  ...AI_ASSISTANCE_SCRIPTS,
  ...AUTOMATION_SCRIPTS,
  ...TEMPLATE_SCRIPTS
};

/**
 * Puter.js Script Loader
 * Dynamically loads and manages puter.js scripts
 */
class PuterScriptLoader {
  constructor() {
    this.loadedScripts = new Map();
    this.baseDir = __dirname;
  }

  /**
   * Load a specific puter.js script
   */
  loadScript(scriptName) {
    if (this.loadedScripts.has(scriptName)) {
      return this.loadedScripts.get(scriptName);
    }

    const scriptInfo = ALL_SCRIPTS[scriptName];
    if (!scriptInfo) {
      throw new Error(`Script '${scriptName}' not found in registry`);
    }

    try {
      const fullPath = path.resolve(this.baseDir, scriptInfo.path);
      const scriptModule = require(fullPath);
      
      this.loadedScripts.set(scriptName, {
        module: scriptModule,
        info: scriptInfo,
        loadedAt: new Date().toISOString()
      });

      console.log(`✅ Loaded puter.js script: ${scriptName}`);
      return scriptModule;
    } catch (error) {
      console.error(`❌ Failed to load puter.js script '${scriptName}':`, error.message);
      throw error;
    }
  }

  /**
   * Load all scripts in a category
   */
  loadCategory(category) {
    const categoryScripts = Object.entries(ALL_SCRIPTS)
      .filter(([name, info]) => info.category === category);

    const loaded = {};
    for (const [scriptName, scriptInfo] of categoryScripts) {
      try {
        loaded[scriptName] = this.loadScript(scriptName);
      } catch (error) {
        console.warn(`⚠️ Failed to load ${scriptName}:`, error.message);
      }
    }

    return loaded;
  }

  /**
   * Get script information
   */
  getScriptInfo(scriptName) {
    return ALL_SCRIPTS[scriptName] || null;
  }

  /**
   * List all available scripts
   */
  listScripts(category = null) {
    if (category) {
      return Object.entries(ALL_SCRIPTS)
        .filter(([name, info]) => info.category === category)
        .reduce((acc, [name, info]) => {
          acc[name] = info;
          return acc;
        }, {});
    }
    return ALL_SCRIPTS;
  }

  /**
   * Get scripts that replace Google services
   */
  getGoogleReplacements() {
    return Object.entries(ALL_SCRIPTS)
      .filter(([name, info]) => info.replaces)
      .reduce((acc, [name, info]) => {
        acc[name] = {
          ...info,
          replacing: info.replaces
        };
        return acc;
      }, {});
  }

  /**
   * Initialize all core puter.js components
   */
  async initializeCore() {
    console.log('🚀 Initializing UBULITE Puter.js System...');
    
    // Load core utilities first
    const coreUtils = this.loadScript('puter-core-utils');
    const { PuterClientManager } = coreUtils;
    
    // Initialize client manager
    const clientManager = new PuterClientManager();
    await clientManager.initialize();
    
    console.log('✅ Puter.js core system initialized - Google services replaced!');
    return clientManager;
  }

  /**
   * Get system statistics
   */
  getStats() {
    const stats = {
      total_scripts: Object.keys(ALL_SCRIPTS).length,
      categories: {},
      loaded_scripts: this.loadedScripts.size,
      google_replacements: Object.keys(this.getGoogleReplacements()).length
    };

    // Count by category
    Object.values(ALL_SCRIPTS).forEach(info => {
      stats.categories[info.category] = (stats.categories[info.category] || 0) + 1;
    });

    return stats;
  }
}

// Export everything
module.exports = {
  ALL_SCRIPTS,
  CORE_SCRIPTS,
  CONFLICT_RESOLUTION_SCRIPTS,
  AI_ASSISTANCE_SCRIPTS,
  AUTOMATION_SCRIPTS,
  TEMPLATE_SCRIPTS,
  PuterScriptLoader
};

// CLI usage when run directly
if (require.main === module) {
  const loader = new PuterScriptLoader();
  const stats = loader.getStats();
  
  console.log('🎯 UBULITE Puter.js Script System Overview');
  console.log('==========================================');
  console.log(`📊 Total Scripts: ${stats.total_scripts}`);
  console.log(`🔄 Google Replacements: ${stats.google_replacements}`);
  console.log('📂 Categories:');
  Object.entries(stats.categories).forEach(([category, count]) => {
    console.log(`   • ${category}: ${count} scripts`);
  });
  
  console.log('\n🚀 Google/Gemini Services Replaced:');
  const replacements = loader.getGoogleReplacements();
  Object.entries(replacements).forEach(([name, info]) => {
    console.log(`   ❌ ${info.replacing} → ✅ ${name} (puter.js powered)`);
  });
  
  console.log('\n🎉 All systems ready - puter.js is badass and reliable!');
}