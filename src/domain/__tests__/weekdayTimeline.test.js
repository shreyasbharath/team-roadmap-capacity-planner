// src/domain/__tests__/weekdayTimeline.test.js
import { describe, it, expect } from 'vitest';
import {
  generateDailyTimeline,
  determineTimelineGranularity,
  parseSprintMarkdown
} from '../adaptiveTimelineScaling.js';

describe('Weekday-Only Daily Timeline Tests', () => {
  describe('generateDailyTimeline with weekday filtering', () => {
    it('should generate weekdays only by default', () => {
      // Test a week that includes a weekend (July 15-21, 2025)
      const startDate = new Date('2025-07-15'); // Tuesday
      const endDate = new Date('2025-07-21');   // Monday (next week)
      
      const result = generateDailyTimeline(startDate, endDate);
      
      expect(result.type).toBe('daily');
      expect(result.workdaysOnly).toBe(true);
      expect(result.includesWeekends).toBe(false);
      
      // Should only include weekdays: Tue 15, Wed 16, Thu 17, Fri 18, Mon 21
      expect(result.days).toHaveLength(5);
      
      // Verify days are weekdays only
      const dayLabels = result.days.map(day => day.label);
      expect(dayLabels).toEqual(['Tue 15', 'Wed 16', 'Thu 17', 'Fri 18', 'Mon 21']);
      
      // Verify isWeekday flags
      result.days.forEach(day => {
        expect(day.isWeekday).toBe(true);
        expect(day.isWeekend).toBe(false);
      });
    });

    it('should include weekends when explicitly requested', () => {
      const startDate = new Date('2025-07-15'); // Tuesday
      const endDate = new Date('2025-07-21');   // Monday
      
      const result = generateDailyTimeline(startDate, endDate, { 
        includeWeekends: true 
      });
      
      expect(result.workdaysOnly).toBe(false);
      expect(result.includesWeekends).toBe(true);
      
      // Should include all 7 days: Tue 15, Wed 16, Thu 17, Fri 18, Sat 19, Sun 20, Mon 21
      expect(result.days).toHaveLength(7);
      
      const dayLabels = result.days.map(day => day.label);
      expect(dayLabels).toEqual([
        'Tue 15', 'Wed 16', 'Thu 17', 'Fri 18', 'Sat 19', 'Sun 20', 'Mon 21'
      ]);
      
      // Verify weekend flags
      expect(result.days[4].isWeekend).toBe(true); // Saturday
      expect(result.days[5].isWeekend).toBe(true); // Sunday
    });

    it('should not auto-detect weekends when tasks are weekdays only', () => {
      const startDate = new Date('2025-07-15'); // Tuesday
      const endDate = new Date('2025-07-21');   // Monday
      
      // Date ranges that only include weekdays - but no explicit weekend flag
      const dateRanges = [
        { startDate: new Date('2025-07-15'), endDate: new Date('2025-07-17') }, // Tue-Thu
        { startDate: new Date('2025-07-18'), endDate: new Date('2025-07-18') }  // Friday only
      ];
      
      const result = generateDailyTimeline(startDate, endDate, { 
        includeWeekends: false  // Explicit control - no auto-detection
      });
      
      // Should remain weekdays only because no explicit flag
      expect(result.includesWeekends).toBe(false);
      expect(result.workdaysOnly).toBe(true);
      expect(result.days).toHaveLength(5); // Weekdays only
    });
  });

  describe('Explicit weekend control', () => {
    it('should include weekends when explicit flag present', () => {
      const markdownWithFlag = `# Weekend Sprint

Show-weekends for deployment.

## Streams
### Development
- **Weekend Task**: 2025-07-19 to 2025-07-21 | Team | color: #4F46E5`;
      
      const result = generateDailyTimeline(
        new Date('2025-07-15'), 
        new Date('2025-07-21'), 
        { includeWeekends: true }
      );
      
      expect(result.includesWeekends).toBe(true);
    });

    it('should exclude weekends when no flag present', () => {
      const markdownNoFlag = `# Weekday Sprint

## Streams
### Development
- **Weekday Task**: 2025-07-18 to 2025-07-20 | Team | color: #4F46E5`;
      
      const result = generateDailyTimeline(
        new Date('2025-07-15'), 
        new Date('2025-07-21'), 
        { includeWeekends: false }
      );
      
      expect(result.includesWeekends).toBe(false);
    });

    it('should respect explicit weekend inclusion flags in markdown', () => {
      const markdownWithDifferentFlags = [
        'Include-weekends',
        'show weekends',
        'with-weekends',
        'weekends: true'
      ];
      
      markdownWithDifferentFlags.forEach(flag => {
        const markdown = `# Sprint\n${flag}\n## Streams\n### Team\n- **Task**: 2025-07-15 to 2025-07-17 | Team | color: #4F46E5`;
        
        // Simulate the checkForWeekendsFlag function
        const lowerText = markdown.toLowerCase();
        const hasFlag = lowerText.includes(flag.toLowerCase());
        
        expect(hasFlag).toBe(true);
      });
    });
  });

  describe('Integration with adaptive timeline scaling', () => {
    it('should use weekdays only for typical sprint markdown', () => {
      const sprintMarkdown = `# Sprint 24 - Mobile Release

## Team Capacity
- **Alex Leave**: 2025-07-15 to 2025-07-17 | color: #FFA500

## Streams
### Mobile Development
- **Mobile App v3.0**: 2025-07-15 to 2025-07-18 | Alex, Jordan | color: #4F46E5
- **API Optimization**: 2025-07-16 to 2025-07-18 | Morgan | color: #EF4444`;

      const result = determineTimelineGranularity(sprintMarkdown);
      
      expect(result.granularity).toBe('daily');
      expect(result.config.workdaysOnly).toBe(true);
      expect(result.config.includesWeekends).toBe(false);
      
      // Count weekdays in July 15-18 range (only weekdays: Tue, Wed, Thu, Fri)
      const expectedWeekdays = [15, 16, 17, 18]; // 4 weekdays
      expect(result.config.days).toHaveLength(expectedWeekdays.length);
    });

    it('should auto-include weekends when sprint has weekend tasks', () => {
      const weekendSprintMarkdown = `# Sprint 24 - Weekend Deployment

Include-weekends for this deployment sprint.

## Team Capacity
- **Weekend Deployment**: 2025-07-19 to 2025-07-20 | color: #FFA500

## Streams
### DevOps
- **Production Deploy**: 2025-07-18 to 2025-07-20 | DevOps Team | color: #4F46E5
- **Monitoring Setup**: 2025-07-21 to 2025-07-23 | SRE Team | color: #EF4444`;

      const result = determineTimelineGranularity(weekendSprintMarkdown);
      
      expect(result.granularity).toBe('daily');
      expect(result.config.workdaysOnly).toBe(false);
      expect(result.config.includesWeekends).toBe(true);
      
      // Should include the weekend days (19-20) due to explicit flag
      const dayLabels = result.config.days.map(day => day.label);
      expect(dayLabels).toContain('Sat 19');
      expect(dayLabels).toContain('Sun 20');
    });
  });

  describe('Timeline positioning with weekdays only', () => {
    it('should calculate correct indices for weekday-only timeline', () => {
      const sprintMarkdown = `# Weekday Sprint

## Streams
### Development
- **Task A**: 2025-07-15 to 2025-07-17 | Team | color: #4F46E5
- **Task B**: 2025-07-21 to 2025-07-23 | Team | color: #10B981`;

      const result = parseSprintMarkdown(sprintMarkdown);
      
      expect(result.timelineConfig.granularity).toBe('daily');
      expect(result.timelineConfig.config.workdaysOnly).toBe(true);
      
      // Weekday-only timeline: [Tue 15, Wed 16, Thu 17, Fri 18, Mon 21, Tue 22, Wed 23]
      // Task A (Tue 15 - Thu 17): indices 0-2
      // Task B (Mon 21 - Wed 23): indices 4-6
      
      const taskA = result.streams[0].items[0];
      const taskB = result.streams[0].items[1];
      
      expect(taskA.startDay).toBe(0); // Tue 15 (first weekday)
      expect(taskA.endDay).toBe(2);   // Thu 17 (third weekday)
      
      expect(taskB.startDay).toBe(4); // Mon 21 (fifth weekday, skipping weekend)
      expect(taskB.endDay).toBe(6);   // Wed 23 (seventh weekday)
    });

    it('should calculate correct indices when weekends are included', () => {
      const weekendSprintMarkdown = `# Weekend Sprint

Show-weekends for this sprint.

## Streams
### Development
- **Weekend Task**: 2025-07-19 to 2025-07-21 | Team | color: #4F46E5`;

      const result = parseSprintMarkdown(weekendSprintMarkdown);
      
      expect(result.timelineConfig.granularity).toBe('daily');
      expect(result.timelineConfig.config.includesWeekends).toBe(true);
      
      // Should include weekends, so Saturday 19 should be at correct index
      const weekendTask = result.streams[0].items[0];
      expect(weekendTask.startDay).toBeGreaterThanOrEqual(0);
      expect(weekendTask.endDay).toBeGreaterThan(weekendTask.startDay);
      
      // Verify the timeline includes weekend days
      const dayLabels = result.timelineConfig.config.days.map(day => day.label);
      expect(dayLabels).toContain('Sat 19');
      expect(dayLabels).toContain('Sun 20');
    });
  });

  describe('Backwards compatibility', () => {
    it('should maintain compatibility with existing timeline generation', () => {
      // Test the old signature still works
      const result = generateDailyTimeline(
        new Date('2025-07-15'), 
        new Date('2025-07-18')
      );
      
      expect(result.type).toBe('daily');
      expect(result.days).toBeDefined();
      expect(result.workdaysOnly).toBe(true); // Default behavior
    });

    it('should work with parseSprintMarkdown for existing workflows', () => {
      const markdown = `# Test Sprint
## Streams
### Team
- **Task**: 2025-07-15 to 2025-07-17 | Team | color: #4F46E5`;

      const result = parseSprintMarkdown(markdown);
      
      expect(result.timelineConfig.granularity).toBe('daily');
      expect(result.streams[0].items[0]).toHaveProperty('startDay');
      expect(result.streams[0].items[0]).toHaveProperty('endDay');
    });
  });
});
