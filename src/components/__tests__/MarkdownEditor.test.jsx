// src/components/__tests__/MarkdownEditor.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MarkdownEditor } from '../MarkdownEditor.jsx';

describe('MarkdownEditor', () => {
  const mockMarkdown = `# Test Roadmap

## Team Capacity  
- **Alice Leave**: Jul W1-Jul W2 | color: #FFA500

## Streams

### Platform Work
- **Feature A**: Jul W1-Jul W4 | Alice | color: #4F46E5`;

  it('renders with initial markdown content', () => {
    render(<MarkdownEditor initialMarkdown={mockMarkdown} />);
    
    const textarea = screen.getByTestId('markdown-textarea');
    expect(textarea.value).toBe(mockMarkdown);
  });

  it('calls onMarkdownChange when content changes', () => {
    const onMarkdownChange = vi.fn();
    render(<MarkdownEditor initialMarkdown="" onMarkdownChange={onMarkdownChange} />);
    
    const textarea = screen.getByTestId('markdown-textarea');
    fireEvent.change(textarea, { target: { value: '# New Content' } });
    
    // No need to wait - this should be synchronous
    expect(onMarkdownChange).toHaveBeenCalledWith('# New Content');
  });

  it('switches between view modes', () => {
    render(<MarkdownEditor initialMarkdown={mockMarkdown} />);
    
    // Should start in split mode
    expect(screen.getByTestId('markdown-textarea')).toBeInTheDocument();
    
    // Switch to editor mode
    fireEvent.click(screen.getByText('Editor'));
    expect(screen.getByTestId('markdown-textarea')).toBeInTheDocument();
    
    // Switch to preview mode
    fireEvent.click(screen.getByText('Preview'));
    expect(screen.getByText('Live Preview')).toBeInTheDocument();
  });

  it('shows and hides syntax help', () => {
    render(<MarkdownEditor />);
    
    // Help should be hidden initially
    expect(screen.queryByText('Basic Syntax')).not.toBeInTheDocument();
    
    // Show help
    fireEvent.click(screen.getByText('Syntax Help'));
    expect(screen.getByText('Basic Syntax')).toBeInTheDocument();
    
    // Hide help
    fireEvent.click(screen.getByText('Hide Help'));
    expect(screen.queryByText('Basic Syntax')).not.toBeInTheDocument();
  });

  it('inserts templates when quick add buttons are clicked', () => {
    render(<MarkdownEditor initialMarkdown="" />);
    
    const textarea = screen.getByTestId('markdown-textarea');
    
    // Click the Stream template button
    fireEvent.click(screen.getByText('Stream'));
    
    // Template insertion should be immediate
    expect(textarea.value).toContain('### 🚀 New Stream');
    expect(textarea.value).toContain('- **New Task**: Jul W1-Jul W4');
  });

  it('handles Tab key for indentation', () => {
    render(<MarkdownEditor initialMarkdown="test" />);
    
    const textarea = screen.getByTestId('markdown-textarea');
    
    // Position cursor at start
    textarea.setSelectionRange(0, 0);
    
    // Press Tab
    fireEvent.keyDown(textarea, { key: 'Tab', preventDefault: vi.fn() });
    
    expect(textarea.value).toBe('  test');
  });

  it('validates markdown and shows errors', async () => {
    // This should trigger validation - missing color property
    const invalidMarkdown = '- **Task**: Jul W1-Jul W4 | Team Member';
    render(<MarkdownEditor initialMarkdown={invalidMarkdown} />);
    
    await waitFor(() => {
      // Look for error indicator - should show "1 issue" for missing color
      const errorIndicator = screen.getByText(/1 issue/);
      expect(errorIndicator).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('renders children in preview pane', () => {
    const TestChild = () => <div data-testid="test-child">Preview Content</div>;
    
    render(
      <MarkdownEditor>
        <TestChild />
      </MarkdownEditor>
    );
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  describe('Template insertion', () => {
    it('inserts task template correctly', () => {
      render(<MarkdownEditor initialMarkdown="" />);
      
      const textarea = screen.getByTestId('markdown-textarea');
      fireEvent.click(screen.getByText('Task'));
      
      expect(textarea.value).toContain('- **New Task**: Jul W1-Jul W4 | Team Member | color: #4F46E5');
    });

    it('inserts milestone template correctly', () => {
      render(<MarkdownEditor initialMarkdown="" />);
      
      const textarea = screen.getByTestId('markdown-textarea');
      fireEvent.click(screen.getByText('Milestone'));
      
      expect(textarea.value).toContain('- **Milestone: New Milestone**: hard-date: 2025-07-31');
    });
  });

  describe('Error validation', () => {
    it('detects missing color properties', async () => {
      const markdownWithoutColor = '- **Task**: Jul W1-Jul W4 | Alice';
      render(<MarkdownEditor initialMarkdown={markdownWithoutColor} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Missing color property/)).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('detects invalid date formats', async () => {
      const markdownWithBadDate = '- **Task**: BadW1-BadW4 | Alice | color: #123';
      render(<MarkdownEditor initialMarkdown={markdownWithBadDate} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Invalid date format/)).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });
});
