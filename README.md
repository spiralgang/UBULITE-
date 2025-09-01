# UBULITE

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