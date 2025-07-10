// __tests__/visual/timeline-bars.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TimelineBar } from '../StreamComponents.jsx';

// Mock the parseTimelineRange function
vi.mock('../../domain/timelineParser.js', () => ({
  parseTimelineRange: vi.fn((timeline, weeks) => {
    // Mock implementation that matches the real logic
    if (!timeline) return { start: 0, end: 0 };
    
    const parts = timeline.split('-');
    if (parts.length !== 2) return { start: 0, end: 0 };
    
    const startIndex = weeks.indexOf(parts[0].trim());
    const endIndex = weeks.indexOf(parts[1].trim());
    
    return {
      start: startIndex >= 0 ? startIndex : 0,
      end: endIndex >= 0 ? endIndex : 0
    };
  })
}));

describe('Timeline Bars Visual Tests', () => {
  const mockWeeks = [
    'Jun W1', 'Jun W2', 'Jun W3', 'Jun W4',
    'Jul W1', 'Jul W2', 'Jul W3', 'Jul W4',
    'Aug W1', 'Aug W2', 'Aug W3', 'Aug W4',
    'Sep W1', 'Sep W2', 'Sep W3', 'Sep W4',
    'Oct W1', 'Oct W2', 'Oct W3', 'Oct W4',
    'Nov W1', 'Nov W2', 'Nov W3', 'Nov W4',
    'Dec W1', 'Dec W2', 'Dec W3', 'Dec W4'
  ];

  it('should render timeline bars with correct positioning and dimensions', () => {
    const testCases = [
      {
        name: 'Widget Framework v2.0',
        timeline: 'Jul W1-Sep W2',
        team: 'Team Phoenix',
        color: '#4F46E5',
        expectedLeft: '16rem',     // Jul W1 is index 4, so left = 4 * 4 = 16rem
        expectedWidth: '40rem'    // 10 weeks * 4rem = 40rem
      },
      {
        name: 'Notification Engine',
        timeline: 'Jul W3-Oct W4',
        team: 'Team Delta',
        color: '#EF4444',
        expectedLeft: '24rem',     // Jul W3 is index 6, so left = 6 * 4 = 24rem
        expectedWidth: '56rem'    // 14 weeks * 4rem = 56rem
      },
      {
        name: 'Data Visualization Tool',
        timeline: 'Aug W1-Oct W2',
        team: 'Team Eagle, Team Hawk',
        color: '#10B981',
        expectedLeft: '32rem',     // Aug W1 is index 8, so left = 8 * 4 = 32rem
        expectedWidth: '40rem'    // 10 weeks * 4rem = 40rem
      }
    ];

    testCases.forEach(({ name, timeline, team, color, expectedLeft, expectedWidth }) => {
      const { container } = render(
        <div style={{ position: 'relative', width: '1000px', height: '100px' }}>
          <TimelineBar
            item={{ name, timeline, team, color }}
            weeks={mockWeeks}
          />
        </div>
      );

      const timelineBar = container.querySelector('[class*="absolute"]');
      
      expect(timelineBar).toBeInTheDocument();
      expect(timelineBar).toHaveTextContent(name);
      
      // Check positioning and dimensions using inline styles
      expect(timelineBar.style.position).toBe('absolute');
      expect(timelineBar.style.left).toBe(expectedLeft);
      expect(timelineBar.style.width).toBe(expectedWidth);
      expect(timelineBar.style.backgroundColor).toBe(color);
      expect(timelineBar.style.zIndex).toBe('20');
    });
  });

  it('should handle edge cases gracefully', () => {
    const edgeCases = [
      {
        name: 'Single Week Task',
        timeline: 'Jul W1-Jul W1',
        expectedLeft: '16rem',
        expectedWidth: '4rem'
      },
      {
        name: 'Invalid Timeline',
        timeline: 'Invalid-Range',
        expectedLeft: '0rem',
        expectedWidth: '4rem'
      },
      {
        name: 'Empty Timeline',
        timeline: '',
        expectedLeft: '0rem',
        expectedWidth: '4rem'
      }
    ];

    edgeCases.forEach(({ name, timeline, expectedLeft, expectedWidth }) => {
      const { container } = render(
        <div style={{ position: 'relative', width: '1000px', height: '100px' }}>
          <TimelineBar
            item={{ name, timeline, team: 'Test Team', color: '#000000' }}
            weeks={mockWeeks}
          />
        </div>
      );

      const timelineBar = container.querySelector('[class*="absolute"]');
      
      expect(timelineBar).toBeInTheDocument();
      const style = timelineBar.style;
      expect(style.left).toBe(expectedLeft);
      expect(style.width).toBe(expectedWidth);
    });
  });

  it('should have correct CSS classes and styling', () => {
    const { container } = render(
      <div style={{ position: 'relative', width: '1000px', height: '100px' }}>
        <TimelineBar
          item={{
            name: 'Test Item',
            timeline: 'Jul W1-Sep W2',
            team: 'Test Team',
            color: '#4F46E5'
          }}
          weeks={mockWeeks}
        />
      </div>
    );

    const timelineBar = container.querySelector('[class*="absolute"]');
    
    // Check required CSS classes
    expect(timelineBar).toHaveClass('absolute');
    expect(timelineBar).toHaveClass('top-1');
    expect(timelineBar).toHaveClass('rounded');
    expect(timelineBar).toHaveClass('text-white');
    expect(timelineBar).toHaveClass('text-sm');
    expect(timelineBar).toHaveClass('font-medium');
    expect(timelineBar).toHaveClass('flex');
    expect(timelineBar).toHaveClass('items-center');
    expect(timelineBar).toHaveClass('justify-start');
    expect(timelineBar).toHaveClass('cursor-help');
    
    // Check inline styles
    expect(timelineBar.style.position).toBe('absolute');
    expect(timelineBar.style.height).toBe('2rem');
    expect(timelineBar.style.zIndex).toBe('20');
    expect(timelineBar.style.textShadow).toBe('1px 1px 2px rgba(0,0,0,0.5)');
  });

  it('should render timeline bars without overlapping', () => {
    // Test multiple timeline bars to ensure they don't overlap incorrectly
    const items = [
      { name: 'Task Alpha', timeline: 'Jul W1-Jul W4', team: 'Team Phoenix', color: '#FF0000' },
      { name: 'Task Beta', timeline: 'Aug W1-Aug W4', team: 'Team Delta', color: '#00FF00' },
      { name: 'Task Gamma', timeline: 'Sep W1-Sep W4', team: 'Team Eagle', color: '#0000FF' }
    ];

    const { container } = render(
      <div style={{ position: 'relative', width: '1000px', height: '100px' }}>
        {items.map((item, index) => (
          <TimelineBar
            key={index}
            item={item}
            weeks={mockWeeks}
          />
        ))}
      </div>
    );

    const timelineBars = container.querySelectorAll('[class*="absolute"]');
    
    expect(timelineBars).toHaveLength(3);
    
    // Check that each bar has a different left position
    const leftPositions = Array.from(timelineBars).map(bar => bar.style.left);
    expect(leftPositions).toEqual(['16rem', '32rem', '48rem']);
  });

  it('should maintain positioning calculation consistency', () => {
    // This test ensures the positioning calculation doesn't regress
    const testItem = {
      name: 'Consistency Test Widget',
      timeline: 'Jul W1-Sep W2',
      team: 'Team Phoenix',
      color: '#4F46E5'
    };

    const { container } = render(
      <div style={{ position: 'relative', width: '1000px', height: '100px' }}>
        <TimelineBar item={testItem} weeks={mockWeeks} />
      </div>
    );

    const timelineBar = container.querySelector('[class*="absolute"]');
    
    // These values should match the fixed calculation:
    // Jul W1 is index 4, so left = 4 * 4 = 16rem
    // Jul W1 to Sep W2 is 10 weeks, so width = 10 * 4 = 40rem
    expect(timelineBar.style.left).toBe('16rem');
    expect(timelineBar.style.width).toBe('40rem');
  });
});
