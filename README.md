# UBULITE

A sophisticated AI-powered system for automated code review and repository management with built-in security features and multi-platform support.

## Overview

UBULITE is a comprehensive solution that combines AI-driven code analysis, automated workflows, and secure development practices. The system features:

- **Gemini Pro 2.5 CI Review Pipeline** - Advanced AI code analysis with multiple authentication modes
- **Secure Storage Management** - Android-focused security with ACL permissions and symlink protection  
- **Multi-Platform Support** - Compatible with Android, cloud IDEs, and various development environments
- **Automated Workflows** - GitHub Actions integration for continuous review and deployment

## Features

### AI Code Review
- Gemini Pro 2.5 integration for intelligent code analysis
- GitHub OIDC → GCP Workload Identity authentication
- Automated PR comment generation with actionable insights
- Support for multiple programming languages and frameworks

### Security Framework
- Advanced permission management (rw-r--r--, ACLs, SAF)
- Symlink exploit detection and prevention
- Poison pill/rogue script protection
- FileObserver monitoring for real-time threat detection
- Encrypted storage with Android 10+ compatibility

### Development Tools
- Autonomous agency capabilities for task automation
- TrainingSet generation for model improvement
- Cloud deployment support (Akash, Firebase, 1984.hosting)
- Integration with popular development platforms

## Quick Start

### Prerequisites
- Node.js 18+ (with OpenSSL legacy provider support)
- Android SDK (for mobile development)
- Git and Docker
- Valid API keys for AI services

### Installation
```bash
# Clone the repository
git clone https://github.com/spiralgang/UBULITE.git
cd UBULITE

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys and configuration

# Start development server
npm run dev
```

### Configuration

Set up the following repository secrets for full functionality:

#### Required Secrets
- `GEMINI` - API key for Gemini AI service
- `GEMINI_API_ENDPOINT` - Vertex AI or proxy endpoint
- `GEMINI_AUTH_MODE` - Authentication mode (`gcloud` or `secret`)

#### Optional Secrets (for enhanced features)
- `GCP_WORKLOAD_IDENTITY_PROVIDER` - For GCP authentication
- `GCP_SERVICE_ACCOUNT_EMAIL` - Service account for GCP
- `GITHUB_APP_PRIVATE_KEY` - GitHub App integration
- `GITHUB_APP_ID` - GitHub App identifier
- `GITHUB_APP_INSTALLATION_ID` - Installation ID

## Project Structure

```
UBULITE/
├── components/          # UI components and modules
├── docs/               # Documentation and guides
├── examples/           # Sample implementations
├── pages/              # Next.js pages
├── scripts/            # Automation and utility scripts
├── tools/              # Development tools and providers
├── .github/workflows/  # CI/CD automation
└── public/             # Static assets
```

## Architecture

### Core Modules

1. **Infrastructure Module** - Deployment and environment management
2. **AI Review Module** - Gemini-powered code analysis
3. **Security Module** - Permission management and threat detection
4. **Automation Module** - Task scheduling and workflow management
5. **Storage Module** - Secure data handling and encryption

### Authentication Modes

**gcloud (Recommended)**
- Uses GitHub OIDC → GCP Workload Identity
- Mints short-lived access tokens
- Enhanced security and audit capabilities

**secret (Fallback)**
- Repository secret-based authentication
- Compatible with internal proxy endpoints
- Simplified setup for development

## Usage

### Running AI Code Review
```bash
# Trigger manual review
npm run review

# Check review status
npm run review:status
```

### Security Operations
```bash
# Run security audit
npm run security:audit

# Check permissions
npm run security:check

# Monitor file system
npm run security:monitor
```

### Development Workflow
```bash
# Start development environment
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Deploy
npm run deploy
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

All contributions are automatically reviewed by our AI system and require security validation.

## Security

UBULITE implements multiple security layers:

- **Input Validation** - All user inputs are sanitized and validated
- **Permission Management** - Fine-grained access control with ACLs
- **Encryption** - Data encrypted at rest and in transit
- **Monitoring** - Real-time threat detection and response
- **Audit Logging** - Comprehensive security event tracking

Report security vulnerabilities to the maintainers privately.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: Check the `/docs` directory for detailed guides
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Join community discussions for support and ideas

---

Built with ❤️ by the UBULITE tea

> A modern Ubuntu desktop experience built with React and Next.js, designed for Android and web platforms.

![UBULITE Preview](public/images/logos/logo_1200.png)

UBULITE is a desktop Ubuntu-like interface that brings familiar Linux desktop experience to web browsers and Android devices. Built with modern web technologies, it features a complete terminal with AI integration, file management, and native app support.

## 🎯 Features

- **Desktop Environment**: Full Ubuntu-like desktop interface with window management
- **Enhanced Terminal**: Complete terminal with AI integration, cloud storage, and 100+ commands
- **Android Support**: Native Android APK build with offline capabilities  
- **AI Integration**: Venice AI, GitHub Copilot, and HuggingFace model support
- **Cloud Storage**: GitHub, GitLab, MediaFire, and HuggingFace integration
- **Web Apps**: Spotify, Chrome browser, VS Code, and system utilities

## 📁 Repository Structure

The repository has been organized into clear, maintainable sections:

```
UBULITE/
├── 📚 docs/          # All documentation organized by topic
│   ├── android/      # Android build guides and APK workflows  
│   ├── api/          # API references and integration guides
│   ├── cloud/        # Cloud deployment recommendations
│   ├── guides/       # User and developer guides
│   └── network/      # Network tools and configuration
├── 📜 scripts/       # Automation scripts organized by function
│   ├── ai-review/    # AI-powered code review automation
│   ├── build/        # Build and compilation scripts
│   ├── collect/      # Data collection and backup utilities
│   └── system/       # System maintenance and configuration
├── 🛠️ tools/         # Development tools and utilities
├── 📋 examples/      # Example implementations and templates  
├── ⚙️ configs/       # Configuration files and templates
├── 🎨 components/    # React components for desktop interface
├── 📄 pages/         # Next.js pages
└── 🌐 public/        # Static assets and themes
```

## 🚀 Quick Start

### Web Development
```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server  
npm run dev

# Build for production
npm run build
```

### Android Development
See [Android Build Guide](docs/android/build-guide.md) for complete Android setup instructions.

### Terminal Features
The enhanced terminal includes:
- Multi-shell support (Bash, Zsh)
- Cloud storage integration  
- AI-powered assistance
- 100+ built-in commands
- Auto-completion and command history

## 📖 Documentation

- **[📱 Android Development](docs/android/)** - Mobile app development and deployment
- **[🔌 API References](docs/api/)** - Integration guides and API documentation  
- **[☁️ Cloud Integration](docs/cloud/)** - Cloud deployment and scaling
- **[📚 User Guides](docs/guides/)** - Getting started and advanced usage
- **[🌐 Network Tools](docs/network/)** - Network utilities and configuration

## 🔧 Development Scripts

- **AI Review**: `scripts/ai-review/gemini-review.js` - Automated code review
- **Build APK**: `scripts/build/apk.sh` - Android app compilation
- **System Tools**: `scripts/system/zram-helper.sh` - Memory management
- **Data Collection**: `scripts/collect/encrypt-upload.sh` - Backup utilities

## 🤖 AI Integration

UBULITE includes comprehensive AI features:
- **Venice AI** - Privacy-first AI assistance
- **GitHub Copilot** - Code completion and suggestions  
- **HuggingFace** - Open source model integration
- **Gemini Pro** - Advanced code review and analysis

## 🌟 Key Components

- **Terminal** - Full-featured terminal with AI capabilities
- **File Manager** - Browse and manage files with drag-and-drop
- **App Launcher** - Launch web apps and system utilities
- **Desktop** - Ubuntu-style desktop with widgets and theming
- **Settings** - Comprehensive system configuration

## 📱 Android Features

- **Offline Mode** - Full functionality without internet
- **Native Performance** - Optimized for Android 10+
- **Secure Storage** - Android Keystore integration
- **WebView Integration** - Seamless web-to-native bridge

## 🔒 Security

- Encrypted data storage and transmission
- Android Keystore for secure credential management  
- Permission-based access control
- Regular security audits with automated tools

## 🤝 Contributing

1. **Documentation**: Add or improve guides in [`docs/`](docs/)
2. **Scripts**: Contribute automation tools to [`scripts/`](scripts/) 
3. **Components**: Enhance UI components in [`components/`](components/)
4. **Examples**: Share implementations in [`examples/`](examples/)

## 📊 Project Status

- ✅ Terminal consolidation complete (11 files merged)
- ✅ Repository structure organized  
- ✅ Android build system functional
- 🔄 AI integration expanding
- 🔄 Cloud deployment optimization

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Projects

- [FileSystemds](https://github.com/spiralgang/FileSystemds) - Internal system utilities
- [Ubuntu Desktop](https://ubuntu.com/desktop) - Inspiration for UI/UX design

---

**Note**: The original extensive README content has been preserved in [`docs/guides/original-readme-backup.md`](docs/guides/original-readme-backup.md) for reference.
