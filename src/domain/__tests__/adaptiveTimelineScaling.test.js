import { describe, it, expect } from 'vitest';
import {
  determineTimelineGranularity,
  generateDailyTimeline,
  generateWeeklyTimeline,
  parseSprintMarkdown,
  extractDateRanges,
  getOverallDateRange,
  calculateTimelineSpan
} from '../adaptiveTimelineScaling.js';

describe('Adaptive Timeline Scaling', () => {
  describe('determineTimelineGranularity', () => {
    it('should detect daily granularity for 2-week sprint', () => {
      // Arrange - 2-week sprint markdown
      const sprintMarkdown = `# Sprint 23 - July 15-29, 2025

## Team Capacity
- **Alex Annual Leave**: 2025-07-22 to 2025-07-24 | color: #FFA500

## Streams

### Frontend Team
- **Mobile App v3.0**: 2025-07-15 to 2025-07-25 | Alex, Jordan | color: #4F46E5
- **Push notification system**: 2025-07-20 to 2025-07-29 | Taylor | color: #10B981

### Backend Team
- **API optimization**: 2025-07-16 to 2025-07-22 | Morgan, Casey | color: #F59E0B`;

      // Act
      const result = determineTimelineGranularity(sprintMarkdown);

      // Assert
      expect(result.granularity).toBe('daily');
      expect(result.span).toBeLessThanOrEqual(21); // 3 weeks or less
      expect(result.config).toBeDefined();
      expect(result.config.type).toBe('daily');
      expect(result.config.days).toBeDefined();
      expect(result.config.days.length).toBeGreaterThan(10); // At least 10 days
    });

    it('should detect weekly granularity for 6-week period', () => {
      // Arrange - 6-week period markdown
      const mediumMarkdown = `# Q3 Initiative - July-August 2025

## Streams

### Platform Team
- **Architecture refactor**: 2025-07-01 to 2025-08-15 | Team A | color: #4F46E5
- **Database migration**: 2025-07-15 to 2025-08-30 | Team B | color: #10B981`;

      // Act
      const result = determineTimelineGranularity(mediumMarkdown);

      // Assert
      expect(result.granularity).toBe('weekly');
      expect(result.span).toBeGreaterThan(21);
      expect(result.span).toBeLessThanOrEqual(84); // 12 weeks or less
      expect(result.config).toBeDefined();
      expect(result.config.type).toBe('weekly');
      expect(result.config.weeks).toBeDefined();
    });

    it('should detect quarterly granularity for long-term roadmap', () => {
      // Arrange - Long-term roadmap markdown
      const longTermMarkdown = `# Annual Roadmap 2025

## Streams

### Product Team
- **Product v1.0**: 2025-01-01 to 2025-06-30 | Team A | color: #4F46E5
- **Product v2.0**: 2025-07-01 to 2025-12-31 | Team B | color: #10B981`;

      // Act
      const result = determineTimelineGranularity(longTermMarkdown);

      // Assert
      expect(result.granularity).toBe('quarterly');
      expect(result.span).toBeGreaterThan(84); // More than 12 weeks
      expect(result.config).toBeDefined();
      expect(result.config.type).toBe('quarterly');
      expect(result.config.quarters).toBeDefined();
    });

    it('should handle mixed date formats in sprint markdown', () => {
      // Arrange - Mixed date formats
      const mixedMarkdown = `# Sprint with Mixed Formats

## Streams

### Team A
- **Task 1**: Jul W1-Jul W2 | Team | color: #4F46E5
- **Task 2**: 2025-07-20 to 2025-07-25 | Team | color: #10B981
- **Task 3**: July 15-29 | Team | color: #F59E0B`;

      // Act
      const result = determineTimelineGranularity(mixedMarkdown);

      // Assert - Overall span is ~28 days (Jun 30 to Jul 29), so should be weekly
      expect(result.granularity).toBe('weekly');
      expect(result.span).toBeGreaterThan(21);
      expect(result.span).toBeLessThanOrEqual(84);
      expect(result.config).toBeDefined();
      expect(result.config.type).toBe('weekly');
      expect(result.config.weeks).toBeDefined();
    });

    it('should fallback to quarterly for empty markdown', () => {
      // Arrange
      const emptyMarkdown = `# Empty Roadmap

## Streams

### Empty Stream`;

      // Act
      const result = determineTimelineGranularity(emptyMarkdown);

      // Assert
      expect(result.granularity).toBe('quarterly');
      expect(result.config.type).toBe('quarterly');
    });
  });

  describe('generateDailyTimeline', () => {
    it('should generate daily timeline for 2-week period', () => {
      // Arrange
      const startDate = new Date('2025-07-15');
      const endDate = new Date('2025-07-29');

      // Act
      const result = generateDailyTimeline(startDate, endDate);

      // Assert
      expect(result.type).toBe('daily');
      expect(result.days).toBeDefined();
      expect(result.days.length).toBe(11); // 11 weekdays (excluding weekends)
      expect(result.days[0]).toMatchObject({
        date: expect.any(Date),
        label: expect.stringContaining('Tue'),
        dayOfWeek: expect.any(String),
        dayOfMonth: 15
      });
      expect(result.days[10]).toMatchObject({
        dayOfMonth: 29
      });
    });

    it('should handle weekend days in daily timeline', () => {
      // Arrange
      const startDate = new Date('2025-07-14'); // Monday
      const endDate = new Date('2025-07-20'); // Sunday

      // Act
      const result = generateDailyTimeline(startDate, endDate);

      // Assert - weekdays only by default
      expect(result.days.length).toBe(5);
      expect(result.days[0].dayOfWeek).toBe('Mon');
      expect(result.days[4].dayOfWeek).toBe('Fri');
      expect(result.workdaysOnly).toBe(true);
      expect(result.includesWeekends).toBe(false);
    });

    it('should group days by weeks for header rendering', () => {
      // Arrange
      const startDate = new Date('2025-07-14'); // Monday
      const endDate = new Date('2025-07-27'); // Sunday (2 weeks)

      // Act
      const result = generateDailyTimeline(startDate, endDate);

      // Assert - weekdays only gives 10 days over 2 weeks
      expect(result.weeks).toBeDefined();
      expect(result.weeks.length).toBe(2);
      expect(result.weeks[0]).toMatchObject({
        weekLabel: expect.stringContaining('Week'),
        days: expect.arrayContaining([
          expect.objectContaining({ dayOfWeek: 'Mon' })
        ])
      });
      expect(result.days.length).toBe(10); // 10 weekdays over 2 weeks
    });
  });

  describe('generateWeeklyTimeline', () => {
    it('should generate weekly timeline for 6-week period', () => {
      // Arrange
      const startDate = new Date('2025-07-01');
      const endDate = new Date('2025-08-15');

      // Act
      const result = generateWeeklyTimeline(startDate, endDate);

      // Assert
      expect(result.type).toBe('weekly');
      expect(result.weeks).toBeDefined();
      expect(result.weeks.length).toBeGreaterThan(4);
      expect(result.weeks.length).toBeLessThanOrEqual(8);
      expect(result.weeks[0]).toMatchObject({
        label: expect.stringContaining('Jul'),
        startDate: expect.any(Date),
        endDate: expect.any(Date)
      });
    });

    it('should group weeks by months for header rendering', () => {
      // Arrange
      const startDate = new Date('2025-07-01');
      const endDate = new Date('2025-08-31');

      // Act
      const result = generateWeeklyTimeline(startDate, endDate);

      // Assert
      expect(result.months).toBeDefined();
      expect(result.months.length).toBe(2);
      expect(result.months[0]).toMatchObject({
        name: 'Jul',
        weeks: expect.any(Array)
      });
      expect(result.months[1]).toMatchObject({
        name: 'Aug',
        weeks: expect.any(Array)
      });
    });
  });

  describe('parseSprintMarkdown', () => {
    it('should parse sprint markdown with daily granularity', () => {
      // Arrange
      const sprintMarkdown = `# Sprint 23

## Team Capacity
- **Alex Leave**: 2025-07-22 to 2025-07-24 | color: #FFA500

## Streams

### Frontend
- **Mobile App v3.0**: 2025-07-15 to 2025-07-25 | Alex, Jordan | color: #4F46E5
- **Push notifications**: 2025-07-20 to 2025-07-29 | Taylor | color: #10B981`;

      // Act
      const result = parseSprintMarkdown(sprintMarkdown);

      // Assert
      expect(result.timelineConfig.granularity).toBe('daily');
      expect(result.streams).toHaveLength(1);
      expect(result.streams[0].items).toHaveLength(2);
      expect(result.teamCapacity).toHaveLength(1);

      // Check timeline parsing with daily indices
      const mobileApp = result.streams[0].items[0];
      expect(mobileApp.timeline).toBeDefined();
      expect(mobileApp.startDay).toBeDefined();
      expect(mobileApp.endDay).toBeDefined();
      expect(mobileApp.startDay).toBeLessThan(mobileApp.endDay);
    });

    it('should convert weekly format to daily indices', () => {
      // Arrange
      const markdownWithWeeks = `# Sprint

## Streams

### Team
- **Task**: Jul W1-Jul W2 | Team | color: #4F46E5`;

      // Act
      const result = parseSprintMarkdown(markdownWithWeeks);

      // Assert
      expect(result.timelineConfig.granularity).toBe('daily');
      const task = result.streams[0].items[0];
      expect(task.startDay).toBeDefined();
      expect(task.endDay).toBeDefined();
      expect(task.startDay).toBeGreaterThanOrEqual(0);
    });
  });

  describe('extractDateRanges', () => {
    it('should extract date ranges from markdown items', () => {
      // Arrange
      const markdown = `# Test

## Streams

### Team
- **Task 1**: 2025-07-15 to 2025-07-25 | Team | color: #4F46E5
- **Task 2**: 2025-07-20 to 2025-07-29 | Team | color: #10B981`;

      // Act
      const result = extractDateRanges(markdown);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        startDate: expect.any(Date),
        endDate: expect.any(Date)
      });
      expect(result[0].startDate.getDate()).toBe(15);
      expect(result[0].endDate.getDate()).toBe(25);
      expect(result[1].startDate.getDate()).toBe(20);
      expect(result[1].endDate.getDate()).toBe(29);
    });

    it('should handle different date formats', () => {
      // Arrange
      const markdown = `# Test

## Streams

### Team
- **Task 1**: Jul W1-Jul W2 | Team | color: #4F46E5
- **Task 2**: 2025-07-15 to 2025-07-25 | Team | color: #10B981
- **Task 3**: July 20-29 | Team | color: #F59E0B`;

      // Act
      const result = extractDateRanges(markdown);

      // Assert
      expect(result).toHaveLength(3);
      expect(result.every(range => range.startDate && range.endDate)).toBe(true);
    });

    it('should skip invalid date ranges', () => {
      // Arrange
      const markdown = `# Test

## Streams

### Team
- **Task 1**: invalid-date-range | Team | color: #4F46E5
- **Task 2**: 2025-07-15 to 2025-07-25 | Team | color: #10B981`;

      // Act
      const result = extractDateRanges(markdown);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].startDate.getDate()).toBe(15);
    });
  });

  describe('getOverallDateRange', () => {
    it('should calculate overall date range from multiple ranges', () => {
      // Arrange
      const ranges = [
        { startDate: new Date('2025-07-20'), endDate: new Date('2025-07-25') },
        { startDate: new Date('2025-07-15'), endDate: new Date('2025-07-22') },
        { startDate: new Date('2025-07-18'), endDate: new Date('2025-07-30') }
      ];

      // Act
      const result = getOverallDateRange(ranges);

      // Assert
      expect(result.startDate.getDate()).toBe(15); // Earliest start
      expect(result.endDate.getDate()).toBe(30);   // Latest end
    });

    it('should handle single date range', () => {
      // Arrange
      const ranges = [
        { startDate: new Date('2025-07-15'), endDate: new Date('2025-07-25') }
      ];

      // Act
      const result = getOverallDateRange(ranges);

      // Assert
      expect(result.startDate.getDate()).toBe(15);
      expect(result.endDate.getDate()).toBe(25);
    });

    it('should handle empty ranges array', () => {
      // Arrange
      const ranges = [];

      // Act
      const result = getOverallDateRange(ranges);

      // Assert
      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.endDate).toBeInstanceOf(Date);
    });
  });

  describe('calculateTimelineSpan', () => {
    it('should calculate span in days for 2-week period', () => {
      // Arrange
      const startDate = new Date('2025-07-15');
      const endDate = new Date('2025-07-29');

      // Act
      const result = calculateTimelineSpan(startDate, endDate);

      // Assert
      expect(result.days).toBe(14);
      expect(result.weeks).toBe(2);
      expect(result.months).toBe(1);
    });

    it('should calculate span for multi-month period', () => {
      // Arrange
      const startDate = new Date('2025-07-01');
      const endDate = new Date('2025-09-30');

      // Act
      const result = calculateTimelineSpan(startDate, endDate);

      // Assert
      expect(result.days).toBe(91);
      expect(result.weeks).toBe(13);
      expect(result.months).toBe(3);
    });

    it('should handle same-day period', () => {
      // Arrange
      const startDate = new Date('2025-07-15');
      const endDate = new Date('2025-07-15');

      // Act
      const result = calculateTimelineSpan(startDate, endDate);

      // Assert
      expect(result.days).toBe(0);
      expect(result.weeks).toBe(0);
      expect(result.months).toBe(0);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete 2-week sprint workflow', () => {
      // Arrange - Complete sprint markdown
      const sprintMarkdown = `# Sprint 23 - Mobile App Focus

## Team Capacity
- **Alex Conference**: 2025-07-22 to 2025-07-24 | color: #FFA500
- **Jordan Leave**: 2025-07-26 to 2025-07-26 | color: #FF6B6B

## Streams

### Mobile Development
- **Mobile App v3.0**: 2025-07-15 to 2025-07-25 | Alex, Jordan | color: #4F46E5
- **Push notification system**: 2025-07-20 to 2025-07-29 | Taylor | color: #10B981

### Backend Support
- **API optimization**: 2025-07-16 to 2025-07-22 | Morgan | color: #F59E0B
- **Database cleanup**: 2025-07-23 to 2025-07-29 | Casey | color: #EF4444

## Milestones
- **Milestone: Sprint Demo**: hard-date: 2025-07-29 | color: #FF0000`;

      // Act
      const granularity = determineTimelineGranularity(sprintMarkdown);
      const parsed = parseSprintMarkdown(sprintMarkdown);

      // Assert
      expect(granularity.granularity).toBe('daily');
      expect(parsed.timelineConfig.granularity).toBe('daily');
      expect(parsed.streams).toHaveLength(2);
      expect(parsed.teamCapacity).toHaveLength(2);
      expect(parsed.milestones).toHaveLength(1);

      // All items should have daily indices
      parsed.streams.forEach(stream => {
        stream.items.forEach(item => {
          expect(item.startDay).toBeDefined();
          expect(item.endDay).toBeDefined();
          expect(item.startDay).toBeGreaterThanOrEqual(0);
          expect(item.endDay).toBeGreaterThan(item.startDay);
        });
      });
    });
  });
});
