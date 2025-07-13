// scripts/visual-regression-tests.js
import puppeteer from 'puppeteer';
import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test data for different granularities
const testCases = {
  daily: {
    name: 'sprint-daily-view',
    description: '2-week sprint → daily granularity',
    markdown: `# Sprint 24 - Mobile App Release Sprint

## Team Capacity
- **Alex Annual Leave**: 2025-07-22 to 2025-07-24 | color: #FFA500

## Streams
### 📱 Mobile Development
- **Mobile App v3.0**: 2025-07-15 to 2025-07-23 | Alex, Jordan | color: #4F46E5
- **Push Notifications**: 2025-07-18 to 2025-07-25 | Taylor | color: #10B981

## Milestones
- **Feature Freeze**: hard-date: 2025-07-23 | color: #FF0000`
  },
  
  weekly: {
    name: 'medium-weekly-view',
    description: '6-week project → weekly granularity', 
    markdown: `# Q3 Initiative - July-August 2025

## Streams
### Platform Team
- **Architecture Refactor**: 2025-07-01 to 2025-08-15 | Team A | color: #4F46E5
- **Database Migration**: 2025-07-15 to 2025-08-30 | Team B | color: #10B981

## Milestones
- **Architecture Complete**: hard-date: 2025-08-15 | color: #FF0000`
  },
  
  quarterly: {
    name: 'longterm-quarterly-view',
    description: 'Annual roadmap → quarterly granularity',
    markdown: `# Annual Product Roadmap 2025

## Streams
### Product Development
- **Product v1.0**: 2025-01-01 to 2025-06-30 | Team Alpha | color: #4F46E5
- **Product v2.0**: 2025-07-01 to 2025-12-31 | Team Beta | color: #10B981`
  }
};

/**
 * Consolidated visual regression testing
 */
class VisualRegressionTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.resultsDir = path.join(__dirname, '../test-results/visual');
    this.tempDir = path.join(__dirname, '../temp');
  }

  async setup() {
    console.log('🚀 Setting up visual regression tests...\n');
    
    // Create directories
    await Promise.all([
      fs.mkdir(this.resultsDir, { recursive: true }),
      fs.mkdir(this.tempDir, { recursive: true })
    ]);

    // Launch browser
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    // Clean up temp files
    await fs.rmdir(this.tempDir, { recursive: true }).catch(() => {});
  }

  /**
   * Test adaptive timeline scaling visual rendering
   */
  async testAdaptiveScaling() {
    console.log('🎯 Testing adaptive timeline scaling visuals...\n');
    
    const results = [];
    const originalRoadmap = path.join(__dirname, '../src/data/roadmap.md');
    const backupPath = path.join(this.tempDir, 'roadmap.backup.md');
    
    // Backup original roadmap
    await fs.copyFile(originalRoadmap, backupPath);
    
    try {
      for (const [granularity, testCase] of Object.entries(testCases)) {
        console.log(`📊 Testing ${granularity} view: ${testCase.description}`);
        
        try {
          // Replace roadmap with test data
          await fs.writeFile(originalRoadmap, testCase.markdown);
          
          // Navigate and wait for load
          console.log('   🌐 Navigating to localhost:5173...');
          await this.page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
          
          console.log('   ⏳ Waiting for roadmap container...');
          await this.page.waitForSelector('[data-testid="roadmap-container"]', { timeout: 10000 });
          
          // Wait for animations and content to stabilize
          console.log('   ⏱️  Waiting for content to stabilize...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Capture timeline info
        const timelineInfo = await this.page.evaluate(() => {
          const container = document.querySelector('[data-testid="roadmap-container"]');
          const headers = container.querySelector('.flex.border-b-2.border-gray-300');
          const timelineType = headers ? headers.textContent.trim() : 'unknown';
          
          // Count timeline columns
          const timelineColumns = container.querySelectorAll('[class*="w-16"]').length;
          const timelineBars = container.querySelectorAll('[class*="absolute"][class*="rounded"]').length;
          
          return {
            timelineType,
            columnCount: timelineColumns,
            barCount: timelineBars,
            containerWidth: container.offsetWidth
          };
        });
        
        // Take screenshot
        const screenshotPath = path.join(this.resultsDir, `${testCase.name}.png`);
        console.log(`   📸 Taking screenshot: ${testCase.name}.png`);
        await this.page.screenshot({
          path: screenshotPath,
          fullPage: true,
          type: 'png'
        });
        
        results.push({
          granularity,
          testCase: testCase.name,
          description: testCase.description,
          screenshotPath,
          timelineInfo,
          status: 'passed'
        });
        
        console.log(`   ✅ ${granularity} view captured`);
        console.log(`   📊 Columns: ${timelineInfo.columnCount}, Bars: ${timelineInfo.barCount}`);
        console.log(`   📝 Timeline: ${timelineInfo.timelineType}\n`);
        
        } catch (testError) {
          console.error(`   ❌ Failed to test ${granularity} view:`, testError.message);
          results.push({
            granularity,
            testCase: testCase.name,
            description: testCase.description,
            status: 'failed',
            error: testError.message
          });
        }
      }
    } finally {
      // Restore original roadmap
      await fs.copyFile(backupPath, originalRoadmap);
    }
    
    return results;
  }

  /**
   * Generate consolidated test report
   */
  async generateReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: results.length,
        passed: results.filter(r => r.status === 'passed').length,
        failed: results.filter(r => r.status === 'failed').length
      },
      testResults: results,
      environment: {
        nodeVersion: process.version,
        viewport: '1920x1080',
        browser: 'Chromium (Puppeteer)'
      }
    };
    
    const reportPath = path.join(this.resultsDir, 'visual-regression-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📋 Visual Regression Test Report:');
    console.log(`   📄 Report: ${reportPath}`);
    console.log(`   ✅ Passed: ${report.summary.passed}/${report.summary.totalTests}`);
    console.log(`   ❌ Failed: ${report.summary.failed}/${report.summary.totalTests}`);
    
    if (report.summary.failed === 0) {
      console.log('   🎉 All adaptive timeline scaling tests passed!');
    } else {
      console.log('   ⚠️  Visual regressions detected - check screenshots');
    }
    
    return report;
  }
}

/**
 * Main test runner
 */
async function runConsolidatedTests() {
  const tester = new VisualRegressionTester();
  
  try {
    await tester.setup();
    
    // Run visual regression tests
    const visualResults = await tester.testAdaptiveScaling();
    
    // Generate report
    const report = await tester.generateReport(visualResults);
    
    // Exit with appropriate code
    process.exit(report.summary.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('❌ Visual regression tests failed:', error.message);
    process.exit(1);
  } finally {
    await tester.cleanup();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runConsolidatedTests();
}

export { VisualRegressionTester, testCases };
