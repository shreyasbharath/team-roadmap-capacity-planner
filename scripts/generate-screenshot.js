#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

/**
 * Start development server
 */
function startDevServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting development server for screenshot...');
    
    const server = spawn('pnpm', ['dev'], {
      cwd: projectRoot,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let serverReady = false;

    server.stdout.on('data', (data) => {
      const output = data.toString();
      
      // Look for the dev server ready message
      if (output.includes('Local:') && !serverReady) {
        serverReady = true;
        // Extract the port from Vite output
        const portMatch = output.match(/localhost:(\d+)/);
        const port = portMatch ? portMatch[1] : '5173';
        setTimeout(() => resolve({ server, port }), 2000);
      }
    });

    server.stderr.on('data', (data) => {
      // Suppress most output for cleaner screenshot generation
    });

    server.on('error', (error) => {
      reject(new Error(`Failed to start server: ${error.message}`));
    });

    setTimeout(() => {
      if (!serverReady) {
        server.kill();
        reject(new Error('Server failed to start within 30 seconds'));
      }
    }, 30000);
  });
}

/**
 * Generate screenshot using Puppeteer
 */
async function generateScreenshot(port) {
  console.log('📸 Launching browser for screenshot...');
  
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security'
      ]
    });

    try {
      const page = await browser.newPage();
      
      // Set viewport for a good screenshot
      await page.setViewport({ 
        width: 1400, 
        height: 1000,
        deviceScaleFactor: 2 // High DPI for crisp screenshot
      });

      // Navigate to the roadmap
      const url = `http://localhost:${port}`;
      console.log(`🌐 Loading roadmap from ${url}...`);
      
      await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      // Wait for the roadmap to be fully rendered
      console.log('⏳ Waiting for roadmap to render...');
      await page.waitForSelector('.roadmap-container', { timeout: 10000 });
      
      // Wait for animations and data loading
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Hide controls and debug info for clean screenshot
      await page.addStyleTag({
        content: `
          .no-print,
          .zoom-controls,
          .pan-hint {
            display: none !important;
          }
          body {
            background: #f8fafc !important;
          }
        `
      });

      // Take screenshot
      const screenshotPath = join(projectRoot, 'docs', 'roadmap-screenshot.png');
      console.log('📷 Taking screenshot...');
      
      await page.screenshot({
        path: screenshotPath,
        fullPage: true,
        type: 'png'
      });

      console.log(`✅ Screenshot saved: docs/roadmap-screenshot.png`);
      return screenshotPath;

    } finally {
      await browser.close();
    }
    
  } catch (browserError) {
    if (browserError.message.includes('Could not find Chrome')) {
      console.error('\n❌ Chrome browser not found!');
      console.error('Run: pnpm approve-builds or npx puppeteer browsers install chrome');
      throw new Error('Chrome browser not installed for Puppeteer');
    }
    throw browserError;
  }
}

/**
 * Main execution function
 */
async function main() {
  let server = null;

  try {
    // Start the development server
    const serverInfo = await startDevServer();
    server = serverInfo.server;
    
    // Generate the screenshot
    await generateScreenshot(serverInfo.port);
    
    console.log('\n🎉 Screenshot generation complete!');

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  } finally {
    // Clean up: kill the server
    if (server) {
      console.log('🧹 Cleaning up server...');
      server.kill();
    }
  }
}

// Handle cleanup on exit
process.on('SIGINT', () => {
  console.log('\n🛑 Screenshot generation cancelled');
  process.exit(0);
});

// Run the main function
main().catch((error) => {
  console.error(`💥 Unexpected error: ${error.message}`);
  process.exit(1);
});
