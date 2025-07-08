// src/components/__tests__/StreamComponents.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { 
  TooltipWrapper, 
  StreamHeader, 
  MilestoneAnnotation,
  processStreamDeadlines 
} from '../StreamComponents.jsx';

describe('StreamComponents', () => {
  describe('TooltipWrapper', () => {
    it('should render children and tooltip text', () => {
      // Arrange & Act
      render(
        <TooltipWrapper text="Test tooltip">
          <div>Test content</div>
        </TooltipWrapper>
      );
      
      // Assert
      expect(screen.getByText('Test content')).toBeInTheDocument();
      expect(screen.getByText('Test tooltip')).toBeInTheDocument();
    });

    it('should not render tooltip when text is empty', () => {
      // Arrange & Act
      render(
        <TooltipWrapper text="">
          <div>Test content</div>
        </TooltipWrapper>
      );
      
      // Assert
      expect(screen.getByText('Test content')).toBeInTheDocument();
      expect(screen.queryByText('Test tooltip')).not.toBeInTheDocument();
    });
  });

  describe('StreamHeader', () => {
    it('should display stream name and counts', () => {
      // Arrange & Act
      render(
        <StreamHeader 
          streamName="Test Stream" 
          itemCount={5} 
          riskCount={2} 
        />
      );
      
      // Assert
      expect(screen.getByText('Test Stream')).toBeInTheDocument();
      // Tooltip should contain the counts
      expect(screen.getByText('Test Stream - 5 items, 2 risks')).toBeInTheDocument();
    });
  });

  describe('MilestoneAnnotation', () => {
    it('should render hard deadline with correct styling', () => {
      // Arrange
      const deadlines = [{
        formattedDate: '15 Aug',
        item: 'Test Deadline'
      }];
      
      // Act
      render(<MilestoneAnnotation deadlines={deadlines} type="hard" />);
      
      // Assert
      expect(screen.getByText('15 Aug')).toBeInTheDocument();
      expect(screen.getByText('Test Deadline')).toBeInTheDocument();
      // Should have red styling for hard deadlines - the parent of the date text
      const container = screen.getByText('15 Aug').parentElement;
      expect(container).toHaveClass('bg-red-500');
    });

    it('should render soft deadline with correct styling', () => {
      // Arrange
      const deadlines = [{
        formattedDate: '20 Aug',
        item: 'Soft Deadline'
      }];
      
      // Act
      render(<MilestoneAnnotation deadlines={deadlines} type="soft" />);
      
      // Assert
      expect(screen.getByText('20 Aug')).toBeInTheDocument();
      expect(screen.getByText('Soft Deadline')).toBeInTheDocument();
      // Should have blue styling for soft deadlines - the parent of the date text
      const container = screen.getByText('20 Aug').parentElement;
      expect(container).toHaveClass('bg-blue-500');
    });
  });

  describe('processStreamDeadlines', () => {
    it('should process hard and soft deadlines correctly', () => {
      // Arrange
      const items = [
        {
          name: 'Item 1',
          hardDeadline: '2025-08-15',
          deadlineLabel: 'Release'
        },
        {
          name: 'Item 2', 
          softDeadline: '2025-08-20'
        }
      ];
      const weeks = ['Aug W1', 'Aug W2', 'Aug W3', 'Aug W4'];
      
      // Act
      const result = processStreamDeadlines(items, weeks);
      
      // Assert
      expect(result.hardDeadlines).toHaveLength(1);
      expect(result.softDeadlines).toHaveLength(1);
      expect(result.hardDeadlines[0].item).toBe('Release');
      expect(result.softDeadlines[0].item).toBe('Item 2');
    });

    it('should handle items without deadlines', () => {
      // Arrange
      const items = [
        {
          name: 'Item 1',
          timeline: 'Aug W1-Aug W2'
        }
      ];
      const weeks = ['Aug W1', 'Aug W2'];
      
      // Act
      const result = processStreamDeadlines(items, weeks);
      
      // Assert
      expect(result.hardDeadlines).toHaveLength(0);
      expect(result.softDeadlines).toHaveLength(0);
    });

    it('should handle invalid deadline dates', () => {
      // Arrange
      const items = [
        {
          name: 'Item 1',
          hardDeadline: 'invalid-date'
        }
      ];
      const weeks = ['Aug W1', 'Aug W2'];
      
      // Act
      const result = processStreamDeadlines(items, weeks);
      
      // Assert
      expect(result.hardDeadlines).toHaveLength(0);
    });
  });
});
