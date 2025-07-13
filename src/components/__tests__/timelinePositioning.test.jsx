// src/components/__tests__/timelinePositioning.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { StreamItem } from '../StreamItem.jsx';
import { CapacityBar } from '../TeamCapacity.jsx';

// Mock the timelineParser since we're testing the positioning logic
vi.mock('../../domain/timelineParser.js', () => ({
  parseTimelineRange: vi.fn(() => ({ start: 0, end: 2 })) // Default weekly fallback
}));

describe('Timeline Bar Positioning Bug Tests', () => {
  describe('StreamItem Timeline Bar Positioning', () => {
    const mockWeeks = ['Jul W1', 'Jul W2', 'Jul W3', 'Jul W4'];
    const mockDays = [
      { date: new Date('2025-07-15'), label: 'Tue 15', dayOfWeek: 'Tue', dayOfMonth: 15, isWeekday: true, isWeekend: false },
      { date: new Date('2025-07-16'), label: 'Wed 16', dayOfWeek: 'Wed', dayOfMonth: 16, isWeekday: true, isWeekend: false },
      { date: new Date('2025-07-17'), label: 'Thu 17', dayOfWeek: 'Thu', dayOfMonth: 17, isWeekday: true, isWeekend: false },
      { date: new Date('2025-07-18'), label: 'Fri 18', dayOfWeek: 'Fri', dayOfMonth: 18, isWeekday: true, isWeekend: false },
      { date: new Date('2025-07-21'), label: 'Mon 21', dayOfWeek: 'Mon', dayOfMonth: 21, isWeekday: true, isWeekend: false }
    ];

    it('should use startDay/endDay for daily granularity positioning', () => {
      const itemWithDailyIndices = {
        name: 'Mobile App v3.0',
        timeline: '2025-07-15 to 2025-07-18',
        team: 'Alex, Jordan',
        color: '#4F46E5',
        startDay: 0,  // Should start at day 0
        endDay: 3     // Should end at day 3
      };

      const { container } = render(
        <StreamItem
          item={itemWithDailyIndices}
          weeks={mockDays}
          currentWeekIndex={-1}
          hardDeadlines={[]}
          softDeadlines={[]}
          risks={[]}
          granularity="daily"
        />
      );

      const timelineBar = container.querySelector('[data-testid="timeline-bar"]');
      expect(timelineBar).toBeTruthy();
      
      // Should use daily indices: left = 0 * 4rem = 0rem, width = (3-0+1) * 4rem = 16rem
      expect(timelineBar.style.left).toBe('0rem');
      expect(timelineBar.style.width).toBe('16rem');
    });

    it('should use parseTimelineRange for weekly granularity positioning', () => {
      const itemWithoutDailyIndices = {
        name: 'Project Task',
        timeline: 'Jul W1-Jul W2',
        team: 'Team A',
        color: '#10B981'
        // No startDay/endDay properties
      };

      const { container } = render(
        <StreamItem
          item={itemWithoutDailyIndices}
          weeks={mockWeeks}
          currentWeekIndex={-1}
          hardDeadlines={[]}
          softDeadlines={[]}
          risks={[]}
          granularity="weekly"
        />
      );

      const timelineBar = container.querySelector('[data-testid="timeline-bar"]');
      expect(timelineBar).toBeTruthy();
      
      // Should use parseTimelineRange result: start=0, end=2 → left=0rem, width=12rem
      expect(timelineBar.style.left).toBe('0rem');
      expect(timelineBar.style.width).toBe('12rem');
    });

    it('should handle missing daily indices gracefully in daily mode', () => {
      const itemWithoutIndices = {
        name: 'Broken Item',
        timeline: '2025-07-15 to 2025-07-18',
        team: 'Team B',
        color: '#EF4444'
        // Missing startDay/endDay
      };

      const { container } = render(
        <StreamItem
          item={itemWithoutIndices}
          weeks={mockDays}
          currentWeekIndex={-1}
          hardDeadlines={[]}
          softDeadlines={[]}
          risks={[]}
          granularity="daily"
        />
      );

      const timelineBar = container.querySelector('[data-testid="timeline-bar"]');
      expect(timelineBar).toBeTruthy();
      
      // Should fallback to 0,0 → left=0rem, width=4rem
      expect(timelineBar.style.left).toBe('0rem');
      expect(timelineBar.style.width).toBe('4rem');
    });

    it('should position multiple items correctly in daily view', () => {
      const items = [
        { name: 'Task A', startDay: 0, endDay: 2, team: 'Team A', color: '#4F46E5', timeline: 'test' },
        { name: 'Task B', startDay: 1, endDay: 4, team: 'Team B', color: '#10B981', timeline: 'test' },
        { name: 'Task C', startDay: 3, endDay: 4, team: 'Team C', color: '#F59E0B', timeline: 'test' }
      ];

      const expectedPositions = [
        { left: '0rem', width: '12rem' },    // Task A: 0-2 → (2-0+1)*4 = 12rem
        { left: '4rem', width: '16rem' },    // Task B: 1-4 → (4-1+1)*4 = 16rem  
        { left: '12rem', width: '8rem' }     // Task C: 3-4 → (4-3+1)*4 = 8rem
      ];

      items.forEach((item, index) => {
        const { container } = render(
          <StreamItem
            item={item}
            weeks={mockDays}
            currentWeekIndex={-1}
            hardDeadlines={[]}
            softDeadlines={[]}
            risks={[]}
            granularity="daily"
          />
        );

        const timelineBar = container.querySelector('[data-testid="timeline-bar"]');
        expect(timelineBar.style.left).toBe(expectedPositions[index].left);
        expect(timelineBar.style.width).toBe(expectedPositions[index].width);
      });
    });
  });

  describe('Weekday-Only Positioning Tests', () => {
    it('should position timeline bars correctly in weekday-only view', () => {
      // Mock a weekday-only timeline (skipping Saturday/Sunday)
      const weekdayOnlyDays = [
        { date: new Date('2025-07-15'), label: 'Tue 15', dayOfWeek: 'Tue', dayOfMonth: 15, isWeekday: true, isWeekend: false },
        { date: new Date('2025-07-16'), label: 'Wed 16', dayOfWeek: 'Wed', dayOfMonth: 16, isWeekday: true, isWeekend: false },
        { date: new Date('2025-07-17'), label: 'Thu 17', dayOfWeek: 'Thu', dayOfMonth: 17, isWeekday: true, isWeekend: false },
        { date: new Date('2025-07-18'), label: 'Fri 18', dayOfWeek: 'Fri', dayOfMonth: 18, isWeekday: true, isWeekend: false },
        { date: new Date('2025-07-21'), label: 'Mon 21', dayOfWeek: 'Mon', dayOfMonth: 21, isWeekday: true, isWeekend: false }, // Skipped weekend
        { date: new Date('2025-07-22'), label: 'Tue 22', dayOfWeek: 'Tue', dayOfMonth: 22, isWeekday: true, isWeekend: false }
      ];
      
      // Task spanning Friday to Monday (across weekend, but weekend days not in timeline)
      const crossWeekendTask = {
        name: 'Cross Weekend Task',
        timeline: '2025-07-18 to 2025-07-21',
        team: 'DevOps Team',
        color: '#4F46E5',
        startDay: 3, // Friday (index 3)
        endDay: 4    // Monday (index 4, weekend skipped)
      };
      
      const { container } = render(
        <StreamItem
          item={crossWeekendTask}
          weeks={weekdayOnlyDays}
          currentWeekIndex={-1}
          hardDeadlines={[]}
          softDeadlines={[]}
          risks={[]}
          granularity="daily"
        />
      );
      
      const timelineBar = container.querySelector('[data-testid="timeline-bar"]');
      
      // Should position correctly: Fri (index 3) to Mon (index 4)
      expect(timelineBar.style.left).toBe('12rem'); // 3 * 4rem
      expect(timelineBar.style.width).toBe('8rem');  // (4-3+1) * 4rem
    });
    
    it('should handle capacity bars in weekday-only view', () => {
      const weekdayOnlyDays = [
        { date: new Date('2025-07-15'), label: 'Tue 15', dayOfWeek: 'Tue', dayOfMonth: 15, isWeekday: true, isWeekend: false },
        { date: new Date('2025-07-16'), label: 'Wed 16', dayOfWeek: 'Wed', dayOfMonth: 16, isWeekday: true, isWeekend: false },
        { date: new Date('2025-07-17'), label: 'Thu 17', dayOfWeek: 'Thu', dayOfMonth: 17, isWeekday: true, isWeekend: false },
        { date: new Date('2025-07-18'), label: 'Fri 18', dayOfWeek: 'Fri', dayOfMonth: 18, isWeekday: true, isWeekend: false },
        { date: new Date('2025-07-21'), label: 'Mon 21', dayOfWeek: 'Mon', dayOfMonth: 21, isWeekday: true, isWeekend: false }
      ];
      
      // Team leave from Wednesday to Friday
      const weekdayLeave = {
        name: 'Team Leave',
        timeline: '2025-07-16 to 2025-07-18',
        color: '#FFA500',
        startDay: 1, // Wednesday (index 1)
        endDay: 3    // Friday (index 3)
      };
      
      const { container } = render(
        <div style={{ position: 'relative' }}>
          <CapacityBar
            capacity={weekdayLeave}
            weeks={weekdayOnlyDays}
            granularity="daily"
          />
        </div>
      );
      
      const capacityBar = container.querySelector('div[title*="Team Leave"]');
      
      // Should position Wed-Fri correctly in weekday-only timeline
      expect(capacityBar.style.left).toBe('4rem');  // 1 * 4rem (Wednesday)
      expect(capacityBar.style.width).toBe('12rem'); // (3-1+1) * 4rem (Wed-Fri = 3 days)
    });
  });

  describe('CapacityBar Positioning', () => {
    const mockWeeks = ['Jul W1', 'Jul W2', 'Jul W3'];
    const mockDays = [
      { date: new Date('2025-07-15'), label: 'Tue 15', dayOfWeek: 'Tue', dayOfMonth: 15, isWeekday: true, isWeekend: false },
      { date: new Date('2025-07-16'), label: 'Wed 16', dayOfWeek: 'Wed', dayOfMonth: 16, isWeekday: true, isWeekend: false },
      { date: new Date('2025-07-17'), label: 'Thu 17', dayOfWeek: 'Thu', dayOfMonth: 17, isWeekday: true, isWeekend: false }
    ];

    it('should use startDay/endDay for daily granularity in capacity bars', () => {
      const capacityWithDailyIndices = {
        name: 'Alex Annual Leave',
        timeline: '2025-07-16 to 2025-07-17',
        color: '#FFA500',
        startDay: 1,  // Wed 16
        endDay: 2     // Thu 17
      };

      const { container } = render(
        <div style={{ position: 'relative' }}>
          <CapacityBar
            capacity={capacityWithDailyIndices}
            weeks={mockDays}
            granularity="daily"
          />
        </div>
      );

      const capacityBar = container.querySelector('div[title*="Alex Annual Leave"]');
      expect(capacityBar).toBeTruthy();
      
      // Should use daily indices: left = 1 * 4rem = 4rem, width = (2-1+1) * 4rem = 8rem
      expect(capacityBar.style.left).toBe('4rem');
      expect(capacityBar.style.width).toBe('8rem');
    });

    it('should use parseTimelineRange for weekly granularity in capacity bars', () => {
      const capacityWithoutDailyIndices = {
        name: 'Team Holiday',
        timeline: 'Jul W1-Jul W2',
        color: '#9333EA'
        // No startDay/endDay
      };

      const { container } = render(
        <div style={{ position: 'relative' }}>
          <CapacityBar
            capacity={capacityWithoutDailyIndices}
            weeks={mockWeeks}
            granularity="weekly"
          />
        </div>
      );

      const capacityBar = container.querySelector('div[title*="Team Holiday"]');
      expect(capacityBar).toBeTruthy();
      
      // Should use parseTimelineRange mock: start=0, end=2 → left=0rem, width=12rem
      expect(capacityBar.style.left).toBe('0rem');
      expect(capacityBar.style.width).toBe('12rem');
    });
  });

  describe('Regression Test for All-Items-On-First-Day Bug', () => {
    it('should prevent timeline bars from clustering on first day', () => {
      // This test specifically addresses the bug where all timeline bars
      // appeared on the first day regardless of their actual date ranges
      
      const items = [
        { 
          name: 'Mobile App v3.0', 
          timeline: '2025-07-15 to 2025-07-23',
          startDay: 0, endDay: 8,
          team: 'Alex, Jordan', 
          color: '#4F46E5' 
        },
        { 
          name: 'Push Notifications', 
          timeline: '2025-07-18 to 2025-07-25',
          startDay: 3, endDay: 10,
          team: 'Taylor, Morgan', 
          color: '#10B981' 
        },
        { 
          name: 'API Optimization', 
          timeline: '2025-07-16 to 2025-07-22',
          startDay: 1, endDay: 7,
          team: 'Morgan', 
          color: '#EF4444' 
        }
      ];

      const mockDays = Array.from({ length: 15 }, (_, i) => ({
        date: new Date(2025, 6, 15 + i), // July 15-29
        label: `Day ${i}`,
        dayOfWeek: 'Day',
        dayOfMonth: 15 + i
      }));

      // Test that each item gets positioned differently
      const positions = items.map(item => {
        const { container } = render(
          <StreamItem
            item={item}
            weeks={mockDays}
            currentWeekIndex={-1}
            hardDeadlines={[]}
            softDeadlines={[]}
            risks={[]}
            granularity="daily"
          />
        );

        const timelineBar = container.querySelector('[data-testid="timeline-bar"]');
        return {
          left: timelineBar.style.left,
          width: timelineBar.style.width,
          name: item.name
        };
      });

      // Verify all items have different starting positions
      const uniqueLeftPositions = new Set(positions.map(p => p.left));
      expect(uniqueLeftPositions.size).toBe(3); // All 3 items should have different left positions
      
      // Verify specific expected positions
      expect(positions[0].left).toBe('0rem');   // Mobile App starts at day 0
      expect(positions[1].left).toBe('12rem');  // Push Notifications starts at day 3
      expect(positions[2].left).toBe('4rem');   // API Optimization starts at day 1
      
      // Verify they have appropriate widths
      expect(positions[0].width).toBe('36rem');  // Mobile App: 9 days
      expect(positions[1].width).toBe('32rem');  // Push Notifications: 8 days
      expect(positions[2].width).toBe('28rem');  // API Optimization: 7 days
    });

    it('should verify the bug does NOT occur when granularity prop is missing', () => {
      // This test ensures the component gracefully defaults to weekly mode
      // when granularity prop is not provided (backward compatibility)
      
      const item = {
        name: 'Test Item',
        timeline: '2025-07-15 to 2025-07-18',
        startDay: 5, // This should be ignored in weekly mode
        endDay: 8,   // This should be ignored in weekly mode
        team: 'Test Team',
        color: '#123456'
      };

      const { container } = render(
        <StreamItem
          item={item}
          weeks={['Jul W1', 'Jul W2']}
          currentWeekIndex={-1}
          hardDeadlines={[]}
          softDeadlines={[]}
          risks={[]}
          // granularity prop intentionally omitted - should default to 'weekly'
        />
      );

      const timelineBar = container.querySelector('[data-testid="timeline-bar"]');
      
      // Should use parseTimelineRange (mocked to return start=0, end=2)
      // NOT the startDay/endDay values
      expect(timelineBar.style.left).toBe('0rem');
      expect(timelineBar.style.width).toBe('12rem');
    });
  });
});
