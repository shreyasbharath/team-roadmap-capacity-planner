#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import puppeteer from 'puppeteer';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

/**
 * Start development server
 */
function startDevServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting development server for screenshots...');
    
    const server = spawn('pnpm', ['dev'], {
      cwd: projectRoot,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let serverReady = false;

    server.stdout.on('data', (data) => {
      const output = data.toString();
      
      if (output.includes('Local:') && !serverReady) {
        serverReady = true;
        const portMatch = output.match(/localhost:(\d+)/);
        const port = portMatch ? portMatch[1] : '5173';
        setTimeout(() => resolve({ server, port }), 2000);
      }
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
 * Generate screenshot for a specific roadmap
 */
async function generateScreenshot(port, filename) {
  console.log(`📸 Generating screenshot: ${filename}...`);
  
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
    
    // Set viewport for good screenshot
    await page.setViewport({ 
      width: 1400, 
      height: 900,
      deviceScaleFactor: 2
    });

    // Navigate to the roadmap
    const url = `http://localhost:${port}`;
    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    // Wait for rendering
    await page.waitForSelector('.roadmap-container', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Clean up UI for screenshot
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
    const screenshotPath = join(projectRoot, 'docs', filename);
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
      type: 'png'
    });

    console.log(`✅ Screenshot saved: docs/${filename}`);
    return screenshotPath;

  } finally {
    await browser.close();
  }
}

/**
 * Update roadmap data file
 */
function updateRoadmapData(content) {
  const roadmapPath = join(projectRoot, 'src', 'data', 'roadmap.md');
  fs.writeFileSync(roadmapPath, content);
  console.log('📝 Updated roadmap data');
}

/**
 * Simple roadmap content
 */
const simpleRoadmap = `# My Product Roadmap - Q3 2025

## Streams

### Frontend Team
- **User Dashboard**: Jul W1-Aug W2 | Frontend Team | color: #3B82F6
- **Mobile Responsive**: Aug W3-Sep W1 | Frontend Team | color: #06B6D4

### Backend Team  
- **API v2.0**: Jul W2-Aug W4 | Backend Team | color: #10B981
- **Database Migration**: Sep W1-Sep W3 | Backend Team | color: #8B5CF6

### Milestones
- **Beta Release**: Aug W4 | hard-deadline: 2025-08-25 | color: #EF4444
`;

/**
 * Complex roadmap content
 */
const complexRoadmap = `# Enterprise Platform Roadmap - Q3/Q4 2025

## Team Capacity
- **Alex Annual Leave**: Jul W3-Jul W4 | color: #FFA500
- **Jordan Conference**: Aug W2-Aug W2 | color: #FF6B6B  
- **Taylor Training**: Sep W1-Sep W2 | color: #9B59B6
- **Summer Holidays**: Aug W1-Aug W3 | color: #FFB84D
- **Q4 Planning Week**: Oct W1-Oct W1 | color: #A78BFA

## Streams

### Mobile Platform
- **Risk: iOS 17 Compatibility**: Jul W1-Jul W3 | risk-level: high | color: #DC2626
- **Mobile App v3.0**: Jul W1-Sep W2 | Mobile Team (4 devs) | hard-deadline: 2025-09-15 | deadline-label: App Store Release | color: #4F46E5
- **Push Notifications**: Aug W1-Aug W4 | Mobile Team | color: #7C3AED
- **Offline Sync**: Sep W3-Oct W2 | Mobile Team | soft-deadline: 2025-10-15 | deadline-label: V3.1 Release | color: #5B21B6

### Analytics Platform
- **Real-time Dashboard**: Jul W2-Aug W3 | Analytics Team (3 devs) | color: #059669
- **Custom Reports Engine**: Aug W4-Oct W1 | Analytics Team | color: #047857
- **Risk: Data Privacy Compliance**: Sep W1-Sep W4 | risk-level: medium | color: #F59E0B
- **Advanced Analytics**: Oct W2-Nov W2 | Analytics Team | color: #065F46

### Infrastructure
- **Cloud Migration**: Jul W1-Sep W4 | DevOps Team (2 devs) | color: #DC2626
- **Risk: Migration Downtime**: Aug W2-Aug W3 | risk-level: high | color: #991B1B
- **Auto-scaling Setup**: Oct W1-Oct W4 | DevOps Team | color: #B91C1C
- **Security Audit**: Nov W1-Nov W2 | Security Team | hard-deadline: 2025-11-15 | deadline-label: Compliance Deadline | color: #7F1D1D

### Product Strategy
- **Market Research**: Jul W1-Jul W4 | Product Team | color: #2563EB
- **User Testing**: Aug W1-Aug W2 | Product Team | color: #1D4ED8
- **Feature Prioritisation**: Aug W3-Aug W4 | Product Team | color: #1E40AF
- **Q1 2026 Planning**: Oct W3-Nov W1 | Product Team | soft-deadline: 2025-11-01 | deadline-label: Board Presentation | color: #1E3A8A

### Milestones
- **Alpha Release**: Aug W1 | hard-deadline: 2025-08-01 | deadline-label: Internal Testing | color: #F59E0B
- **Beta Release**: Sep W1 | hard-deadline: 2025-09-01 | deadline-label: Customer Preview | color: #EAB308
- **Production Release**: Oct W1 | hard-deadline: 2025-10-01 | deadline-label: General Availability | color: #059669
- **Post-launch Review**: Nov W1 | soft-deadline: 2025-11-01 | deadline-label: Lessons Learned | color: #0891B2
`;

/**
 * Main execution function
 */
async function main() {
  let server = null;

  try {
    // Ensure docs directory exists
    const docsPath = join(projectRoot, 'docs');
    if (!fs.existsSync(docsPath)) {
      fs.mkdirSync(docsPath, { recursive: true });
    }

    // Backup current roadmap (should be complex example)
    const roadmapPath = join(projectRoot, 'src', 'data', 'roadmap.md');
    const originalRoadmap = fs.readFileSync(roadmapPath, 'utf8');

    // Start server
    const serverInfo = await startDevServer();
    server = serverInfo.server;
    const port = serverInfo.port;

    console.log('\n📋 Generating roadmap example screenshots...\n');

    // Generate simple roadmap screenshot
    console.log('1️⃣ Creating simple roadmap screenshot...');
    updateRoadmapData(simpleRoadmap);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Let file system update
    await generateScreenshot(port, 'simple-roadmap.png');

    console.log('\n2️⃣ Creating complex roadmap screenshot...');
    updateRoadmapData(complexRoadmap);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Let file system update
    await generateScreenshot(port, 'complex-roadmap.png');

    // Restore original roadmap (complex example for development)
    console.log('\n🔄 Restoring complex example as default for development...');
    updateRoadmapData(originalRoadmap);

    console.log('\n🎉 Both screenshots generated successfully!');
    console.log('📁 Files created:');
    console.log('   - docs/simple-roadmap.png');
    console.log('   - docs/complex-roadmap.png');
    console.log('✅ Default roadmap restored to complex example for development');

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  } finally {
    if (server) {
      console.log('\n🧹 Cleaning up server...');
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
