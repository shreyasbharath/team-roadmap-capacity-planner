#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    landscape: false,
    format: 'A4',
    quality: 'high',
    output: null
  };

  for (const arg of args) {
    if (arg === '--landscape') {
      options.landscape = true;
    } else if (arg.startsWith('--format=')) {
      options.format = arg.split('=')[1];
    } else if (arg.startsWith('--output=')) {
      options.output = arg.split('=')[1];
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Usage: pnpm pdf [options]

Options:
  --landscape         Generate PDF in landscape orientation
  --format=FORMAT     Paper format (A4, A3, Letter, Legal, Tabloid)
  --output=FILE       Output filename (default: roadmap-TIMESTAMP.pdf)
  --help, -h          Show this help message

Examples:
  pnpm pdf                           # A4 portrait PDF
  pnpm pdf:landscape                 # A4 landscape PDF  
  pnpm pdf:a3                        # A3 portrait PDF
  pnpm pdf --format=Letter           # Letter size PDF
  pnpm pdf --output=my-roadmap.pdf   # Custom filename
      `);
      process.exit(0);
    }
  }

  return options;
}

/**
 * Start development server
 */
function startDevServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting development server...');
    
    const server = spawn('pnpm', ['dev'], {
      cwd: projectRoot,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let serverReady = false;

    server.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`📋 ${output.trim()}`);
      
      // Look for the dev server ready message
      if (output.includes('Local:') && !serverReady) {
        serverReady = true;
        // Extract the port from Vite output
        const portMatch = output.match(/localhost:(\d+)/);
        const port = portMatch ? portMatch[1] : '5173';
        setTimeout(() => resolve({ server, port }), 2000); // Give server time to fully start
      }
    });

    server.stderr.on('data', (data) => {
      console.error(`❌ ${data.toString()}`);
    });

    server.on('error', (error) => {
      reject(new Error(`Failed to start server: ${error.message}`));
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      if (!serverReady) {
        server.kill();
        reject(new Error('Server failed to start within 30 seconds'));
      }
    }, 30000);
  });
}

/**
 * Generate PDF using Puppeteer
 */
async function generatePDF(port, options) {
  console.log('📄 Launching browser for PDF generation...');
  
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    try {
      const page = await browser.newPage();
    
    // Set a large viewport for high-resolution rendering
    await page.setViewport({ 
      width: options.landscape ? 1920 : 1440, 
      height: options.landscape ? 1080 : 1920,
      deviceScaleFactor: 2 // For high-DPI rendering
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
    
    // Wait a bit more for any animations to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Inject print styles for better PDF output
    await page.addStyleTag({
      content: `
        @media print {
          body { margin: 0 !important; }
          .no-print { display: none !important; }
          .roadmap-container { 
            transform: none !important; 
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }
          /* Ensure text is readable */
          .text-xs { font-size: 10px !important; }
          .text-sm { font-size: 12px !important; }
          /* Improve timeline visibility */
          .border-gray-100, .border-gray-200 { 
            border-color: #d1d5db !important; 
          }
          /* Ensure backgrounds show in PDF */
          * { 
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `
    });

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const filename = options.output || `roadmap-${timestamp}.pdf`;

    // PDF generation options
    const pdfOptions = {
      path: join(projectRoot, filename),
      format: options.format,
      landscape: options.landscape,
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: '0.5in',
        right: '0.5in', 
        bottom: '0.5in',
        left: '0.5in'
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; margin: 0 auto; color: #666;">
          Roadmap Generated on ${new Date().toLocaleDateString('en-AU')}
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; margin: 0 auto; color: #666;">
          Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>
      `
    };

    console.log(`📋 Generating ${options.format} ${options.landscape ? 'landscape' : 'portrait'} PDF...`);
    
    await page.pdf(pdfOptions);
    
    console.log(`✅ PDF generated successfully: ${filename}`);
    console.log(`📁 Location: ${join(projectRoot, filename)}`);

    return filename;

    } finally {
      await browser.close();
    }
    
  } catch (browserError) {
    if (browserError.message.includes('Could not find Chrome')) {
      console.error('\n❌ Chrome browser not found!');
      console.error('\n🔧 To fix this, run one of the following:');
      console.error('   1. pnpm approve-builds  (then select "y" for puppeteer)');
      console.error('   2. npx puppeteer browsers install chrome');
      console.error('\n💬 This only needs to be done once.');
      throw new Error('Chrome browser not installed for Puppeteer');
    }
    throw browserError;
  }
}

/**
 * Main execution function
 */
async function main() {
  const options = parseArgs();
  let server = null;

  try {
    // Start the development server
    const serverInfo = await startDevServer();
    server = serverInfo.server;
    
    // Generate the PDF
    const filename = await generatePDF(serverInfo.port, options);
    
    console.log(`\n🎉 PDF generation complete!`);
    console.log(`📄 File: ${filename}`);
    console.log(`📐 Format: ${options.format} ${options.landscape ? 'Landscape' : 'Portrait'}`);

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  } finally {
    // Clean up: kill the server
    if (server) {
      console.log('\n🧹 Cleaning up server...');
      server.kill();
    }
  }
}

// Handle cleanup on exit
process.on('SIGINT', () => {
  console.log('\n🛑 PDF generation cancelled');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 PDF generation terminated');
  process.exit(0);
});

// Run the main function
main().catch((error) => {
  console.error(`💥 Unexpected error: ${error.message}`);
  process.exit(1);
});
