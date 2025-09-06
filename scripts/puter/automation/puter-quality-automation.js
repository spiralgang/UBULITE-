/**
 * Puter.js Automation Scripts
 * Automated workflows and task management using puter.js
 */

const { PuterClientManager } = require('../integration/puter-core-utils.js');
const { execSync } = require('child_process');
const { writeFileSync, readFileSync, existsSync } = require('fs');

/**
 * Automated Code Quality Checker
 */
class PuterQualityChecker {
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

  async runQualityChecks(projectPath = '.') {
    await this.initialize();
    
    const results = {
      timestamp: new Date().toISOString(),
      checks: [],
      overall_score: 0,
      recommendations: []
    };

    try {
      // Run linting checks
      const lintResult = await this.runLinting(projectPath);
      results.checks.push(lintResult);

      // Check code complexity
      const complexityResult = await this.checkComplexity(projectPath);
      results.checks.push(complexityResult);

      // Security scan
      const securityResult = await this.runSecurityScan(projectPath);
      results.checks.push(securityResult);

      // Calculate overall score
      results.overall_score = this.calculateOverallScore(results.checks);
      
      // Generate AI recommendations using puter.js
      results.recommendations = await this.generateRecommendations(results.checks);

      return { success: true, results };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async runLinting(projectPath) {
    try {
      const output = execSync('npm run lint', { 
        cwd: projectPath, 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      return {
        type: 'linting',
        status: 'passed',
        score: 95,
        output: output
      };
    } catch (error) {
      return {
        type: 'linting',
        status: 'failed',
        score: 60,
        output: error.stdout || error.message
      };
    }
  }

  async checkComplexity(projectPath) {
    // Simplified complexity check
    try {
      const jsFiles = execSync('find . -name "*.js" -not -path "./node_modules/*"', {
        cwd: projectPath,
        encoding: 'utf8'
      }).split('\n').filter(f => f.trim());

      let totalComplexity = 0;
      let fileCount = 0;

      for (const file of jsFiles) {
        if (file && existsSync(`${projectPath}/${file}`)) {
          const content = readFileSync(`${projectPath}/${file}`, 'utf8');
          const complexity = this.calculateFileComplexity(content);
          totalComplexity += complexity;
          fileCount++;
        }
      }

      const averageComplexity = fileCount > 0 ? totalComplexity / fileCount : 0;
      const score = Math.max(0, 100 - averageComplexity * 2);

      return {
        type: 'complexity',
        status: score > 70 ? 'passed' : 'warning',
        score: Math.round(score),
        average_complexity: Math.round(averageComplexity),
        files_checked: fileCount
      };
    } catch (error) {
      return {
        type: 'complexity',
        status: 'error',
        score: 50,
        error: error.message
      };
    }
  }

  calculateFileComplexity(content) {
    // Simple complexity calculation based on control structures
    const complexityIndicators = [
      /if\s*\(/g,
      /else\s+if\s*\(/g,
      /for\s*\(/g,
      /while\s*\(/g,
      /switch\s*\(/g,
      /catch\s*\(/g,
      /\?\s*.*:/g // ternary operators
    ];

    let complexity = 1; // base complexity
    
    for (const indicator of complexityIndicators) {
      const matches = content.match(indicator);
      if (matches) {
        complexity += matches.length;
      }
    }

    return complexity;
  }

  async runSecurityScan(projectPath) {
    try {
      // Check for common security issues
      const issues = [];
      const jsFiles = execSync('find . -name "*.js" -not -path "./node_modules/*"', {
        cwd: projectPath,
        encoding: 'utf8'
      }).split('\n').filter(f => f.trim());

      for (const file of jsFiles) {
        if (file && existsSync(`${projectPath}/${file}`)) {
          const content = readFileSync(`${projectPath}/${file}`, 'utf8');
          const fileIssues = this.scanFileForSecurity(content, file);
          issues.push(...fileIssues);
        }
      }

      const score = Math.max(0, 100 - issues.length * 10);

      return {
        type: 'security',
        status: issues.length === 0 ? 'passed' : 'warning',
        score: score,
        issues_found: issues.length,
        issues: issues
      };
    } catch (error) {
      return {
        type: 'security',
        status: 'error',
        score: 50,
        error: error.message
      };
    }
  }

  scanFileForSecurity(content, filename) {
    const issues = [];
    
    // Check for potential security issues
    const securityPatterns = [
      { pattern: /eval\s*\(/g, issue: 'Use of eval() detected', severity: 'high' },
      { pattern: /innerHTML\s*=/g, issue: 'Direct innerHTML assignment', severity: 'medium' },
      { pattern: /document\.write\s*\(/g, issue: 'Use of document.write()', severity: 'medium' },
      { pattern: /localStorage\.setItem\s*\([^,]*password/gi, issue: 'Password in localStorage', severity: 'high' },
      { pattern: /console\.log\s*\(/g, issue: 'Console.log statement (info leak)', severity: 'low' }
    ];

    for (const { pattern, issue, severity } of securityPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        issues.push({
          file: filename,
          issue: issue,
          severity: severity,
          occurrences: matches.length
        });
      }
    }

    return issues;
  }

  calculateOverallScore(checks) {
    const scores = checks.map(check => check.score).filter(score => typeof score === 'number');
    if (scores.length === 0) return 0;
    
    const total = scores.reduce((sum, score) => sum + score, 0);
    return Math.round(total / scores.length);
  }

  async generateRecommendations(checks) {
    const client = this.clientManager.getClient();
    if (!client || !client.ai) {
      return this.generateFallbackRecommendations(checks);
    }

    try {
      const prompt = `Based on these code quality check results, provide improvement recommendations:

${checks.map(check => 
  `${check.type}: ${check.status} (score: ${check.score})`
).join('\n')}

Provide 3-5 specific, actionable recommendations for improvement.`;

      const response = await client.ai.chat(prompt, { model: 'gpt-4o' });
      
      if (response.content) {
        return response.content.split('\n').filter(line => line.trim());
      }
      
      return this.generateFallbackRecommendations(checks);
    } catch (error) {
      return this.generateFallbackRecommendations(checks);
    }
  }

  generateFallbackRecommendations(checks) {
    const recommendations = [];
    
    checks.forEach(check => {
      if (check.score < 80) {
        switch (check.type) {
          case 'linting':
            recommendations.push('Fix linting errors to improve code consistency');
            break;
          case 'complexity':
            recommendations.push('Refactor complex functions to improve maintainability');
            break;
          case 'security':
            recommendations.push('Address security issues to improve application safety');
            break;
        }
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('Code quality looks good! Consider adding more comprehensive tests');
    }

    return recommendations;
  }
}

/**
 * Automated Dependency Manager
 */
class PuterDependencyManager {
  constructor() {
    this.clientManager = new PuterClientManager();
  }

  async checkOutdatedDependencies(projectPath = '.') {
    try {
      const packageJsonPath = `${projectPath}/package.json`;
      if (!existsSync(packageJsonPath)) {
        throw new Error('package.json not found');
      }

      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      const outdated = execSync('npm outdated --json', {
        cwd: projectPath,
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const outdatedPackages = JSON.parse(outdated || '{}');
      
      return {
        success: true,
        outdated_count: Object.keys(outdatedPackages).length,
        packages: outdatedPackages
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        outdated_count: 0
      };
    }
  }

  async updateDependencies(projectPath = '.', options = {}) {
    const dryRun = options.dryRun || false;
    
    try {
      if (!dryRun) {
        execSync('npm update', {
          cwd: projectPath,
          stdio: 'inherit'
        });
      }

      return { success: true, updated: !dryRun };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = {
  PuterQualityChecker,
  PuterDependencyManager
};