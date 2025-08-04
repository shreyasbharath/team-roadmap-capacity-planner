// src/components/__tests__/file-content-display.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntegratedRoadmapEditor } from '../IntegratedRoadmapEditor.jsx';

// Mock Tauri APIs
const mockSave = vi.fn();
const mockOpen = vi.fn();
const mockReadTextFile = vi.fn();
const mockWriteTextFile = vi.fn();

vi.mock('@tauri-apps/api/dialog', () => ({
  save: mockSave,
  open: mockOpen,
}));

vi.mock('@tauri-apps/api/fs', () => ({
  readTextFile: mockReadTextFile,
  writeTextFile: mockWriteTextFile,
}));

// Mock Tauri detection
Object.defineProperty(window, '__TAURI__', {
  value: true,
  writable: true
});

describe.skip('File Content Display After Load', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display loaded file content in the markdown editor textarea', async () => {
    const user = userEvent.setup();

    // Arrange - render editor with default content
    await act(async () => {
      render(<IntegratedRoadmapEditor />);
    });

    // Verify default content is shown initially
    const textarea = screen.getByTestId('markdown-textarea');
    expect(textarea.value).toContain('blah'); // Default roadmap content

    // Act - Load a different file with specific content
    const testFilePath = '/Users/test/loaded-roadmap.md';
    const loadedContent = `# Loaded Test Roadmap

## Team Capacity
- **John Holiday**: Dec W1-Dec W2 | color: #FF6B6B

## Streams

### New Feature Stream
- **Authentication System**: Jan W1-Feb W2 | Backend Team | color: #4ECDC4
- **User Dashboard**: Feb W1-Mar W1 | Frontend Team | color: #45B7D1`;

    mockOpen.mockResolvedValue(testFilePath);
    mockReadTextFile.mockResolvedValue(loadedContent);

    const loadButton = screen.getByTitle('Load roadmap file');

    await act(async () => {
      await user.click(loadButton);
    });

    // Assert - UI should show the loaded content, not the default content
    await waitFor(() => {
      expect(mockOpen).toHaveBeenCalled();
      expect(mockReadTextFile).toHaveBeenCalledWith(testFilePath);
    }, { timeout: 5000 });

    // The critical assertion: textarea should contain the loaded content
    await waitFor(() => {
      const textareaAfterLoad = screen.getByTestId('markdown-textarea');
      expect(textareaAfterLoad.value).toContain('Loaded Test Roadmap');
      expect(textareaAfterLoad.value).toContain('Authentication System');
      expect(textareaAfterLoad.value).toContain('User Dashboard');

      // Should NOT contain the default content anymore
      expect(textareaAfterLoad.value).not.toContain('blah');
    }, { timeout: 5000 });

    // Filename should be displayed in the UI
    await waitFor(() => {
      expect(screen.getByText(/loaded-roadmap\.md/)).toBeInTheDocument();
    }, { timeout: 5000 });
  }, 10000); // 10 second timeout for this test

  it('should update the roadmap visualization when file content is loaded', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<IntegratedRoadmapEditor />);
    });

    // Act - Load file containing specific tasks that should appear in visualization
    const testFilePath = '/Users/test/visual-test.md';
    const loadedContent = `# Visual Test Roadmap

## Streams

### Test Stream
- **Unique Task Name**: Jan W1-Jan W2 | Test Team | color: #FF5733`;

    mockOpen.mockResolvedValue(testFilePath);
    mockReadTextFile.mockResolvedValue(loadedContent);

    const loadButton = screen.getByTitle('Load roadmap file');

    await act(async () => {
      await user.click(loadButton);
    });

    // Assert - The roadmap visualization should update with new content
    await waitFor(() => {
      // Look for the unique task name in the rendered roadmap
      expect(screen.getByText('Unique Task Name')).toBeInTheDocument();
    }, { timeout: 5000 });
  }, 10000); // 10 second timeout

  it('should handle multiple file loads in succession', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<IntegratedRoadmapEditor />);
    });

    // Load first file
    const firstFilePath = '/Users/test/first-roadmap.md';
    const firstContent = '# First Roadmap\n\n## Streams\n### Stream A\n- **First Task**: Jan W1 | Team | color: #123456';

    mockOpen.mockResolvedValueOnce(firstFilePath);
    mockReadTextFile.mockResolvedValueOnce(firstContent);

    const loadButton = screen.getByTitle('Load roadmap file');

    await act(async () => {
      await user.click(loadButton);
    });

    await waitFor(() => {
      const textarea = screen.getByTestId('markdown-textarea');
      expect(textarea.value).toContain('First Task');
    }, { timeout: 5000 });

    // Load second file - should replace first file content
    const secondFilePath = '/Users/test/second-roadmap.md';
    const secondContent = '# Second Roadmap\n\n## Streams\n### Stream B\n- **Second Task**: Feb W1 | Team | color: #789ABC';

    mockOpen.mockResolvedValueOnce(secondFilePath);
    mockReadTextFile.mockResolvedValueOnce(secondContent);

    await act(async () => {
      await user.click(loadButton);
    });

    // Assert - should show second file content, not first
    await waitFor(() => {
      const textarea = screen.getByTestId('markdown-textarea');
      expect(textarea.value).toContain('Second Task');
      expect(textarea.value).not.toContain('First Task');
    }, { timeout: 5000 });

    await waitFor(() => {
      expect(screen.getByText(/second-roadmap\.md/)).toBeInTheDocument();
    }, { timeout: 5000 });
  }, 10000); // 10 second timeout

  it('should preserve modifications indicator after loading a file', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<IntegratedRoadmapEditor />);
    });

    // Load a file
    const testFilePath = '/Users/test/test-roadmap.md';
    const loadedContent = '# Test Roadmap\n\n## Streams\n### Stream\n- **Task**: Jan W1 | Team | color: #123456';

    mockOpen.mockResolvedValue(testFilePath);
    mockReadTextFile.mockResolvedValue(loadedContent);

    const loadButton = screen.getByTitle('Load roadmap file');

    await act(async () => {
      await user.click(loadButton);
    });

    // After loading, should not be marked as modified
    await waitFor(() => {
      expect(screen.getByText('Saved')).toBeInTheDocument();
      expect(screen.queryByText('Modified')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Modify the content
    const textarea = screen.getByTestId('markdown-textarea');

    await act(async () => {
      await user.type(textarea, '\n- **New Task**: Feb W1 | Team | color: #ABCDEF');
    });

    // Should now be marked as modified
    await waitFor(() => {
      expect(screen.getByText('Modified')).toBeInTheDocument();
      expect(screen.queryByText('Saved')).not.toBeInTheDocument();
    }, { timeout: 5000 });
  }, 10000); // 10 second timeout
});
