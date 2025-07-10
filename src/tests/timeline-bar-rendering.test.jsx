/**
 * Timeline Bar Rendering Integration Test
 *
 * This test ensures that project timeline bars are properly rendered and positioned.
 * It prevents regression of the critical bug where timeline bars were not visible
 * due to incorrect positioning calculations.
 *
 * Bug History:
 * - Timeline bars were being positioned way off-screen due to incorrect pixel calculations
 * - The positioning formula was using (start * 4) * 64px instead of start * 64px
 * - This caused bars to appear at 1024px+ instead of visible positions like 256px
 *
 * Current Fix:
 * - left = start (week index)
 * - width = (end - start + 1) (number of weeks)
 * - Final positioning: left * 64px, width * 64px
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RoadmapPlanner } from '../components/RoadmapPlanner.jsx';

// Mock roadmap data for testing - using correct markdown format
const mockRoadmapData = `
# Sample Project Roadmap

## Streams

### Product Stream Alpha
- **Widget Framework v2.0**: Jul W1-Sep W2 | Team Phoenix | hard-deadline: 2025-09-15 | color: #8B5CF6

### Product Stream Beta
- **Notification Engine**: Jul W3-Oct W4 | Team Delta | color: #EF4444
- **Data Visualization Tool**: Aug W1-Oct W2 | Team Eagle, Team Hawk | color: #10B981
`;

describe('Timeline Bar Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render timeline bars visible within the component', async () => {
    const { container } = render(
      <RoadmapPlanner
        markdownData={mockRoadmapData}
        enableDebug={false}
        loadingDelay={0}
      />
    );

    // Wait for component to finish loading - use a more flexible approach
    await waitFor(() => {
      const timelineBars = container.querySelectorAll('[data-testid="timeline-bar"]');
      expect(timelineBars.length).toBeGreaterThan(0);
    }, { timeout: 5000 });

    // Get all timeline bars
    const timelineBars = container.querySelectorAll('[data-testid="timeline-bar"]');

    // Verify timeline bars exist
    expect(timelineBars.length).toBeGreaterThan(0);

    // Verify each timeline bar is visible and has proper styling
    timelineBars.forEach((bar) => {
      expect(bar).toBeInTheDocument();

      // Check CSS classes (more reliable than inline styles in test environment)
      expect(bar).toHaveClass('absolute');
      expect(bar).toHaveClass('top-1');
      expect(bar).toHaveClass('rounded');
      expect(bar).toHaveClass('text-white');
      expect(bar).toHaveClass('text-sm');
      expect(bar).toHaveClass('font-medium');
      expect(bar).toHaveClass('flex');
      expect(bar).toHaveClass('items-center');
      expect(bar).toHaveClass('justify-start');
      expect(bar).toHaveClass('cursor-help');

      // Check inline styles that are explicitly set
      expect(bar.style.left).toMatch(/rem$/);
      expect(bar.style.width).toMatch(/rem$/);
      expect(bar.style.height).toBe('2rem');
      expect(bar.style.zIndex).toBe('20');
      expect(bar.style.backgroundColor).toBeTruthy();
    });
  });

  it('should position timeline bars correctly using pixel calculations', async () => {
    const { container } = render(
      <RoadmapPlanner
        markdownData={mockRoadmapData}
        enableDebug={false}
        loadingDelay={0}
      />
    );

    await waitFor(() => {
      const timelineBars = container.querySelectorAll('[data-testid="timeline-bar"]');
      expect(timelineBars.length).toBeGreaterThan(0);
    }, { timeout: 5000 });

    // Get timeline bars
    const timelineBars = container.querySelectorAll('[data-testid="timeline-bar"]');

    // Verify positioning is reasonable (not way off-screen)
    timelineBars.forEach((bar) => {
      const leftValue = parseFloat(bar.style.left);
      const widthValue = parseFloat(bar.style.width);

      // Critical regression test: bars should not be positioned way off-screen
      expect(leftValue).toBeGreaterThanOrEqual(0);
      expect(leftValue).toBeLessThan(100); // In rem units, should be reasonable

      // Width should be reasonable
      expect(widthValue).toBeGreaterThan(4);  // At least 1 week (4rem)
      expect(widthValue).toBeLessThan(60); // Not too large (15 weeks max)
    });
  });

  it('should display timeline bars with correct text content', async () => {
    const { container } = render(
      <RoadmapPlanner
        markdownData={mockRoadmapData}
        enableDebug={false}
        loadingDelay={0}
      />
    );

    await waitFor(() => {
      const timelineBars = container.querySelectorAll('[data-testid="timeline-bar"]');
      expect(timelineBars.length).toBeGreaterThan(0);
    }, { timeout: 5000 });

    // Verify timeline bars contain expected project names using container queries
    const timelineBars = container.querySelectorAll('[data-testid="timeline-bar"]');
    const barTexts = Array.from(timelineBars).map(bar => bar.textContent);

    expect(barTexts).toContain('Widget Framework v2.0');
    expect(barTexts).toContain('Notification Engine');
    expect(barTexts).toContain('Data Visualization Tool');
  });

  it('should have timeline bars with proper z-index stacking', async () => {
    const { container } = render(
      <RoadmapPlanner
        markdownData={mockRoadmapData}
        enableDebug={false}
        loadingDelay={0}
      />
    );

    await waitFor(() => {
      const timelineBars = container.querySelectorAll('[data-testid="timeline-bar"]');
      expect(timelineBars.length).toBeGreaterThan(0);
    }, { timeout: 5000 });

    // Get timeline bars
    const timelineBars = container.querySelectorAll('[data-testid="timeline-bar"]');

    // Verify z-index is high enough to appear above other elements
    timelineBars.forEach((bar) => {
      expect(parseInt(bar.style.zIndex)).toBeGreaterThanOrEqual(20);
    });
  });

  it('should render timeline bars for all streams', async () => {
    const { container } = render(
      <RoadmapPlanner
        markdownData={mockRoadmapData}
        enableDebug={false}
        loadingDelay={0}
      />
    );

    await waitFor(() => {
      const roadmapContainer = container.querySelector('[data-testid="roadmap-container"]');
      expect(roadmapContainer).toBeInTheDocument();
    });

    // Get all stream containers
    const streamContainers = container.querySelectorAll('[data-testid="stream-container"]');
    expect(streamContainers.length).toBeGreaterThanOrEqual(2); // Product Stream Alpha + Product Stream Beta

    // Get all timeline bars
    const timelineBars = container.querySelectorAll('[data-testid="timeline-bar"]');
    expect(timelineBars.length).toBe(3); // Widget Framework v2.0, Notification Engine, Data Visualization Tool
  });

  it('should handle container overflow correctly', async () => {
    const { container } = render(
      <RoadmapPlanner
        markdownData={mockRoadmapData}
        enableDebug={false}
        loadingDelay={0}
      />
    );

    await waitFor(() => {
      const roadmapContainer = container.querySelector('[data-testid="roadmap-container"]');
      expect(roadmapContainer).toBeInTheDocument();
    });

    // Check that containers have overflow: visible to prevent clipping
    const streamContainers = container.querySelectorAll('[data-testid="stream-container"]');
    streamContainers.forEach((container) => {
      // The container should not clip timeline bars
      expect(container).toHaveClass('overflow-visible');
    });
  });
});

describe('Timeline Bar Positioning Calculations', () => {
  it('should calculate positions correctly for specific projects', async () => {
    const { container } = render(
      <RoadmapPlanner
        markdownData={mockRoadmapData}
        enableDebug={false}
        loadingDelay={0}
      />
    );

    await waitFor(() => {
      const roadmapContainer = container.querySelector('[data-testid="roadmap-container"]');
      expect(roadmapContainer).toBeInTheDocument();
    });

    // Get all timeline bars and find them by text content
    const timelineBars = container.querySelectorAll('[data-testid="timeline-bar"]');
    const widgetFrameworkBar = Array.from(timelineBars).find(bar => bar.textContent.includes('Widget Framework v2.0'));
    const notificationEngineBar = Array.from(timelineBars).find(bar => bar.textContent.includes('Notification Engine'));
    const dataVisualizationBar = Array.from(timelineBars).find(bar => bar.textContent.includes('Data Visualization Tool'));

    // Verify Widget Framework positioning (Jul W1-Sep W2)
    if (widgetFrameworkBar) {
      const leftValue = parseFloat(widgetFrameworkBar.style.left);
      // Jul W1 should be around index 4, so 4 * 4 = 16rem
      expect(leftValue).toBeGreaterThan(12);
      expect(leftValue).toBeLessThan(20);
    }

    // Verify Notification Engine positioning (Jul W3-Oct W4)
    if (notificationEngineBar) {
      const leftValue = parseFloat(notificationEngineBar.style.left);
      // Jul W3 should be around index 6, so 6 * 4 = 24rem
      expect(leftValue).toBeGreaterThan(20);
      expect(leftValue).toBeLessThan(28);
    }

    // Verify Data Visualization Tool positioning (Aug W1-Oct W2)
    if (dataVisualizationBar) {
      const leftValue = parseFloat(dataVisualizationBar.style.left);
      // Aug W1 should be around index 8, so 8 * 4 = 32rem
      expect(leftValue).toBeGreaterThan(28);
      expect(leftValue).toBeLessThan(36);
    }
  });

  it('should use correct width calculations', async () => {
    const { container } = render(
      <RoadmapPlanner
        markdownData={mockRoadmapData}
        enableDebug={false}
        loadingDelay={0}
      />
    );

    await waitFor(() => {
      const roadmapContainer = container.querySelector('[data-testid="roadmap-container"]');
      expect(roadmapContainer).toBeInTheDocument();
    });

    // Test width calculations
    const timelineBars = container.querySelectorAll('[data-testid="timeline-bar"]');
    const widgetFrameworkBar = Array.from(timelineBars).find(bar => bar.textContent.includes('Widget Framework v2.0'));

    if (widgetFrameworkBar) {
      const widthValue = parseFloat(widgetFrameworkBar.style.width);
      // Jul W1-Sep W2 should be about 10 weeks, so 10 * 4 = 40rem
      expect(widthValue).toBeGreaterThan(35);
      expect(widthValue).toBeLessThan(45);
    }
  });

  it('should prevent the original positioning bug', async () => {
    const { container } = render(
      <RoadmapPlanner
        markdownData={mockRoadmapData}
        enableDebug={false}
        loadingDelay={0}
      />
    );

    await waitFor(() => {
      const roadmapContainer = container.querySelector('[data-testid="roadmap-container"]');
      expect(roadmapContainer).toBeInTheDocument();
    });

    // This test specifically prevents the regression bug where bars were positioned at 1024px+
    const timelineBars = container.querySelectorAll('[data-testid="timeline-bar"]');

    timelineBars.forEach((bar) => {
      const leftValue = parseFloat(bar.style.left);

      // The original bug caused positions like 1024px, 1536px, etc.
      // These should never happen with correct calculations (now in rem)
      expect(leftValue).toBeLessThan(100); // In rem units
      expect(leftValue).toBeGreaterThanOrEqual(0);
    });
  });
});
