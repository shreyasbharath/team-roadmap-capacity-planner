// src/components/__tests__/IntegratedRoadmapEditor.test.jsx
/* global global */
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IntegratedRoadmapEditor } from '../IntegratedRoadmapEditor.jsx';

// Mock the RoadmapPlanner component to avoid complex rendering
vi.mock('../RoadmapPlanner.jsx', () => ({
  RoadmapPlanner: ({ markdownData }) => (
    <div data-testid="roadmap-planner">
      Roadmap Preview: {markdownData?.substring(0, 50)}...
    </div>
  )
}));

// Mock the markdown data import to avoid file loading issues
vi.mock('../data/roadmap.md?raw', () => ({
  default: '# Default Roadmap\n\n## Streams\n- **Default Task**: Jul W1-Jul W2 | Team | color: #123456'
}));

// Mock DOM APIs that might be used in file operations
const mockCreateElement = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockClick = vi.fn();

describe('IntegratedRoadmapEditor', () => {
  const mockMarkdown = `# Test Roadmap

## Streams
### Platform
- **Feature A**: Jul W1-Jul W4 | Team | color: #4F46E5`;

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup mocks
    global.window.__TAURI__ = undefined;
    
    // Mock URL.createObjectURL and URL.revokeObjectURL for jsdom
    global.URL.createObjectURL = vi.fn(() => 'blob:test-url');
    global.URL.revokeObjectURL = vi.fn();
    
    // Reset mock function states
    mockCreateElement.mockClear();
    mockAppendChild.mockClear();
    mockRemoveChild.mockClear();
    mockClick.mockClear();
  });
  
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders with initial markdown and shows roadmap preview', () => {
    render(<IntegratedRoadmapEditor initialMarkdown={mockMarkdown} />);
    
    expect(screen.getByText('Roadmap Editor')).toBeInTheDocument();
    expect(screen.getByTestId('markdown-textarea')).toBeInTheDocument();
    expect(screen.getByTestId('roadmap-planner')).toBeInTheDocument();
  });

  it('updates roadmap preview when markdown changes', async () => {
    render(<IntegratedRoadmapEditor initialMarkdown="" />);
    
    const textarea = screen.getByTestId('markdown-textarea');
    fireEvent.change(textarea, { target: { value: '# Updated Roadmap' } });
    
    await waitFor(() => {
      expect(screen.getByTestId('roadmap-planner')).toHaveTextContent('Updated Roadmap');
    });
  });

  it('shows status bar with markdown statistics', () => {
    render(<IntegratedRoadmapEditor initialMarkdown={mockMarkdown} />);
    
    const lines = mockMarkdown.split('\n').length;
    const chars = mockMarkdown.length;
    
    expect(screen.getByText(`Lines: ${lines}`)).toBeInTheDocument();
    expect(screen.getByText(`Characters: ${chars}`)).toBeInTheDocument();
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('has load, save, and export buttons', () => {
    render(<IntegratedRoadmapEditor />);
    
    expect(screen.getByText('📂 Load')).toBeInTheDocument();
    expect(screen.getByText('💾 Save')).toBeInTheDocument();
    expect(screen.getByText('📄 Export PDF')).toBeInTheDocument();
  });

  it('has fullscreen toggle button', () => {
    render(<IntegratedRoadmapEditor />);
    
    const fullscreenButton = screen.getByText('🗖');
    expect(fullscreenButton).toBeInTheDocument();
    
    fireEvent.click(fullscreenButton);
    expect(screen.getByText('🗗')).toBeInTheDocument();
  });

  it('shows debug mode indicator when enabled', () => {
    render(<IntegratedRoadmapEditor enableDebug={true} />);
    
    expect(screen.getByText('Debug Mode')).toBeInTheDocument();
  });

  describe('File operations', () => {
    it('triggers PDF export event when export button is clicked', () => {
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
      render(<IntegratedRoadmapEditor initialMarkdown={mockMarkdown} />);
      
      fireEvent.click(screen.getByText('📄 Export PDF'));
      
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'export-pdf',
          detail: expect.objectContaining({
            format: 'landscape',
            markdownData: mockMarkdown
          })
        })
      );
    });

    it('handles web file download when Tauri is not available', () => {
      render(<IntegratedRoadmapEditor initialMarkdown={mockMarkdown} />);
      
      fireEvent.click(screen.getByText('💾 Save'));
      
      // Should have called URL.createObjectURL for web download
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('Integration with MarkdownEditor', () => {
    it('passes markdown changes to preview pane', async () => {      
      render(<IntegratedRoadmapEditor initialMarkdown="" />);
      
      const textarea = screen.getByTestId('markdown-textarea');
      
      // Type in new content
      fireEvent.change(textarea, { 
        target: { value: '# New Content\n\n## Streams\n- Test' } 
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('roadmap-planner')).toHaveTextContent('New Content');
      });
      
      // Status bar should update - check for the actual character count
      await waitFor(() => {
        expect(screen.getByText('Lines: 4')).toBeInTheDocument();
        expect(screen.getByText('Characters: 32')).toBeInTheDocument();
      });
    });

    it('supports all markdown editor features', () => {      
      render(<IntegratedRoadmapEditor />);
      
      // Should have view mode controls
      expect(screen.getByText('Editor')).toBeInTheDocument();
      expect(screen.getByText('Split')).toBeInTheDocument();
      expect(screen.getByText('Preview')).toBeInTheDocument();
      
      // Should have template insertion buttons
      expect(screen.getByText('Stream')).toBeInTheDocument();
      expect(screen.getByText('Task')).toBeInTheDocument();
      expect(screen.getByText('Milestone')).toBeInTheDocument();
    });
  });
});
