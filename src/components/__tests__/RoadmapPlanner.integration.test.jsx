import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RoadmapPlanner } from '../RoadmapPlanner.jsx';

// Mock roadmap data for testing - using correct markdown format
const mockRoadmapData = `
# Sample Project Roadmap

## Team Capacity
- **Alex Annual Leave**: Aug W2-Aug W3 | color: #FFA500
- **Jordan Conference**: Sep W1-Sep W2 | color: #FF6B6B
- **Taylor Training**: Oct W1-Oct W2 | color: #9B59B6

## Milestones
- **Milestone: Widget v2.0 Release**: hard-date: 2025-08-15 | color: #FF0000
- **Milestone: Beta Launch**: soft-date: 2025-09-01 | color: #0000FF

## Streams

### Product Stream Alpha
- **Risk: API compatibility issues**: Aug W2-Aug W4 | risk-level: high | color: #FF4444
- **Widget Framework v2.0**: Jul W1-Sep W2 | Team Phoenix | color: #4F46E5
- **Authentication System**: Jul W3-Oct W4 | Team Falcon | color: #EF4444

### Product Stream Beta
- **Risk: Data migration complexity**: Aug W1-Aug W2 | risk-level: high | color: #FF4444
- **Data Visualization Tool**: Aug W1-Oct W2 | Team Eagle, Team Hawk | color: #10B981
- **Notification Engine**: Aug W3-Sep W4 | Team Delta | color: #059669
`;

describe('RoadmapPlanner Integration', () => {
  beforeEach(() => {
  });

  it('should render the roadmap with stream headers', async () => {
    // Act
    render(<RoadmapPlanner markdownData={mockRoadmapData} enableDebug={true} />);

    // Wait for loading to complete
    await screen.findByText('Who', {}, { timeout: 3000 });

    // Assert - Main structure should be present
    expect(screen.getByText('Who')).toBeInTheDocument();
    expect(screen.getByText('Q2 2025')).toBeInTheDocument();
    expect(screen.getByText('Q3 2025')).toBeInTheDocument();
    expect(screen.getByText('Q4 2025')).toBeInTheDocument();
  });

  it('should render team capacity section', async () => {
    // Act
    render(<RoadmapPlanner markdownData={mockRoadmapData} enableDebug={true} />);

    // Wait for loading to complete
    await screen.findByText('Who', {}, { timeout: 3000 });

    // Assert - Team capacity should be visible
    expect(screen.getByText('Team Capacity')).toBeInTheDocument();
  });

  it('should render stream sections', async () => {
    // Act
    render(<RoadmapPlanner markdownData={mockRoadmapData} enableDebug={true} />);

    // Wait for loading to complete
    await screen.findByText('Who', {}, { timeout: 3000 });

    // Assert - Stream headers should be present
    expect(screen.getByText('Product Stream Alpha')).toBeInTheDocument();
    expect(screen.getByText('Product Stream Beta')).toBeInTheDocument();
  });

  it('should render specific timeline items', async () => {
    // Act
    render(<RoadmapPlanner markdownData={mockRoadmapData} enableDebug={true} />);

    // Wait for loading to complete
    await screen.findByText('Who', {}, { timeout: 3000 });

    // Assert - Specific items should be visible
    expect(screen.getByText('Widget Framework v2.0')).toBeInTheDocument();
    expect(screen.getByText('Authentication System')).toBeInTheDocument();
    expect(screen.getByText('Data Visualization Tool')).toBeInTheDocument();
  });

  it('should render team assignments', async () => {
    // Act
    render(<RoadmapPlanner markdownData={mockRoadmapData} enableDebug={true} />);

    // Wait for loading to complete
    await screen.findByText('Who', {}, { timeout: 3000 });

    // Assert - Team assignments should be visible
    expect(screen.getByText('Team Phoenix')).toBeInTheDocument();
    expect(screen.getByText('Team Falcon')).toBeInTheDocument();
    expect(screen.getByText('Team Eagle, Team Hawk')).toBeInTheDocument();
    expect(screen.getByText('Team Delta')).toBeInTheDocument();
  });

  it('should render milestone section when milestones are present', async () => {
    // Act
    render(<RoadmapPlanner markdownData={mockRoadmapData} enableDebug={true} />);

    // Wait for loading to complete
    await screen.findByText('Who', {}, { timeout: 3000 });

    // Assert - Milestones section should be present
    expect(screen.getByText('Milestones')).toBeInTheDocument();
  });

  it('should render current week indicator', async () => {
    // Act
    render(<RoadmapPlanner markdownData={mockRoadmapData} enableDebug={true} />);

    // Wait for loading to complete
    await screen.findByText('Who', {}, { timeout: 3000 });

    // Assert - Should have week columns
    expect(screen.getByText('Jun')).toBeInTheDocument();
    expect(screen.getByText('Jul')).toBeInTheDocument();
    expect(screen.getByText('Aug')).toBeInTheDocument();
  });

  it('should show debug info when enabled', async () => {
    // Act
    render(<RoadmapPlanner markdownData={mockRoadmapData} enableDebug={true} />);

    // Wait for loading to complete
    await screen.findByText('Who', {}, { timeout: 3000 });

    // Assert - Debug info should be present
    expect(screen.getByText(/Streams:/)).toBeInTheDocument();
    expect(screen.getByText(/Team Capacity:/)).toBeInTheDocument();
  });

  it('should handle empty or invalid markdown gracefully', async () => {
    // Act
    render(
      <RoadmapPlanner
        markdownData="# Empty Roadmap\n\n## Streams"
        enableDebug={true}
      />
    );

    // Wait for loading to complete
    await screen.findByText('Who', {}, { timeout: 3000 });

    // Assert - Should still render basic structure
    expect(screen.getByText('Who')).toBeInTheDocument();
  });
});
