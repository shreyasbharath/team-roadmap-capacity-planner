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
      
      // We defined 7 risks in the quarterly roadmap
      expect(allRisks.length).toBeGreaterThan(5);
      
      // Check specific risk properties
      const neoRisk = allRisks.find(risk => 
        risk.name.includes('Neo4j upgrade compatibility')
      );
      expect(neoRisk).toBeDefined();
      expect(neoRisk.riskLevel).toBe('high');
      
      const dudeRisk = allRisks.find(risk => 
        risk.name.includes('Third-party API rate limiting')
      );
      expect(dudeRisk).toBeDefined();
      expect(dudeRisk.riskLevel).toBe('medium');
    });

    it('should correctly categorise risk levels', () => {
      const result = parseMarkdown(quarterlyData);
      const allRisks = result.streams.flatMap(stream => stream.risks || []);
      
      const highRisks = allRisks.filter(r => r.riskLevel === 'high');
      const mediumRisks = allRisks.filter(r => r.riskLevel === 'medium');
      const lowRisks = allRisks.filter(r => r.riskLevel === 'low');
      
      // Should have risks in all categories
      expect(highRisks.length).toBeGreaterThan(0);
      expect(mediumRisks.length).toBeGreaterThan(0);
      expect(lowRisks.length).toBeGreaterThan(0);
      
      console.log('Risk distribution:', {
        high: highRisks.length,
        medium: mediumRisks.length,
        low: lowRisks.length
      });
    });
  });

  describe('Daily Roadmap Risk Parsing', () => {
    it('should parse all risks from daily roadmap', () => {
      const result = parseMarkdown(dailyData);
      
      const allRisks = result.streams.flatMap(stream => stream.risks || []);
      
      // We defined 7 risks in the daily roadmap  
      expect(allRisks.length).toBeGreaterThan(5);
      
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
      
      // Check specific team members
      const andrewLeave = quarterlyResult.teamCapacity.find(tc => 
        tc.name.includes('Andrew Leave')
      );
      expect(andrewLeave).toBeDefined();
      expect(andrewLeave.timeline).toBeDefined();
    });
  });
});
