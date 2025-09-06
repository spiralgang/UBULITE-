/**
 * Puter.js AI Development Assistant
 * AI-powered development tools using puter.js
 */

const { PuterClientManager, PuterErrorHandler } = require('../integration/puter-core-utils.js');

/**
 * AI Code Reviewer using Puter.js
 */
class PuterCodeReviewer {
  constructor() {
    this.clientManager = new PuterClientManager();
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      await this.clientManager.initialize();
      this.initialized = true;
    }
  }

  async reviewCode(codeContent, options = {}) {
    await this.initialize();
    
    const client = this.clientManager.getClient();
    if (!client || !client.ai) {
      throw new Error('Puter.js AI not available');
    }

    const prompt = this.buildReviewPrompt(codeContent, options);
    
    try {
      const response = await client.ai.chat(prompt, {
        model: options.model || 'gpt-4o',
        temperature: 0.1
      });
      
      return this.parseReviewResponse(response);
    } catch (error) {
      return PuterErrorHandler.handleError(error, 'code-review');
    }
  }

  buildReviewPrompt(code, options) {
    const language = options.language || 'javascript';
    const focusAreas = options.focusAreas || ['bugs', 'performance', 'style', 'security'];

    return `Please review this ${language} code and provide feedback on:
${focusAreas.map(area => `- ${area}`).join('\n')}

Code to review:
\`\`\`${language}
${code}
\`\`\`

Provide structured feedback in JSON format with: issues, suggestions, rating, summary`;
  }

  parseReviewResponse(response) {
    try {
      if (response.content) {
        const parsed = JSON.parse(response.content);
        return { success: true, review: parsed };
      }
      return { success: true, review: { summary: response.content || 'Review completed' } };
    } catch {
      return { success: true, review: { summary: 'Review completed but parsing failed' } };
    }
  }
}

/**
 * AI Documentation Generator using Puter.js
 */
class PuterDocGenerator {
  constructor() {
    this.clientManager = new PuterClientManager();
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      await this.clientManager.initialize();
      this.initialized = true;
    }
  }

  async generateDocs(codeContent, options = {}) {
    await this.initialize();
    
    const client = this.clientManager.getClient();
    if (!client || !client.ai) {
      throw new Error('Puter.js AI not available');
    }

    const prompt = this.buildDocPrompt(codeContent, options);
    
    try {
      const response = await client.ai.chat(prompt, {
        model: options.model || 'gpt-4o',
        temperature: 0.2
      });
      
      return { success: true, documentation: response.content || response };
    } catch (error) {
      return PuterErrorHandler.handleError(error, 'doc-generation');
    }
  }

  buildDocPrompt(code, options) {
    const format = options.format || 'markdown';
    const includeExamples = options.includeExamples !== false;

    return `Generate ${format} documentation for this code:

\`\`\`javascript
${code}
\`\`\`

Include:
- Function/class descriptions
- Parameter documentation
- Return value descriptions
${includeExamples ? '- Usage examples' : ''}
- Type information where applicable

Format as clean ${format}.`;
  }
}

/**
 * AI Test Generator using Puter.js
 */
class PuterTestGenerator {
  constructor() {
    this.clientManager = new PuterClientManager();
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      await this.clientManager.initialize();
      this.initialized = true;
    }
  }

  async generateTests(codeContent, options = {}) {
    await this.initialize();
    
    const client = this.clientManager.getClient();
    if (!client || !client.ai) {
      throw new Error('Puter.js AI not available');
    }

    const prompt = this.buildTestPrompt(codeContent, options);
    
    try {
      const response = await client.ai.chat(prompt, {
        model: options.model || 'gpt-4o',
        temperature: 0.3
      });
      
      return { success: true, tests: response.content || response };
    } catch (error) {
      return PuterErrorHandler.handleError(error, 'test-generation');
    }
  }

  buildTestPrompt(code, options) {
    const framework = options.framework || 'jest';
    const coverage = options.coverage || 'basic';

    return `Generate ${framework} tests for this code with ${coverage} coverage:

\`\`\`javascript
${code}
\`\`\`

Include:
- Unit tests for all functions
- Edge case testing
- Error handling tests
- Mock usage where appropriate

Generate complete, runnable ${framework} test code.`;
  }
}

/**
 * AI Refactoring Assistant using Puter.js
 */
class PuterRefactorer {
  constructor() {
    this.clientManager = new PuterClientManager();
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      await this.clientManager.initialize();
      this.initialized = true;
    }
  }

  async suggestRefactoring(codeContent, options = {}) {
    await this.initialize();
    
    const client = this.clientManager.getClient();
    if (!client || !client.ai) {
      throw new Error('Puter.js AI not available');
    }

    const prompt = this.buildRefactorPrompt(codeContent, options);
    
    try {
      const response = await client.ai.chat(prompt, {
        model: options.model || 'gpt-4o',
        temperature: 0.2
      });
      
      return { success: true, suggestions: response.content || response };
    } catch (error) {
      return PuterErrorHandler.handleError(error, 'refactoring');
    }
  }

  buildRefactorPrompt(code, options) {
    const goals = options.goals || ['readability', 'performance', 'maintainability'];

    return `Suggest refactoring improvements for this code focusing on:
${goals.map(goal => `- ${goal}`).join('\n')}

Code to refactor:
\`\`\`javascript
${code}
\`\`\`

Provide:
- Specific improvement suggestions
- Refactored code examples
- Explanation of benefits
- Risk assessment for each change`;
  }
}

// Export classes
module.exports = {
  PuterCodeReviewer,
  PuterDocGenerator,
  PuterTestGenerator,
  PuterRefactorer
};