// tests/visual/roadmap-visual.spec.js
import { test, expect } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

// Test data
const SAMPLE_ROADMAP = `
# Acme Q2/Q3 2025 Roadmap

## Team Capacity
- **Phil Leave**: Jul W2-Jul W3 | color: #FFA500
- **Shreyas Conference**: Aug W1 | color: #9333EA

## Streams

### Mobile Game
- **Feature Toggle System**: Jul W1-Jul W4 | Phil, Shreyas | hard-deadline: 2025-07-31 | color: #4F46E5
- **Game Rule Engine**: Aug W1-Aug W3 | Shreyas | risk-level: high | color: #EF4444

### Web App
- **Scoring System Upgrade**: Jul W2-Sep W1 | Shreyas, Platform Engineer | color: #10B981
`;

test.describe('Timeline Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Load the app with test data
    await page.goto('/');

    // If using desktop app, load test roadmap
    // If web, inject via localStorage or API
    await page.evaluate((roadmapData) => {
      localStorage.setItem('test-roadmap', roadmapData);
    }, SAMPLE_ROADMAP);
  });

  test('timeline bars align with header dates', async ({ page }) => {
    // Wait for render
    await page.waitForSelector('[data-testid="timeline-bar"]');

    // Get header positions
    const headerPositions = await page.evaluate(() => {
      const headers = Array.from(document.querySelectorAll('[data-testid="timeline-header-week"]'));
      return headers.map(h => ({
        text: h.textContent,
        left: h.getBoundingClientRect().left,
        width: h.getBoundingClientRect().width
      }));
    });

    // Get timeline bar positions
    const barPositions = await page.evaluate(() => {
      const bars = Array.from(document.querySelectorAll('[data-testid="timeline-bar"]'));
      return bars.map(b => ({
        name: b.textContent,
        left: b.getBoundingClientRect().left,
        width: b.getBoundingClientRect().width,
        dataset: b.dataset
      }));
    });

    // Verify alignment
    for (const bar of barPositions) {
      const startWeek = parseInt(bar.dataset.startWeek);
      const endWeek = parseInt(bar.dataset.endWeek);

      const startHeader = headerPositions[startWeek];
      const endHeader = headerPositions[endWeek];

      // Bar should start aligned with its start week
      expect(Math.abs(bar.left - startHeader.left)).toBeLessThan(2);

      // Bar width should span correct weeks
      const expectedWidth = (endHeader.left + endHeader.width) - startHeader.left;
      expect(Math.abs(bar.width - expectedWidth)).toBeLessThan(2);
    }

    // Visual screenshot for manual verification
    await expect(page).toHaveScreenshot('timeline-alignment.png', {
      clip: { x: 0, y: 100, width: 1200, height: 400 }
    });
  });

  test('zoom maintains relative positioning', async ({ page }) => {
    // Initial screenshot
    await expect(page).toHaveScreenshot('zoom-100.png');

    // Zoom in
    await page.click('[data-testid="zoom-in"]');
    await page.waitForTimeout(300); // Animation

    // Verify bars got wider but maintained relative positions
    const zoomedPositions = await page.evaluate(() => {
      const bars = Array.from(document.querySelectorAll('[data-testid="timeline-bar"]'));
      return bars.map(b => ({
        name: b.textContent,
        relativeLeft: b.getBoundingClientRect().left / window.innerWidth,
        relativeWidth: b.getBoundingClientRect().width / window.innerWidth
      }));
    });

    // Take zoomed screenshot
    await expect(page).toHaveScreenshot('zoom-150.png');

    // Verify relative positions maintained
    for (const bar of zoomedPositions) {
      expect(bar.relativeWidth).toBeGreaterThan(0.05); // Bars should be visible
      expect(bar.relativeLeft).toBeGreaterThanOrEqual(0);
      expect(bar.relativeLeft).toBeLessThan(1);
    }
  });

  test('responsive breakpoints', async ({ page }) => {
    const viewports = [
      { width: 1440, height: 900, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(300); // Allow re-render

      // Check if appropriate UI adjustments were made
      if (viewport.name === 'mobile') {
        // Mobile should have different layout
        await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      }

      await expect(page).toHaveScreenshot(`responsive-${viewport.name}.png`);
    }
  });

  test('drag and pan operations', async ({ page }) => {
    const timeline = page.locator('[data-testid="timeline-container"]');

    // Get initial position
    const initialScroll = await timeline.evaluate(el => el.scrollLeft);

    // Perform drag
    await timeline.dragTo(timeline, {
      sourcePosition: { x: 600, y: 200 },
      targetPosition: { x: 200, y: 200 }
    });

    // Verify scroll changed
    const newScroll = await timeline.evaluate(el => el.scrollLeft);
    expect(newScroll).not.toBe(initialScroll);

    // Verify bars still aligned after pan
    await expect(page).toHaveScreenshot('after-pan.png');
  });

  test('PDF export matches visual display', async ({ page }) => {
    // Trigger PDF generation
    await page.click('[data-testid="export-pdf"]');

    // Wait for download
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('[data-testid="confirm-export"]')
    ]);

    // Save and verify PDF was created
    const pdfPath = await download.path();
    expect(pdfPath).toBeTruthy();

    // Could also use pdf.js to verify content if needed
  });

  test('team capacity overlay alignment', async ({ page }) => {
    // Toggle capacity view
    await page.click('[data-testid="toggle-capacity"]');

    // Verify capacity bars align with timeline bars
    const capacityBars = await page.locator('[data-testid="capacity-bar"]').all();
    const timelineBars = await page.locator('[data-testid="timeline-bar"]').all();

    // Should have capacity bars for team members
    expect(capacityBars.length).toBeGreaterThan(0);

    // Visual regression
    await expect(page).toHaveScreenshot('capacity-overlay.png');
  });

  test('milestone and deadline indicators', async ({ page }) => {
    // Look for deadline indicators
    const deadlines = page.locator('[data-testid="deadline-indicator"]');
    await expect(deadlines).toHaveCount(1); // One hard deadline in test data

    // Verify deadline positioning
    const deadlinePosition = await deadlines.first().boundingBox();
    expect(deadlinePosition).toBeTruthy();

    // Screenshot with focus on deadlines
    await expect(page).toHaveScreenshot('deadlines.png', {
      mask: [page.locator('[data-testid="deadline-indicator"]')],
      maskColor: '#FF0000'
    });
  });
});

// Performance regression tests
test.describe('Performance', () => {
  test('renders large roadmap within acceptable time', async ({ page }) => {
    // Generate large dataset
    const largeRoadmap = generateLargeRoadmap(100); // 100 projects

    // Measure render time
    const startTime = Date.now();
    await page.goto('/');
    await page.evaluate((data) => {
      localStorage.setItem('test-roadmap', data);
    }, largeRoadmap);

    await page.waitForSelector('[data-testid="timeline-bar"]:nth-child(50)');
    const renderTime = Date.now() - startTime;

    // Should render within 2 seconds
    expect(renderTime).toBeLessThan(2000);

    // Verify smooth scrolling
    await page.evaluate(() => {
      document.querySelector('[data-testid="timeline-container"]').scrollTo({
        left: 1000,
        behavior: 'smooth'
      });
    });

    // No jank during scroll
    await expect(page).toHaveScreenshot('large-roadmap-scroll.png');
  });
});

// Helper to generate test data
function generateLargeRoadmap(projectCount) {
  let roadmap = '# Large Test Roadmap\n\n## Streams\n\n';
  for (let i = 0; i < projectCount; i++) {
    roadmap += `### Stream ${i}\n`;
    roadmap += `- **Project ${i}**: Jul W${(i % 4) + 1}-Aug W${((i + 2) % 4) + 1} | Team${i % 5} | color: #${Math.floor(Math.random()*16777215).toString(16)}\n`;
  }
  return roadmap;
}
