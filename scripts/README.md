# UBULITE Scripts

This directory contains all automation scripts for the UBULITE project, organized by functionality.

## Directory Structure

### 🤖 AI Review (`ai-review/`)
- **[gemini-review.js](ai-review/gemini-review.js)** - Gemini Pro 2.5 code review automation
- **[get-github-app-token.js](ai-review/get-github-app-token.js)** - GitHub App token generation utility
- **[archive/](ai-review/archive/)** - Historical versions of AI review scripts

### 🏗️ Build (`build/`)
- **[apk.sh](build/apk.sh)** - Android APK build automation script

### 📦 Collect (`collect/`)
- **[encrypt-upload.sh](collect/encrypt-upload.sh)** - Collect, encrypt, and upload repository artifacts
- **[encrypt-upload-v1.sh](collect/encrypt-upload-v1.sh)** - Legacy version of collect script
- **[archive/](collect/archive/)** - Historical versions of collection scripts

### ⚙️ System (`system/`)
- **[find-and-backup.sh](system/find-and-backup.sh)** - File discovery and backup utilities
- **[merge-main-into-pr.sh](system/merge-main-into-pr.sh)** - Git merge automation
- **[toggle-net.sh](system/toggle-net.sh)** - Network toggle utilities
- **[zram-helper.sh](system/zram-helper.sh)** - ZRAM management and monitoring

## Usage Guidelines

### Prerequisites
Most scripts require:
- Bash shell environment
- Appropriate permissions for system operations
- Required environment variables set (see individual script headers)

### Security Notes
- Scripts handle sensitive data (tokens, encryption keys)  
- Always review scripts before execution
- Use proper environment variable management
- Never commit secrets to version control

### Running Scripts
```bash
# Make scripts executable
chmod +x scripts/category/script-name.sh

# Run with proper environment
REQUIRED_VAR=value ./scripts/category/script-name.sh
```

## Contributing Scripts

When adding new scripts:

1. **Place in appropriate category directory**
2. **Use descriptive names without version suffixes** 
3. **Include comprehensive header comments**
4. **Follow existing naming conventions (kebab-case)**
5. **Add usage examples and requirements**
6. **Update this README when adding new categories**

## Archive Policy

- Keep only the latest working version in main directories
- Move deprecated versions to `archive/` subdirectories  
- Maintain git history for full version tracking