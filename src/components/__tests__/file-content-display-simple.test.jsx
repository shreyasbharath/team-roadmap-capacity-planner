// src/components/__tests__/file-content-display-simple.test.jsx
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

describe.skip('File Content Display - Simple Tests', () => {
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
    expect(textarea).toBeInTheDocument(); // Just check it exists first

    // Act - Load a different file with specific content
    const testFilePath = '/Users/test/loaded-roadmap.md';
    const loadedContent = `# Loaded Test Roadmap

## Streams

### New Feature Stream
- **Authentication System**: Jan W1-Feb W2 | Backend Team | color: #4ECDC4`;

    mockOpen.mockResolvedValue(testFilePath);
    mockReadTextFile.mockResolvedValue(loadedContent);

    const loadButton = screen.getByTitle('Load roadmap file');
    
    await act(async () => {
      await user.click(loadButton);
    });

    // Assert - Check that APIs were called
    await waitFor(() => {
      expect(mockOpen).toHaveBeenCalled();
      expect(mockReadTextFile).toHaveBeenCalledWith(testFilePath);
    }, { timeout: 5000 });

    // The critical assertion: textarea should contain the loaded content
    await waitFor(() => {
      const textareaAfterLoad = screen.getByTestId('markdown-textarea');
      expect(textareaAfterLoad.value).toContain('Loaded Test Roadmap');
      expect(textareaAfterLoad.value).toContain('Authentication System');
    }, { timeout: 5000 });

    // Filename should be displayed in the UI
    await waitFor(() => {
      expect(screen.getByText(/loaded-roadmap\.md/)).toBeInTheDocument();
    }, { timeout: 5000 });
  }, 10000); // Individual test timeout of 10 seconds
});
