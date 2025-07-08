// src/domain/__tests__/timelineParser.test.js
import { vi } from 'vitest';
import { 
  generateWeeks, 
  getCurrentWeek, 
  parseTimelineRange, 
  parseDeadlineDate, 
  parseMarkdown 
} from '../timelineParser.js';

describe('Timeline Parser', () => {
  describe('generateWeeks', () => {
    it('should generate correct week labels for quarters', () => {
      // Arrange
      const quarters = [
        { name: 'Q1 2025', months: ['Jan', 'Feb'] }
      ];
      
      // Act
      const weeks = generateWeeks(quarters);
      
      // Assert
      expect(weeks).toEqual([
        'Jan W1', 'Jan W2', 'Jan W3', 'Jan W4',
        'Feb W1', 'Feb W2', 'Feb W3', 'Feb W4'
      ]);
    });

    it('should handle empty quarters', () => {
      // Arrange
      const quarters = [];
      
      // Act
      const weeks = generateWeeks(quarters);
      
      // Assert
      expect(weeks).toEqual([]);
    });
  });

  describe('getCurrentWeek', () => {
    it('should return fallback when current week not in timeline', () => {
      // Arrange
      const weeks = ['Jul W1', 'Jul W2', 'Aug W1'];
      const fallback = 'Aug W1';
      
      // Mock Date to return a date that won't be in the timeline
      const mockDate = new Date('2025-12-15'); // December, not in our timeline
      vi.spyOn(global, 'Date').mockImplementation(() => mockDate);
      Object.setPrototypeOf(mockDate, Date.prototype);
      
      // Act
      const currentWeek = getCurrentWeek(weeks, fallback);
      
      // Assert
      expect(currentWeek).toBe(fallback);
      
      // Cleanup
      vi.restoreAllMocks();
    });
  });

  describe('parseTimelineRange', () => {
    it('should parse valid timeline range', () => {
      // Arrange
      const timeline = 'Jul W1-Aug W2';
      const weeks = ['Jul W1', 'Jul W2', 'Aug W1', 'Aug W2'];
      
      // Act
      const range = parseTimelineRange(timeline, weeks);
      
      // Assert
      expect(range).toEqual({ start: 0, end: 3 });
    });

    it('should handle invalid timeline format', () => {
      // Arrange
      const timeline = 'Jul W1';
      const weeks = ['Jul W1', 'Jul W2'];
      
      // Act
      const range = parseTimelineRange(timeline, weeks);
      
      // Assert
      expect(range).toEqual({ start: 0, end: 0 });
    });

    it('should handle missing weeks', () => {
      // Arrange
      const timeline = 'Jul W1-Dec W1';
      const weeks = ['Jul W1', 'Jul W2'];
      
      // Act
      const range = parseTimelineRange(timeline, weeks);
      
      // Assert
      expect(range).toEqual({ start: 0, end: 0 });
    });
  });

  describe('parseDeadlineDate', () => {
    it('should parse ISO date format', () => {
      // Arrange
      const dateStr = '2025-08-15';
      const weeks = ['Aug W1', 'Aug W2', 'Aug W3', 'Aug W4'];
      
      // Act
      const weekIndex = parseDeadlineDate(dateStr, weeks);
      
      // Assert
      expect(weekIndex).toBe(2); // 15th is in week 3
    });

    it('should handle invalid date', () => {
      // Arrange
      const dateStr = 'invalid-date';
      const weeks = ['Aug W1', 'Aug W2'];
      
      // Act
      const weekIndex = parseDeadlineDate(dateStr, weeks);
      
      // Assert
      expect(weekIndex).toBeNull();
    });

    it('should return null for empty date', () => {
      // Arrange
      const dateStr = '';
      const weeks = ['Aug W1', 'Aug W2'];
      
      // Act
      const weekIndex = parseDeadlineDate(dateStr, weeks);
      
      // Assert
      expect(weekIndex).toBeNull();
    });
  });

  describe('parseMarkdown', () => {
    it('should parse streams and team capacity', () => {
      // Arrange
      const markdown = `# Test Roadmap

## Team Capacity
- **Developer Leave**: Aug W1-Aug W2 | color: #FF0000

## Streams

### Test Stream
- **Test Item**: Jul W1-Jul W2 | Test Team | color: #0000FF
- **Risk: Test Risk**: Aug W1-Aug W2 | risk-level: high | color: #FF0000`;
      
      // Act
      const result = parseMarkdown(markdown);
      
      // Assert
      expect(result.teamCapacity).toHaveLength(1);
      expect(result.teamCapacity[0].name).toBe('Developer Leave');
      expect(result.streams).toHaveLength(1);
      expect(result.streams[0].name).toBe('Test Stream');
      expect(result.streams[0].items).toHaveLength(1);
      expect(result.streams[0].risks).toHaveLength(1);
    });

    it('should handle empty markdown', () => {
      // Arrange
      const markdown = '';
      
      // Act
      const result = parseMarkdown(markdown);
      
      // Assert
      expect(result.streams).toEqual([]);
      expect(result.teamCapacity).toEqual([]);
    });

    it('should separate risks from regular items', () => {
      // Arrange
      const markdown = `## Streams

### Test Stream
- **Regular Item**: Jul W1-Jul W2 | Team | color: #0000FF
- **Risk: Test Risk**: Aug W1-Aug W2 | risk-level: high | color: #FF0000`;
      
      // Act
      const result = parseMarkdown(markdown);
      
      // Assert
      expect(result.streams[0].items).toHaveLength(1);
      expect(result.streams[0].risks).toHaveLength(1);
      expect(result.streams[0].items[0].name).toBe('Regular Item');
      expect(result.streams[0].risks[0].name).toBe('Risk: Test Risk');
    });
  });
});
