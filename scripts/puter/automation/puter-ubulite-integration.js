/**
 * UBULITE System Integration with Puter.js
 * Integrates UBULITE system features with puter.js capabilities
 */

const { PuterClientManager } = require('../integration/puter-core-utils.js');
const { execSync } = require('child_process');

/**
 * UBULITE Terminal Integration with Puter.js
 */
class PuterTerminalIntegration {
  constructor() {
    this.clientManager = new PuterClientManager();
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      await this.clientManager.initialize();
      this.initialized = true;
      console.log('🖥️  UBULITE Terminal Puter.js integration ready');
    }
  }

  async enhanceTerminalWithAI(command) {
    await this.initialize();
    
    const client = this.clientManager.getClient();
    if (!client || !client.ai) {
      return this.fallbackTerminalHelp(command);
    }

    try {
      const prompt = `User wants to run this command in UBULITE terminal: "${command}"
      
Provide:
1. Command explanation
2. Potential risks or considerations  
3. Suggested alternatives if applicable
4. Expected output description

Format as JSON: {explanation, risks, alternatives, expected_output}`;

      const response = await client.ai.chat(prompt, { model: 'gpt-4o' });
      
      return {
        success: true,
        command,
        ai_analysis: response.content || response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return this.fallbackTerminalHelp(command);
    }
  }

  fallbackTerminalHelp(command) {
    const commonCommands = {
      'ls': 'Lists directory contents',
      'cd': 'Changes current directory', 
      'mkdir': 'Creates new directory',
      'rm': 'Removes files (use with caution)',
      'cp': 'Copies files or directories',
      'mv': 'Moves or renames files',
      'cat': 'Displays file contents',
      'grep': 'Searches text patterns',
      'find': 'Searches for files and directories',
      'ps': 'Shows running processes',
      'top': 'Shows system processes',
      'df': 'Shows disk space usage',
      'free': 'Shows memory usage'
    };

    const baseCommand = command.split(' ')[0];
    const explanation = commonCommands[baseCommand] || 'Command not in basic reference';

    return {
      success: true,
      command,
      explanation,
      source: 'fallback',
      timestamp: new Date().toISOString()
    };
  }

  async getSmartCompletions(partialCommand) {
    await this.initialize();
    
    const client = this.clientManager.getClient();
    if (!client || !client.ai) {
      return this.getBasicCompletions(partialCommand);
    }

    try {
      const prompt = `User is typing this partial command in UBULITE terminal: "${partialCommand}"
      
Suggest 3-5 most likely command completions based on:
- Common Linux/Unix commands
- UBULITE specific commands
- Current context

Return as JSON array: ["completion1", "completion2", ...]`;

      const response = await client.ai.chat(prompt, { model: 'gpt-4o', temperature: 0.3 });
      
      return {
        success: true,
        partial: partialCommand,
        completions: this.parseCompletions(response.content || response),
        source: 'ai'
      };
    } catch (error) {
      return this.getBasicCompletions(partialCommand);
    }
  }

  getBasicCompletions(partial) {
    const commands = ['ls', 'cd', 'mkdir', 'rm', 'cp', 'mv', 'cat', 'grep', 'find', 'ps', 'top', 'df', 'free', 'chmod', 'chown', 'tar', 'zip', 'unzip', 'curl', 'wget', 'git', 'npm', 'node', 'python', 'vim', 'nano'];
    
    const completions = commands.filter(cmd => cmd.startsWith(partial)).slice(0, 5);
    
    return {
      success: true,
      partial,
      completions,
      source: 'basic'
    };
  }

  parseCompletions(aiResponse) {
    try {
      if (typeof aiResponse === 'string') {
        const parsed = JSON.parse(aiResponse);
        if (Array.isArray(parsed)) {
          return parsed.slice(0, 5); // Limit to 5 completions
        }
      }
      return ['ls', 'cd', 'cat']; // Fallback
    } catch {
      return ['ls', 'cd', 'cat']; // Fallback
    }
  }
}

/**
 * UBULITE App Manager with Puter.js
 */
class PuterAppManager {
  constructor() {
    this.clientManager = new PuterClientManager();
    this.initialized = false;
    this.installedApps = [];
  }

  async initialize() {
    if (!this.initialized) {
      await this.clientManager.initialize();
      await this.loadInstalledApps();
      this.initialized = true;
      console.log('📱 UBULITE App Manager Puter.js integration ready');
    }
  }

  async loadInstalledApps() {
    // Load list of installed UBULITE apps
    this.installedApps = [
      { name: 'terminal', status: 'active', description: 'Terminal emulator' },
      { name: 'calculator', status: 'active', description: 'Calculator application' },
      { name: 'notepad', status: 'active', description: 'Text editor' },
      { name: 'file-manager', status: 'active', description: 'File browser' },
      { name: 'settings', status: 'active', description: 'System settings' },
      { name: 'task-manager', status: 'active', description: 'Process manager' }
    ];
  }

  async recommendApps(userQuery) {
    await this.initialize();
    
    const client = this.clientManager.getClient();
    if (!client || !client.ai) {
      return this.getBasicAppRecommendations(userQuery);
    }

    try {
      const prompt = `User is looking for: "${userQuery}"
      
Based on UBULITE's capabilities and user needs, recommend relevant applications or features:

Currently available apps: ${this.installedApps.map(app => app.name).join(', ')}

Provide JSON response: {
  "recommended_apps": ["app1", "app2"],
  "explanation": "why these apps fit the user's needs",
  "alternatives": "other options or workarounds"
}`;

      const response = await client.ai.chat(prompt, { model: 'gpt-4o' });
      
      return {
        success: true,
        query: userQuery,
        ai_recommendations: response.content || response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return this.getBasicAppRecommendations(userQuery);
    }
  }

  getBasicAppRecommendations(query) {
    const queryLower = query.toLowerCase();
    const recommendations = [];

    if (queryLower.includes('file') || queryLower.includes('folder')) {
      recommendations.push('file-manager');
    }
    if (queryLower.includes('text') || queryLower.includes('edit') || queryLower.includes('note')) {
      recommendations.push('notepad');
    }
    if (queryLower.includes('calc') || queryLower.includes('math')) {
      recommendations.push('calculator');
    }
    if (queryLower.includes('terminal') || queryLower.includes('command')) {
      recommendations.push('terminal');
    }
    if (queryLower.includes('process') || queryLower.includes('task')) {
      recommendations.push('task-manager');
    }

    return {
      success: true,
      query,
      recommended_apps: recommendations,
      source: 'basic'
    };
  }

  getInstalledApps() {
    return this.installedApps;
  }
}

/**
 * UBULITE Theme Manager with Puter.js  
 */
class PuterThemeManager {
  constructor() {
    this.clientManager = new PuterClientManager();
    this.initialized = false;
    this.availableThemes = [
      { name: 'dark', description: 'Dark theme for low-light environments' },
      { name: 'light', description: 'Light theme for bright environments' },
      { name: 'ubuntu', description: 'Ubuntu-inspired theme' },
      { name: 'retro', description: '90s VCR-style theme' },
      { name: 'matrix', description: 'Matrix-inspired green theme' },
      { name: 'minimal', description: 'Clean minimal theme' }
    ];
  }

  async initialize() {
    if (!this.initialized) {
      await this.clientManager.initialize();
      this.initialized = true;
      console.log('🎨 UBULITE Theme Manager Puter.js integration ready');
    }
  }

  async generateCustomTheme(preferences) {
    await this.initialize();
    
    const client = this.clientManager.getClient();
    if (!client || !client.ai) {
      return this.createBasicTheme(preferences);
    }

    try {
      const prompt = `Create a UBULITE theme based on these preferences:
${JSON.stringify(preferences, null, 2)}

Generate CSS theme variables and suggest theme name:
{
  "theme_name": "suggested name",
  "css_variables": {
    "--bg-primary": "#color",
    "--bg-secondary": "#color", 
    "--text-primary": "#color",
    "--text-secondary": "#color",
    "--accent": "#color",
    "--border": "#color"
  },
  "description": "theme description"
}`;

      const response = await client.ai.chat(prompt, { model: 'gpt-4o', temperature: 0.4 });
      
      return {
        success: true,
        preferences,
        ai_theme: response.content || response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return this.createBasicTheme(preferences);
    }
  }

  createBasicTheme(preferences) {
    const { mood = 'neutral', brightness = 'medium' } = preferences;
    
    let theme = {
      theme_name: `custom-${mood}-${brightness}`,
      css_variables: {
        '--bg-primary': brightness === 'dark' ? '#1a1a1a' : '#ffffff',
        '--bg-secondary': brightness === 'dark' ? '#2d2d2d' : '#f5f5f5',
        '--text-primary': brightness === 'dark' ? '#ffffff' : '#333333',
        '--text-secondary': brightness === 'dark' ? '#cccccc' : '#666666',
        '--accent': mood === 'warm' ? '#ff6b6b' : (mood === 'cool' ? '#4ecdc4' : '#007acc'),
        '--border': brightness === 'dark' ? '#404040' : '#dddddd'
      },
      description: `Custom ${mood} theme with ${brightness} brightness`
    };

    return {
      success: true,
      preferences,
      theme,
      source: 'basic'
    };
  }

  getAvailableThemes() {
    return this.availableThemes;
  }
}

module.exports = {
  PuterTerminalIntegration,
  PuterAppManager,
  PuterThemeManager
};