// src/domain/__tests__/timelineParser.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  generateWeeks, 
  getCurrentWeek, 
  parseTimelineRange, 
  parseDeadlineDate, 
  parseMarkdown 
} from '../timelineParser.js';

describe('timelineParser', () => {
  let testQuarters;
  let testWeeks;

  beforeEach(() => {
    // Reset timers first
    vi.useRealTimers();
    
    testQuarters = [
      { name: 'Q2 2025', months: ['Jun'] },
      { name: 'Q3 2025', months: ['Jul', 'Aug', 'Sep'] },
      { name: 'Q4 2025', months: ['Oct', 'Nov', 'Dec'] }
    ];
    testWeeks = generateWeeks(testQuarters);
    
    // Mock console.warn to avoid noise in tests
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('generateWeeks', () => {
    it('should generate all weeks for given quarters', () => {
      // Act
      const weeks = generateWeeks(testQuarters);
      
      // Assert
      expect(weeks).toHaveLength(28); // 7 months × 4 weeks = 28
      expect(weeks[0]).toBe('Jun W1');
      expect(weeks[3]).toBe('Jun W4');
      expect(weeks[4]).toBe('Jul W1');
      expect(weeks[27]).toBe('Dec W4');
    });

    it('should include June weeks for timeline ranges', () => {
      // Act
      const weeks = generateWeeks(testQuarters);
      
      // Assert
      expect(weeks).toContain('Jun W3');
      expect(weeks).toContain('Jul W3');
      expect(weeks.indexOf('Jun W3')).toBeLessThan(weeks.indexOf('Jul W3'));
    });
  });

  describe('getCurrentWeek', () => {
    it('should handle dates that would be week 5 by mapping to week 4', () => {
      // Arrange - Use vi.setSystemTime to mock the date
      vi.setSystemTime(new Date('2025-09-30')); // Sept 30th = Week 5
      
      // Act
      const result = getCurrentWeek(testWeeks);
      
      // Assert
      expect(result).toBe('Sep W4'); // Should map to Week 4, not fallback
      
      // Cleanup
      vi.useRealTimers();
    });

    it('should not fallback to default when week 5 dates are properly mapped', () => {
      // Arrange - Use vi.setSystemTime to mock the date
      vi.setSystemTime(new Date('2025-07-31')); // July 31st = Week 5
      
      // Act
      const result = getCurrentWeek(testWeeks, 'FALLBACK');
      
      // Assert
      expect(result).toBe('Jul W4'); // Should be Jul W4, not 'FALLBACK'
      
      // Cleanup
      vi.useRealTimers();
    });
  });

  describe('parseTimelineRange', () => {
    it('should parse valid timeline ranges', () => {
      // Arrange
      const timeline = 'Jun W3-Jul W3';
      
      // Act
      const result = parseTimelineRange(timeline, testWeeks);
      
      // Assert
      expect(result.start).toBe(2); // Jun W3 is index 2
      expect(result.end).toBe(6);   // Jul W3 is index 6
      expect(result.start).toBeLessThan(result.end);
    });

    it('should handle timeline ranges within same month', () => {
      // Arrange
      const timeline = 'Jul W1-Jul W3';
      
      // Act
      const result = parseTimelineRange(timeline, testWeeks);
      
      // Assert
      expect(result.start).toBe(4); // Jul W1
      expect(result.end).toBe(6);   // Jul W3
    });

    it('should return zero indices for invalid timeline', () => {
      // Arrange
      const timeline = 'Invalid-Timeline';
      
      // Act
      const result = parseTimelineRange(timeline, testWeeks);
      
      // Assert
      expect(result.start).toBe(0);
      expect(result.end).toBe(0);
    });

    it('should warn about missing weeks', () => {
      // Arrange
      const timeline = 'May W1-May W2'; // May not in our quarters
      
      // Act
      parseTimelineRange(timeline, testWeeks);
      
      // Assert
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Start week "May W1" not found')
      );
    });
  });

  describe('parseDeadlineDate', () => {
    it('should parse ISO date format', () => {
      // Arrange
      const dateStr = '2025-07-15';
      
      // Debug: Log the test setup
      console.log('DEBUG: testWeeks length:', testWeeks.length);
      console.log('DEBUG: Jul weeks:', testWeeks.filter(w => w.startsWith('Jul')));
      console.log('DEBUG: Testing date:', dateStr);
      
      // Act
      const result = parseDeadlineDate(dateStr, testWeeks);
      
      // Debug: Log the result
      console.log('DEBUG: parseDeadlineDate result:', result);
      if (result !== null) {
        console.log('DEBUG: Maps to week:', testWeeks[result]);
      }
      
      // Assert
      expect(result).toBe(6); // Jul W3 (15th is in week 3)
    });

    it('should handle end-of-month dates that would be week 5 by mapping to week 4', () => {
      // Arrange - These dates would normally map to Week 5, which doesn't exist
      const testCases = [
        { date: '2025-09-30', expectedWeek: 'Sep W4' }, // Sept 30th = Week 5 → Week 4
        { date: '2025-09-29', expectedWeek: 'Sep W4' }, // Sept 29th = Week 5 → Week 4
        { date: '2025-07-29', expectedWeek: 'Jul W4' }, // July 29th = Week 5 → Week 4
        { date: '2025-07-31', expectedWeek: 'Jul W4' }  // July 31st = Week 5 → Week 4
      ];

      testCases.forEach(({ date, expectedWeek }) => {
        // Act
        const result = parseDeadlineDate(date, testWeeks);
        
        // Assert
        expect(result).not.toBeNull();
        const actualWeek = testWeeks[result];
        expect(actualWeek).toBe(expectedWeek);
      });
    });

    it('should not warn about week 5 dates when they are properly mapped to week 4', () => {
      // Arrange
      vi.clearAllMocks();
      const dateStr = '2025-09-30'; // This would be Week 5
      
      // Act
      const result = parseDeadlineDate(dateStr, testWeeks);
      
      // Assert
      expect(result).not.toBeNull();
      expect(console.warn).not.toHaveBeenCalledWith(
        expect.stringContaining('Deadline week "Sep W5" not found')
      );
    });

    it('should handle the specific problematic dates from the console error', () => {
      // Arrange - These are the exact dates causing issues in the console
      const problematicDates = [
        '2025-09-30', // Console error: "Sep W5" not found
        '2025-09-29', // Console error: "Sep W5" not found
        '2025-10-31'  // NEW: Test output shows "Oct W5" issue
      ];

      problematicDates.forEach(dateStr => {
        // Act
        const result = parseDeadlineDate(dateStr, testWeeks);
        
        // Assert
        expect(result).not.toBeNull();
        if (dateStr.startsWith('2025-09')) {
          expect(testWeeks[result]).toBe('Sep W4'); // Should map to Sep W4
        } else if (dateStr.startsWith('2025-10')) {
          expect(testWeeks[result]).toBe('Oct W4'); // Should map to Oct W4
        }
      });
    });

    it('should parse month-day format', () => {
      // Arrange
      const dateStr = 'Aug 20';
      
      // Act
      const result = parseDeadlineDate(dateStr, testWeeks);
      
      // Assert
      expect(result).toBe(10); // Aug W3 (20th is in week 3, which is index 10)
    });

    it('should return null for invalid dates', () => {
      // Arrange
      const dateStr = 'invalid-date';
      
      // Act
      const result = parseDeadlineDate(dateStr, testWeeks);
      
      // Assert
      expect(result).toBeNull();
    });

    it('should warn about invalid dates', () => {
      // Arrange
      const dateStr = 'completely-invalid';
      
      // Act
      parseDeadlineDate(dateStr, testWeeks);
      
      // Assert
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to parse deadline date')
      );
    });
  });

  describe('parseMarkdown', () => {
    it('should parse complete roadmap markdown', () => {
      // Arrange - Using generic test data
      const markdown = `# Q2/Q3/Q4 2025 Product Roadmap

## Team Capacity
- **Alex Annual Leave**: Aug W1-Dec W3 | color: #FFA500

## Streams

### Platform Stream
- **Widget Framework v2.0**: Jun W3-Jul W3 | Alpha Squad, Beta Team | color: #4F46E5

### Data Stream
- **Smart Dashboard MVP**: Jul W1-Jul W3 | Gamma Unit, Delta Force | soft-deadline: 2025-07-15 | deadline-label: MVP | color: #F59E0B
- **Advanced Analytics**: Jul W4-Aug W3 | Echo Team | hard-deadline: 2025-09-15 | deadline-label: Analytics | color: #F59E0B`;

      // Act
      const result = parseMarkdown(markdown);
      
      // Assert
      expect(result.streams).toHaveLength(2);
      expect(result.teamCapacity).toHaveLength(1);
      
      const platformStream = result.streams.find(s => s.name === 'Platform Stream');
      expect(platformStream).toBeDefined();
      expect(platformStream.items).toHaveLength(1);
      
      const dataStream = result.streams.find(s => s.name === 'Data Stream');
      expect(dataStream).toBeDefined();
      expect(dataStream.items).toHaveLength(2);
    });

    it('should parse team capacity correctly', () => {
      // Arrange
      const markdown = `## Team Capacity
- **Alex Annual Leave**: Aug W1-Dec W3 | color: #FFA500
- **Jordan Conference**: Sep W1-Sep W2 | color: #FF6B6B`;

      // Act
      const result = parseMarkdown(markdown);
      
      // Assert
      expect(result.teamCapacity).toHaveLength(2);
      expect(result.teamCapacity[0].name).toBe('Alex Annual Leave');
      expect(result.teamCapacity[0].timeline).toBe('Aug W1-Dec W3');
      expect(result.teamCapacity[0].color).toBe('#FFA500');
    });

    it('should parse deadlines with labels correctly', () => {
      // Arrange
      const markdown = `## Streams
### Test Stream
- **Test Item**: Jul W1-Jul W3 | Team | soft-deadline: 2025-07-15 | deadline-label: MVP | color: #F59E0B`;

      // Act
      const result = parseMarkdown(markdown);
      
      // Assert
      expect(result.streams).toHaveLength(1);
      const item = result.streams[0].items[0];
      expect(item.softDeadline).toBe('2025-07-15');
      expect(item.deadlineLabel).toBe('MVP');
    });

    it('should filter out empty streams', () => {
      // Arrange
      const markdown = `## Streams
### Empty Stream

### Valid Stream
- **Test Item**: Jul W1-Jul W3 | Team | color: #F59E0B`;

      // Act
      const result = parseMarkdown(markdown);
      
      // Assert
      expect(result.streams).toHaveLength(1);
      expect(result.streams[0].name).toBe('Valid Stream');
    });

    it('should separate risks from regular items', () => {
      // Arrange
      const markdown = `## Streams
### Test Stream
- **Risk: Database complexity**: Aug W2-Aug W4 | risk-level: high | color: #FF4444
- **Regular Item**: Jul W1-Jul W3 | Team | color: #4F46E5`;

      // Act
      const result = parseMarkdown(markdown);
      
      // Assert
      expect(result.streams).toHaveLength(1);
      const stream = result.streams[0];
      expect(stream.items).toHaveLength(1);
      expect(stream.risks).toHaveLength(1);
      expect(stream.risks[0].riskLevel).toBe('high');
    });
  });

  describe('Integration: Full Pipeline', () => {
    it('should handle the data from our roadmap file', () => {
      // Arrange - Using anonymized test data
      const realMarkdown = `# Q2/Q3/Q4 2025 Product Roadmap

## Team Capacity
- **Alex Annual Leave**: Aug W1-Dec W3 | color: #FFA500

## Streams

### Platform Development
- **Widget Framework Migration**: Jun W3-Jul W3 | Alpha Squad, Beta Team | color: #4F46E5

### Data Analytics (Gamma Unit + Delta Force)
- **Smart Dashboard MVP**: Jul W1-Jul W3 | Gamma Unit, Delta Force | soft-deadline: 2025-07-15 | deadline-label: MVP | color: #F59E0B`;

      // Act
      const { streams, teamCapacity } = parseMarkdown(realMarkdown);
      
      // Assert - These should all pass for rendering to work
      expect(streams.length).toBeGreaterThan(0);
      expect(teamCapacity.length).toBeGreaterThan(0);
      
      // Test specific migration item
      const platformStream = streams.find(s => s.name.includes('Platform'));
      expect(platformStream).toBeDefined();
      
      const migrationItem = platformStream.items.find(i => i.name.includes('Migration'));
      expect(migrationItem).toBeDefined();
      expect(migrationItem.timeline).toBe('Jun W3-Jul W3');
      
      // Test that timeline can be parsed with our weeks
      const timelineRange = parseTimelineRange(migrationItem.timeline, testWeeks);
      expect(timelineRange.start).toBeGreaterThanOrEqual(0);
      expect(timelineRange.end).toBeGreaterThan(timelineRange.start);
      
      // Test MVP item with deadline
      const dataStream = streams.find(s => s.name.includes('Data'));
      expect(dataStream).toBeDefined();
      
      const mvpItem = dataStream.items.find(i => i.name.includes('MVP'));
      expect(mvpItem).toBeDefined();
      expect(mvpItem.softDeadline).toBe('2025-07-15');
      expect(mvpItem.deadlineLabel).toBe('MVP');
      
      // Test that deadline can be parsed
      const deadlineWeek = parseDeadlineDate(mvpItem.softDeadline, testWeeks);
      expect(deadlineWeek).not.toBeNull();
      expect(deadlineWeek).toBeGreaterThanOrEqual(0);
    });
  });
});
