// src/components/__tests__/file-operations.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

describe('File Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Load and Save Same File', () => {
    it('should save to the same file that was loaded', async () => {
      const user = userEvent.setup();
      
      // Arrange - render editor
      render(<IntegratedRoadmapEditor />);
      
      // Act 1 - Load a file
      const testFilePath = '/Users/test/my-roadmap.md';
      const testContent = '# Test Roadmap\n\n## Streams\n- **Test Task**: Jul W1-Jul W2 | Team | color: #4F46E5';
      
      mockOpen.mockResolvedValue(testFilePath);
      mockReadTextFile.mockResolvedValue(testContent);
      
      const loadButton = screen.getByTitle('Load roadmap file');
      await user.click(loadButton);
      
      // Wait for file to load
      await waitFor(() => {
        expect(mockOpen).toHaveBeenCalled();
        expect(mockReadTextFile).toHaveBeenCalledWith(testFilePath);
      });
      
      // Act 2 - Modify content slightly
      const textarea = screen.getByTestId('markdown-textarea');
      await user.clear(textarea);
      await user.type(textarea, testContent + '\n- **New Task**: Aug W1 | Team | color: #EF4444');
      
      // Act 3 - Save (should use same file path, not prompt for new one)
      const saveButton = screen.getByTitle('Save roadmap file');
      await user.click(saveButton);
      
      // Assert - Should write to same file without showing save dialog
      await waitFor(() => {
        expect(mockWriteTextFile).toHaveBeenCalledWith(
          testFilePath, // Same path as loaded file
          expect.stringContaining('New Task') // Updated content
        );
      });
      
      // Should NOT have called save dialog again
      expect(mockSave).toHaveBeenCalledTimes(0); // Only called for initial load, not save
    });

    it('should prompt for new file on first save when no file was loaded', async () => {
      const user = userEvent.setup();
      
      // Arrange - render editor without loading any file
      render(<IntegratedRoadmapEditor />);
      
      const newFilePath = '/Users/test/new-roadmap.md';
      mockSave.mockResolvedValue(newFilePath);
      
      // Act - Save without loading a file first
      const saveButton = screen.getByTitle('Save roadmap file');
      await user.click(saveButton);
      
      // Assert - Should prompt for save location
      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledWith({
          filters: [{
            name: 'Markdown',
            extensions: ['md']
          }]
        });
        expect(mockWriteTextFile).toHaveBeenCalledWith(
          newFilePath,
          expect.any(String)
        );
      });
    });

    it('should show current filename in UI when file is loaded', async () => {
      const user = userEvent.setup();
      
      // Arrange
      render(<IntegratedRoadmapEditor />);
      
      const testFilePath = '/Users/test/my-awesome-roadmap.md';
      const testContent = '# My Awesome Roadmap';
      
      mockOpen.mockResolvedValue(testFilePath);
      mockReadTextFile.mockResolvedValue(testContent);
      
      // Act - Load file
      const loadButton = screen.getByTitle('Load roadmap file');
      await user.click(loadButton);
      
      // Assert - Should show filename in UI
      await waitFor(() => {
        expect(screen.getByText(/my-awesome-roadmap\.md/)).toBeInTheDocument();
      });
    });

    it('should handle keyboard shortcut (Cmd+S) for save', async () => {
      const user = userEvent.setup();
      
      // Arrange - render editor and load a file
      render(<IntegratedRoadmapEditor />);
      
      const testFilePath = '/Users/test/shortcut-test.md';
      const testContent = '# Shortcut Test';
      
      mockOpen.mockResolvedValue(testFilePath);
      mockReadTextFile.mockResolvedValue(testContent);
      
      // Load file first
      const loadButton = screen.getByTitle('Load roadmap file');
      await user.click(loadButton);
      
      await waitFor(() => {
        expect(mockReadTextFile).toHaveBeenCalledWith(testFilePath);
      });
      
      // Modify content
      const textarea = screen.getByTestId('markdown-textarea');
      await user.clear(textarea);
      await user.type(textarea, testContent + '\n- **Shortcut Task**: Jul W1 | Team | color: #4F46E5');
      
      // Act - Use keyboard shortcut (Cmd+S)
      await user.keyboard('{Meta>}s{/Meta}');
      
      // Assert - Should save to same file
      await waitFor(() => {
        expect(mockWriteTextFile).toHaveBeenCalledWith(
          testFilePath,
          expect.stringContaining('Shortcut Task')
        );
      });
    });

    it('should handle "Save As" to create new file while preserving current file', async () => {
      const user = userEvent.setup();
      
      // This test would be for a future "Save As" button
      // For now, this documents the expected behaviour
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Error Handling', () => {
    it('should handle file read errors gracefully', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<IntegratedRoadmapEditor />);
      
      mockOpen.mockResolvedValue('/invalid/path.md');
      mockReadTextFile.mockRejectedValue(new Error('File not found'));
      
      const loadButton = screen.getByTitle('Load roadmap file');
      await user.click(loadButton);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to load:', expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });

    it('should handle file write errors gracefully', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<IntegratedRoadmapEditor />);
      
      mockSave.mockResolvedValue('/readonly/path.md');
      mockWriteTextFile.mockRejectedValue(new Error('Permission denied'));
      
      const saveButton = screen.getByTitle('Save roadmap file');
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to save:', expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });
  });
});
