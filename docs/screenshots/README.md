# Screenshots

This directory contains screenshots for documentation and README files.

## Web Application Screenshots

- **web-full-roadmap.png** - Complete roadmap view showing all features
- **web-editor-view.png** - Side-by-side markdown editor with live preview  
- **web-mobile-view.png** - Mobile responsive design
- **web-timeline-detail.png** - Zoomed timeline showing detailed view
- **editing-in-action.png** - Live editing functionality demonstration
- **simple-roadmap-example.png** - Simple roadmap for getting started

## Desktop Application Screenshots  

- **desktop-native-interface.png** - Native desktop app interface
- **desktop-file-operations.png** - Native file operations and menus
- **desktop-full-screen.png** - Full-screen desktop experience

## Usage in README

Main README images:
- `image.png` - Primary screenshot (currently web-editor-view.png)
- `docs/complex-roadmap.png` - Complex roadmap example

## Generating Screenshots

Run the screenshot generation script:
```bash
pnpm screenshot:updated
```

This script:
1. Starts the development server
2. Captures various web app scenarios
3. Updates main README images
4. Provides instructions for desktop screenshots

## Manual Desktop Screenshots

1. Build desktop app: `pnpm tauri:build`
2. Launch the built application
3. Capture screenshots using system tools
4. Save to this directory with descriptive names
