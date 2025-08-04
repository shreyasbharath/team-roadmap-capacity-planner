// src/components/__tests__/markdown-editor-prop-sync.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MarkdownEditor } from '../MarkdownEditor.jsx';

describe('MarkdownEditor Prop Sync', () => {
  it('should update textarea when initialMarkdown prop changes', async () => {
    // Arrange - initial render with first content
    const initialContent = '# Initial Content\n\n## Streams\n- **Initial Task**: Jul W1 | Team | color: #123456';
    
    const { rerender } = await act(async () => {
      return render(
        <MarkdownEditor 
          initialMarkdown={initialContent}
          onMarkdownChange={() => {}}
        />
      );
    });

    // Verify initial content is displayed
    const textarea = screen.getByTestId('markdown-textarea');
    expect(textarea.value).toContain('Initial Content');
    expect(textarea.value).toContain('Initial Task');

    // Act - update the prop with new content
    const newContent = '# Updated Content\n\n## Streams\n- **Updated Task**: Aug W1 | Team | color: #789ABC';
    
    await act(async () => {
      rerender(
        <MarkdownEditor 
          initialMarkdown={newContent}
          onMarkdownChange={() => {}}
        />
      );
    });

    // Assert - textarea should show the new content
    expect(textarea.value).toContain('Updated Content');
    expect(textarea.value).toContain('Updated Task');
    expect(textarea.value).not.toContain('Initial Content');
    expect(textarea.value).not.toContain('Initial Task');
  });
});
