// src/components/__tests__/milestone-risk-visual.test.jsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MilestoneIcon, RiskIcon } from '../StreamComponents.jsx';

describe('Visual Component Tests', () => {
  describe('MilestoneIcon Visual Test', () => {
    it('should render hard milestone without errors', () => {
      const hardMilestone = {
        name: 'Widget v2.0 Release',
        hardDate: '2025-08-15',
        color: '#FF0000'
      };

      render(<MilestoneIcon milestone={hardMilestone} />);
      
      // Component should render without throwing
      expect(screen.getByTestId('milestone-icon')).toBeInTheDocument();
    });

    it('should render soft milestone without errors', () => {
      const softMilestone = {
        name: 'Beta Launch',
        softDate: '2025-09-01',
        color: '#0000FF'
      };

      render(<MilestoneIcon milestone={softMilestone} />);
      
      // Component should render without throwing
      expect(screen.getByTestId('milestone-icon')).toBeInTheDocument();
    });
  });

  describe('RiskIcon Visual Test', () => {
    it('should render high risk without errors', () => {
      const highRisk = {
        name: 'API compatibility issues',
        riskLevel: 'high',
        timeline: 'Aug W2-Aug W4',
        color: '#FF4444'
      };

      render(<RiskIcon risk={highRisk} />);
      
      // Component should render without throwing
      expect(screen.getByTestId('risk-icon')).toBeInTheDocument();
    });

    it('should render medium risk without errors', () => {
      const mediumRisk = {
        name: 'Data migration complexity',
        riskLevel: 'medium',
        timeline: 'Aug W1-Aug W2',
        color: '#FFA500'
      };

      render(<RiskIcon risk={mediumRisk} />);
      
      // Component should render without throwing
      expect(screen.getByTestId('risk-icon')).toBeInTheDocument();
    });

    it('should render low risk without errors', () => {
      const lowRisk = {
        name: 'Minor integration concern',
        riskLevel: 'low',
        timeline: 'Sep W1-Sep W2',
        color: '#FFD700'
      };

      render(<RiskIcon risk={lowRisk} />);
      
      // Component should render without throwing
      expect(screen.getByTestId('risk-icon')).toBeInTheDocument();
    });
  });
});
