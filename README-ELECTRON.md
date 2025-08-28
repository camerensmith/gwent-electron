# Gwent Classic - Electron Desktop App

This is the desktop version of Gwent Classic, the original Gwent minigame from The Witcher 3, built with Electron.

## Features

- **Desktop Application**: Run Gwent Classic as a native desktop app
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Enhanced AI**: Improved AI decision-making and strategy
- **Native Menus**: Full application menu with keyboard shortcuts
- **File Integration**: Open deck files directly from the app
- **Professional Builds**: Create installers and portable versions

## Quick Start

### Prerequisites

- Node.js 16+ and npm
- Git

### Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd gwent-classic-v3.1
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the app**:
   ```bash
   npm start
   ```

### Development Mode

Run with developer tools open:
```bash
npm run dev
```

## Building the Application

### Create Distributable Packages

Build for all platforms:
```bash
npm run build
```

Build for specific platforms:
```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

### Build Outputs

The built applications will be in the `dist/` folder:

- **Windows**: `.exe` installer and portable version
- **macOS**: `.dmg` disk image
- **Linux**: `.AppImage` and `.deb` package

## Application Structure

```
gwent-classic-v3.1/
├── main.js              # Main Electron process
├── preload.js           # Preload script for security
├── index.html           # Main game interface
├── javascript/          # Game logic and AI
├── css/                 # Stylesheets
├── images/              # Game assets
├── sfx/                 # Sound effects
├── decks/               # Card deck files
├── package.json         # Dependencies and scripts
├── electron-builder.yml # Build configuration
└── README-ELECTRON.md   # This file
```

## Menu Features

### File Menu
- **New Game** (Ctrl+N): Start a new game
- **Open Deck** (Ctrl+O): Load a custom deck file
- **Exit** (Ctrl+Q): Close the application

### Game Menu
- **Rules**: View game rules
- **Deck Builder**: Access deck building tools
- **AI Difficulty**: Set AI opponent difficulty (Easy/Medium/Hard)

### View Menu
- **Reload** (Ctrl+R): Refresh the game
- **Developer Tools** (Ctrl+Shift+I): Open debugging tools
- **Zoom Controls**: Adjust game size

### Help Menu
- **About**: Application information
- **License**: View license details

## Keyboard Shortcuts

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| New Game | Ctrl+N | Cmd+N |
| Open Deck | Ctrl+O | Cmd+O |
| Reload | Ctrl+R | Cmd+R |
| Developer Tools | Ctrl+Shift+I | Cmd+Alt+I |
| Exit | Ctrl+Q | Cmd+Q |

## Configuration

### AI Difficulty Settings

The AI difficulty can be adjusted through the Game menu:
- **Easy**: Basic AI with simple decision-making
- **Medium**: Enhanced AI with strategic thinking
- **Hard**: Advanced AI with predictive capabilities

### Build Configuration

Edit `electron-builder.yml` to customize:
- Application metadata
- Build targets
- Installer options
- Platform-specific settings

## Development

### Adding New Features

1. **Main Process**: Add logic in `main.js`
2. **Renderer Process**: Add UI elements in HTML/CSS/JS
3. **Communication**: Use `preload.js` for secure IPC

### Security Considerations

- Context isolation is enabled
- Node integration is disabled
- File access is restricted to game directories
- External links open in default browser

### Testing

```bash
# Run with dev tools
npm run dev

# Test build process
npm run pack
```

## Troubleshooting

### Common Issues

1. **App won't start**:
   - Check Node.js version (16+ required)
   - Run `npm install` to ensure dependencies
   - Check console for error messages

2. **Build fails**:
   - Ensure all dependencies are installed
   - Check platform-specific requirements
   - Verify file paths in configuration

3. **Performance issues**:
   - Close other applications
   - Check system resources
   - Disable hardware acceleration if needed

### Platform-Specific Notes

- **Windows**: Requires Visual Studio Build Tools for native modules
- **macOS**: May require Xcode Command Line Tools
- **Linux**: May need additional system packages (see electron-builder.yml)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

- **Original Game**: CD Projekt Red
- **Web Version**: Sundaram, Costa & Sylver
- **Electron Port**: Enhanced with modern desktop features

## Support

For issues and questions:
1. Check this README
2. Review the main README.md
3. Check existing issues
4. Create a new issue with details
