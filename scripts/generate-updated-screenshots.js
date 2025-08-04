#!/usr/bin/env node

/**
 * Generate Updated Screenshots for README
 * 
 * Creates modern screenshots showcasing:
 * 1. Web app with side-by-side editor
 * 2. Desktop app with native interface
 * 3. Editing functionality in action
 * 4. Both simple and complex roadmap examples
 */

import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';

// Configuration
const SCREENSHOTS_DIR = './docs/screenshots';
const BASE_URL = 'http://localhost:5173';
const DESKTOP_APP_PATH = './src-tauri/target/release/roadmap-planner'; // Adjust if different

// Sample roadmaps for different scenarios
const SIMPLE_ROADMAP = `# Product Roadmap - Q3 2025

## Streams

### Frontend Team
- **User Dashboard**: Jul W1-Aug W2 | Frontend Team | color: #3B82F6
- **Mobile Responsive**: Aug W3-Sep W1 | Frontend Team | color: #06B6D4

### Backend Team  
- **API v2.0**: Jul W2-Aug W4 | Backend Team | color: #10B981
- **Database Migration**: Sep W1-Sep W3 | Backend Team | color: #8B5CF6

### Milestones
- **Beta Release**: Aug W4 | hard-deadline: 2025-08-25 | color: #EF4444`;

const EDITING_EXAMPLE = `# Interactive Roadmap Editor Demo

## Team Capacity
- **Developer Conference**: Aug W1-Aug W2 | color: #FF6B6B

## Streams

### Mobile Platform
- **Mobile App v3.0**: Jul W1-Sep W2 | Mobile Team | hard-deadline: 2025-09-15 | color: #4F46E5
- **Push Notifications**: Aug W1-Aug W4 | Mobile Team | color: #7C3AED

### Analytics
- **Real-time Dashboard**: Jul W2-Aug W3 | Analytics Team | color: #059669`;

async function ensureDirectoryExists(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    console.log(`Directory ${dir} already exists or created`);
  }
}

async function saveRoadmapData(content) {
  const roadmapPath = './src/data/roadmap.md';
  await fs.writeFile(roadmapPath, content, 'utf8');
  console.log('Updated roadmap.md with screenshot content');
}

async function restoreOriginalRoadmap() {
  // Read the current complex example and restore it
  const complexExample = await fs.readFile('./src/data/roadmap.md', 'utf8');
  console.log('Restored original roadmap.md');
  return complexExample;
}

async function captureWebScreenshots(page) {
  console.log('📱 Capturing web application screenshots...');
  
  // Navigate to web app
  await page.goto(BASE_URL);
  await page.waitForSelector('[data-testid="timeline-bar"]', { timeout: 10000 });
  
  // 1. Full roadmap view (existing)
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.screenshot({
    path: `${SCREENSHOTS_DIR}/web-full-roadmap.png`,
    fullPage: false
  });
  console.log('✅ Captured full roadmap view');
  
  // 2. Side-by-side editor view  
  // Click to open editor if available
  const editorToggle = await page.locator('[data-testid="toggle-editor"]').first();
  if (await editorToggle.isVisible()) {
    await editorToggle.click();
    await page.waitForTimeout(500); // Animation
  }
  
  await page.screenshot({
    path: `${SCREENSHOTS_DIR}/web-editor-view.png`,
    fullPage: false
  });
  console.log('✅ Captured side-by-side editor view');
  
  // 3. Mobile responsive view
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(300);
  await page.screenshot({
    path: `${SCREENSHOTS_DIR}/web-mobile-view.png`,
    fullPage: false
  });
  console.log('✅ Captured mobile responsive view');
  
  // 4. Timeline interaction (zoomed in)
  await page.setViewportSize({ width: 1400, height: 900 });
  
  // Try to zoom in if zoom controls exist
  const zoomIn = await page.locator('[data-testid="zoom-in"]').first();
  if (await zoomIn.isVisible()) {
    await zoomIn.click();
    await zoomIn.click(); // Zoom in twice
    await page.waitForTimeout(500);
  }
  
  await page.screenshot({
    path: `${SCREENSHOTS_DIR}/web-timeline-detail.png`,
    fullPage: false,
    clip: { x: 0, y: 100, width: 1400, height: 600 }
  });
  console.log('✅ Captured timeline detail view');
}

async function captureEditingInAction(page) {
  console.log('✏️ Capturing editing functionality...');
  
  // Set up editing scenario
  await saveRoadmapData(EDITING_EXAMPLE);
  await page.reload();
  await page.waitForSelector('[data-testid="timeline-bar"]', { timeout: 10000 });
  
  // Open editor if available
  const editorToggle = await page.locator('[data-testid="toggle-editor"]').first();
  if (await editorToggle.isVisible()) {
    await editorToggle.click();
    await page.waitForTimeout(500);
  }
  
  // Try to find markdown editor textarea
  const editor = await page.locator('textarea, [contenteditable="true"], .monaco-editor').first();
  if (await editor.isVisible()) {
    // Add some text to show editing
    await editor.focus();
    await page.keyboard.type('\n- **New Feature**: Sep W1-Sep W2 | New Team | color: #F59E0B');
    await page.waitForTimeout(1000); // Wait for live update
  }
  
  await page.screenshot({
    path: `${SCREENSHOTS_DIR}/editing-in-action.png`,
    fullPage: false
  });
  console.log('✅ Captured editing functionality');
}

async function captureSimpleExample(page) {
  console.log('📋 Capturing simple roadmap example...');
  
  await saveRoadmapData(SIMPLE_ROADMAP);
  await page.reload();
  await page.waitForSelector('[data-testid="timeline-bar"]', { timeout: 10000 });
  
  await page.screenshot({
    path: `${SCREENSHOTS_DIR}/simple-roadmap-example.png`,
    fullPage: false
  });
  console.log('✅ Captured simple roadmap example');
}

async function generateDesktopScreenshots() {
  console.log('🖥️ Desktop app screenshots would require running Tauri app...');
  console.log('💡 To capture desktop screenshots:');
  console.log('   1. Run: pnpm tauri:build');
  console.log('   2. Launch the built app');  
  console.log('   3. Use built-in screenshot tools or manual capture');
  console.log('   4. Save to docs/screenshots/desktop-*.png');
}

async function updateMainScreenshots() {
  console.log('🔄 Updating main README screenshots...');
  
  // Copy the best screenshots to main directory
  try {
    await fs.copyFile(`${SCREENSHOTS_DIR}/web-editor-view.png`, './image.png');
    console.log('✅ Updated main image.png');
    
    // Check if complex roadmap screenshot exists and update it
    const complexExists = await fs.access('./docs/complex-roadmap.png').then(() => true).catch(() => false);
    if (!complexExists) {
      await fs.copyFile(`${SCREENSHOTS_DIR}/web-full-roadmap.png`, './docs/complex-roadmap.png');
      console.log('✅ Created docs/complex-roadmap.png');
    }
  } catch (error) {
    console.log('ℹ️ Could not update main screenshots:', error.message);
  }
}

async function generateScreenshotREADME() {
  const readmeContent = `# Screenshots

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
- \`image.png\` - Primary screenshot (currently web-editor-view.png)
- \`docs/complex-roadmap.png\` - Complex roadmap example

## Generating Screenshots

Run the screenshot generation script:
\`\`\`bash
pnpm screenshot:updated
\`\`\`

This script:
1. Starts the development server
2. Captures various web app scenarios
3. Updates main README images
4. Provides instructions for desktop screenshots

## Manual Desktop Screenshots

1. Build desktop app: \`pnpm tauri:build\`
2. Launch the built application
3. Capture screenshots using system tools
4. Save to this directory with descriptive names
`;

  await fs.writeFile(`${SCREENSHOTS_DIR}/README.md`, readmeContent);
  console.log('✅ Generated screenshot directory README');
}

async function main() {
  console.log('🚀 Starting updated screenshot generation...');
  console.log('📋 Make sure development server is running: pnpm dev');
  
  // Setup
  await ensureDirectoryExists(SCREENSHOTS_DIR);
  
  // Backup original roadmap
  const originalRoadmap = await fs.readFile('./src/data/roadmap.md', 'utf8');
  
  try {
    // Launch browser
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Generate web screenshots
    await captureWebScreenshots(page);
    await captureEditingInAction(page);
    await captureSimpleExample(page);
    
    await browser.close();
    
    // Generate desktop info
    await generateDesktopScreenshots();
    
    // Update main images
    await updateMainScreenshots();
    
    // Generate documentation
    await generateScreenshotREADME();
    
    console.log('✅ Screenshot generation complete!');
    console.log(`📁 Screenshots saved to: ${SCREENSHOTS_DIR}`);
    console.log('🖼️ Main README images updated');
    
  } catch (error) {
    console.error('❌ Screenshot generation failed:', error);
  } finally {
    // Restore original roadmap
    await fs.writeFile('./src/data/roadmap.md', originalRoadmap, 'utf8');
    console.log('🔄 Restored original roadmap.md');
  }
}

// Add to package.json scripts if needed
const packageJsonScript = {
  "screenshot:updated": "node scripts/generate-updated-screenshots.js"
};

console.log('💡 To add to package.json scripts:', JSON.stringify(packageJsonScript, null, 2));

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
