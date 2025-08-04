## 📸 Screenshot Generation Guide

This project includes comprehensive screenshot generation to showcase both web and desktop functionality.

### Quick Start

```bash
# Install dependencies (includes Playwright)
pnpm install

# Install Playwright browsers (one-time setup)
npx playwright install chromium

# Start development server
pnpm dev

# Generate all screenshots (in another terminal)
pnpm screenshot
```

### What Gets Generated

#### Web Application Screenshots
- **web-editor-view.png** - Side-by-side markdown editor with live preview
- **web-full-roadmap.png** - Complete roadmap view with all features
- **editing-in-action.png** - Demonstration of live editing functionality  
- **web-mobile-view.png** - Responsive design on tablet/mobile
- **web-timeline-detail.png** - Zoomed timeline detail view
- **simple-roadmap-example.png** - Getting started example

#### Desktop Application Screenshots
Desktop screenshots require manual capture:

1. **Build the desktop app:**
   ```bash
   pnpm tauri:build
   ```

2. **Launch the built application:**
   - **macOS**: Open `src-tauri/target/release/bundle/dmg/Roadmap Planner_1.0.0_aarch64.dmg`
   - **Windows**: Run `src-tauri/target/release/bundle/msi/Roadmap Planner_1.0.0_x64_en-US.msi`
   - **Linux**: Launch `src-tauri/target/release/bundle/appimage/roadmap-planner_1.0.0_amd64.AppImage`

3. **Capture screenshots using system tools:**
   - Load different roadmap files
   - Show native file operations (Open, Save, Export menu)
   - Demonstrate full-screen mode
   - Capture editing interface

4. **Save to docs/screenshots/ with descriptive names:**
   - `desktop-native-interface.png`
   - `desktop-file-operations.png`
   - `desktop-editing-view.png`
   - `desktop-full-screen.png`

### Screenshot Script Details

The `scripts/generate-updated-screenshots.js` script:

1. **Starts Playwright browser** in headless mode
2. **Loads different roadmap examples** to showcase various features
3. **Captures multiple viewport sizes** (desktop, tablet, mobile)
4. **Demonstrates editing functionality** by modifying content live
5. **Updates main README images** automatically
6. **Restores original roadmap** after completion

### Updating Main README Images

The script automatically updates:
- `image.png` - Primary README screenshot (editor view)
- `docs/complex-roadmap.png` - Complex roadmap example
- All images in `docs/screenshots/` directory

### Manual Screenshot Tips

For high-quality screenshots:

1. **Use consistent window sizes:**
   - Desktop: 1400x900 or larger
   - Mobile: 375x667 (iPhone) or 768x1024 (iPad)

2. **Show meaningful content:**
   - Use realistic project names and timelines
   - Include team capacity and risk elements
   - Demonstrate key features being used

3. **Clean UI state:**
   - Hide browser developer tools
   - Use fresh page loads
   - Ensure all elements are properly loaded

4. **Consistent branding:**
   - Use the provided roadmap examples
   - Maintain consistent color schemes
   - Show the app in its best light

### Troubleshooting

**Playwright installation issues:**
```bash
# If browsers don't install automatically
npx playwright install

# Or install just Chromium
npx playwright install chromium
```

**Development server not running:**
```bash
# Make sure dev server is running first
pnmp dev
```

**Screenshots appear blank:**
- Ensure `data-testid="timeline-bar"` elements are loading
- Check console for JavaScript errors
- Verify roadmap.md has valid content

**Desktop app won't build:**
- Install Rust: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- Restart terminal after Rust installation
- Verify with: `rustc --version`

### Contributing Screenshots

When contributing:

1. **Generate web screenshots:** `pnpm screenshot`
2. **Create desktop screenshots manually** following the guide above
3. **Test all images display correctly** in README
4. **Include multiple scenarios** (simple, complex, editing)
5. **Ensure consistent quality** and meaningful content

The goal is to show potential users exactly what they can expect from both the web and desktop versions of the application.
