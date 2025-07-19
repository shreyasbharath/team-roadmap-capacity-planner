// src/components/__tests__/milestone-risk-icons.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MilestoneIcon, RiskIcon } from '../StreamComponents.jsx';

describe('Milestone and Risk Icon Components', () => {
  describe('MilestoneIcon', () => {
    const hardMilestone = {
      name: 'Widget v2.0 Release',
      hardDate: '2025-08-15',
      color: '#FF0000'
    };

    const softMilestone = {
      name: 'Beta Launch',
      softDate: '2025-09-01',
      color: '#0000FF'
    };

    it('should render hard milestone with flag icon', () => {
      render(<MilestoneIcon milestone={hardMilestone} />);
      
      const icon = screen.getByTestId('milestone-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-red-500'); // Hard milestones are red
      
      // Should show flag icon for hard milestones
      expect(icon.textContent).toBe('🚩');
    });

    it('should render soft milestone with flag icon', () => {
      render(<MilestoneIcon milestone={softMilestone} />);
      
      const icon = screen.getByTestId('milestone-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-blue-500'); // Soft milestones are blue
      
      // Should show flag icon for soft milestones
      expect(icon.textContent).toBe('🏁');
    });

    it('should show tooltip on hover with milestone details', async () => {
      render(<MilestoneIcon milestone={hardMilestone} />);
      
      const icon = screen.getByTestId('milestone-icon');
      
      // Initially no tooltip visible
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      
      // Hover should show tooltip
      fireEvent.mouseEnter(icon);
      
      const tooltip = await screen.findByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent('Hard Milestone: 15 Aug');
      expect(tooltip).toHaveTextContent('Widget v2.0 Release');
    });

    it('should hide tooltip on mouse leave', async () => {
      render(<MilestoneIcon milestone={hardMilestone} />);
      
      const icon = screen.getByTestId('milestone-icon');
      fireEvent.mouseEnter(icon);
      
      const tooltip = await screen.findByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
      
      // Mouse leave should hide tooltip
      fireEvent.mouseLeave(icon);
      
      // Tooltip should be hidden (may take a moment)
      expect(tooltip).not.toBeInTheDocument();
    });
  });

  describe('RiskIcon', () => {
    const highRisk = {
      name: 'API compatibility issues',
      riskLevel: 'high',
      timeline: 'Aug W2-Aug W4',
      color: '#FF4444'
    };

    const mediumRisk = {
      name: 'Data migration complexity',
      riskLevel: 'medium',
      timeline: 'Aug W1-Aug W2',
      color: '#FFA500'
    };

    const lowRisk = {
      name: 'Minor integration concern',
      riskLevel: 'low',
      timeline: 'Sep W1-Sep W2',
      color: '#FFD700'
    };

    it('should render high risk with warning triangle', () => {
      render(<RiskIcon risk={highRisk} />);
      
      const icon = screen.getByTestId('risk-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-red-500');
      
      // High risk should show warning triangle
      expect(icon.textContent).toBe('⚠️');
    });

    it('should render medium risk with caution triangle', () => {
      render(<RiskIcon risk={mediumRisk} />);
      
      const icon = screen.getByTestId('risk-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-yellow-500');
      
      // Medium risk should show caution triangle
      expect(icon.textContent).toBe('⚠️');
    });

    it('should render low risk with info circle', () => {
      render(<RiskIcon risk={lowRisk} />);
      
      const icon = screen.getByTestId('risk-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-orange-500');
      
      // Low risk should show info circle
      expect(icon.textContent).toBe('ℹ️');
    });

    it('should show tooltip on hover with risk details', async () => {
      render(<RiskIcon risk={highRisk} />);
      
      const icon = screen.getByTestId('risk-icon');
      
      // Hover should show tooltip
      fireEvent.mouseEnter(icon);
      
      const tooltip = await screen.findByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent('HIGH Risk');
      expect(tooltip).toHaveTextContent('API compatibility issues');
      expect(tooltip).toHaveTextContent('Aug W2-Aug W4');
    });

    it('should position icon with proper spacing', () => {
      render(<RiskIcon risk={highRisk} />);
      
      const icon = screen.getByTestId('risk-icon');
      
      // Should be properly sized and positioned
      expect(icon).toHaveClass('w-6 h-6');
      expect(icon).toHaveClass('cursor-pointer');
      expect(icon).toHaveClass('flex items-center justify-center');
    });
  });

  describe('Icon Integration', () => {
    it('should render multiple icons without overlap', () => {
      const { container } = render(
        <div className="flex gap-1" data-testid="icon-container">
          <MilestoneIcon milestone={{ name: 'Test', hardDate: '2025-08-15' }} />
          <RiskIcon risk={{ name: 'Test Risk', riskLevel: 'high', timeline: 'Aug W1' }} />
        </div>
      );
      
      const milestoneIcon = screen.getByTestId('milestone-icon');
      const riskIcon = screen.getByTestId('risk-icon');
      const iconContainer = screen.getByTestId('icon-container');
      
      expect(milestoneIcon).toBeInTheDocument();
      expect(riskIcon).toBeInTheDocument();
      
      // Icons should be contained within a properly spaced container
      expect(iconContainer).toHaveClass('flex');
      expect(iconContainer).toHaveClass('gap-1');
    });
  });
});
