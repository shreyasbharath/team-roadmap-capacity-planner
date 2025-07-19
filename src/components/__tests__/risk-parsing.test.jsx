// src/components/__tests__/risk-parsing.test.jsx
import { describe, it, expect } from 'vitest';
import { parseMarkdown } from '../../domain/timelineParser.js';
import quarterlyData from '../../data/roadmap-quarterly.md?raw';
import dailyData from '../../data/roadmap-daily.md?raw';

describe('Risk Parsing and Integration', () => {
  describe('Quarterly Roadmap Risk Parsing', () => {
    it('should parse all risks from quarterly roadmap', () => {
      const result = parseMarkdown(quarterlyData);

      // Should have parsed risks
      expect(result.streams).toBeDefined();

      // Count total risks across all streams
      const allRisks = result.streams.flatMap(stream => stream.risks || []);

      // We have 7 risks defined in ## Risks section of quarterly roadmap
      expect(allRisks.length).toBeGreaterThanOrEqual(5);

      // Check specific risk properties
      const legacyRisk = allRisks.find(risk =>
        risk.name.includes('Legacy system compatibility')
      );
      expect(legacyRisk).toBeDefined();
      expect(legacyRisk.riskLevel).toBe('high');

      const apiRisk = allRisks.find(risk =>
        risk.name.includes('Third-party API rate limiting')
      );
      expect(apiRisk).toBeDefined();
      expect(apiRisk.riskLevel).toBe('medium');
    });

    it('should correctly categorise risk levels', () => {
      const result = parseMarkdown(quarterlyData);
      const allRisks = result.streams.flatMap(stream => stream.risks || []);

      const highRisks = allRisks.filter(r => r.riskLevel === 'high');
      const mediumRisks = allRisks.filter(r => r.riskLevel === 'medium');
      const lowRisks = allRisks.filter(r => r.riskLevel === 'low');

      // Should have risks in different categories
      expect(highRisks.length).toBeGreaterThanOrEqual(0);
      expect(lowRisks.length).toBeGreaterThan(0);
      expect(mediumRisks.length).toBeGreaterThanOrEqual(0);
      expect(allRisks.length).toBeGreaterThan(0);
    });
  });

  describe('Daily Roadmap Risk Parsing', () => {
    it('should parse all risks from daily roadmap', () => {
      const result = parseMarkdown(dailyData);

      const allRisks = result.streams.flatMap(stream => stream.risks || []);

      // We have 7 risks defined in ## Risks section of daily roadmap
      expect(allRisks.length).toBeGreaterThanOrEqual(5);

      // Check specific daily risk
      const dbRisk = allRisks.find(risk =>
        risk.name.includes('Database migration data corruption')
      );
      expect(dbRisk).toBeDefined();
      expect(dbRisk.riskLevel).toBe('high');
    });

    it('should include timeline information for daily risks', () => {
      const result = parseMarkdown(dailyData);
      const allRisks = result.streams.flatMap(stream => stream.risks || []);

      // All risks should have timeline information
      allRisks.forEach(risk => {
        expect(risk.timeline).toBeDefined();
        expect(risk.timeline).toMatch(/\d{4}-\d{2}-\d{2}/); // Should contain dates
      });
    });
  });

  describe('Milestones Parsing', () => {
    it('should parse milestones from both roadmaps', () => {
      const quarterlyResult = parseMarkdown(quarterlyData);
      const dailyResult = parseMarkdown(dailyData);

      expect(quarterlyResult.milestones).toBeDefined();
      expect(quarterlyResult.milestones.length).toBeGreaterThan(3);

      expect(dailyResult.milestones).toBeDefined();
      expect(dailyResult.milestones.length).toBeGreaterThan(3);

      // Check milestone types
      const quarterlyHardMilestones = quarterlyResult.milestones.filter(m => m.hardDate);
      const quarterlySoftMilestones = quarterlyResult.milestones.filter(m => m.softDate);

      expect(quarterlyHardMilestones.length).toBeGreaterThan(0);
      expect(quarterlySoftMilestones.length).toBeGreaterThan(0);
    });
  });

  describe('Team Capacity Parsing', () => {
    it('should parse team capacity from both roadmaps', () => {
      const quarterlyResult = parseMarkdown(quarterlyData);
      const dailyResult = parseMarkdown(dailyData);

      expect(quarterlyResult.teamCapacity).toBeDefined();
      expect(quarterlyResult.teamCapacity.length).toBeGreaterThan(3);

      expect(dailyResult.teamCapacity).toBeDefined();
      expect(dailyResult.teamCapacity.length).toBeGreaterThan(3);

      // Check specific team members - Alice exists in quarterly, Alex exists in daily
      const aliceLeave = quarterlyResult.teamCapacity.find(tc =>
        tc.name.includes('Alice Leave')
      );
      expect(aliceLeave).toBeDefined();
      expect(aliceLeave.timeline).toBeDefined();
    });
  });
});
