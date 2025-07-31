import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntegratedRoadmapEditor } from '../IntegratedRoadmapEditor.jsx';

// Mock Tauri APIs
const mockWriteTextFile = vi.fn();
const mockReadTextFile = vi.fn();
const mockOpen = vi.fn();
const mockSave = vi.fn();

// Mock dynamic imports for Tauri
global.__TAURI_INTERNALS__ = {};

// Mock the dynamic import calls
const mockTauriImports = () => {
  global.import = vi.fn().mockImplementation((modulePath) => {
    if (modulePath === '@tauri-apps/api/fs') {
      return Promise.resolve({
        writeTextFile: mockWriteTextFile,
        readTextFile: mockReadTextFile,
      });
    }
    if (modulePath === '@tauri-apps/api/dialog') {
      return Promise.resolve({
        open: mockOpen,
        save: mockSave,
      });
    }
    return Promise.reject(new Error(`Unknown module: ${modulePath}`));
  });
};

describe('File Overwrite Behavior', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    // Mock Tauri environment
    window.__TAURI__ = true;
    
    // Set up dynamic import mocking
    mockTauriImports();
    
    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up
    delete window.__TAURI__;
  });

  it('should overwrite loaded file on save without showing Save As dialog', async () => {
    // Arrange: Set up mock file loading
    const mockFilePath = '/Users/test/my-roadmap.md';
    const mockFileContent = '# Test Roadmap\n\n## Streams\n### Testing\n- **Test Task**: Jul W1 | Team A | color: #4F46E5';
    
    mockOpen.mockResolvedValue(mockFilePath);
    mockReadTextFile.mockResolvedValue(mockFileContent);
    mockWriteTextFile.mockResolvedValue();
    
    // Render component
    render(<IntegratedRoadmapEditor />);
    
    // Act: Load a file first
    const loadButton = screen.getByRole('button', { name: /load/i });
    await user.click(loadButton);
    
    // Wait for file to load
    await waitFor(() => {
      expect(mockOpen).toHaveBeenCalledWith({
        filters: [{ name: 'Markdown', extensions: ['md'] }]
      });
      expect(mockReadTextFile).toHaveBeenCalledWith(mockFilePath);
    });
    
    // Verify file content is loaded
    await waitFor(() => {
      const editor = screen.getByRole('textbox');
      expect(editor.value).toBe(mockFileContent);
    });
    
    // Act: Make a change to the content
    const editor = screen.getByRole('textbox');
    await user.type(editor, '\n- **New Task**: Jul W2 | Team B | color: #EF4444');
    
    // Act: Save the file
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);
    
    // Assert: Should save to existing file path WITHOUT showing Save As dialog
    await waitFor(() => {
      expect(mockWriteTextFile).toHaveBeenCalledWith(
        mockFilePath, // Should use the loaded file path
        expect.stringContaining('New Task') // Should contain the new content
      );
    });
    
    // Assert: Save As dialog should NOT be called
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('should show Save As dialog for new untitled document', async () => {
    // Arrange: Set up Save As dialog
    const mockSaveAsPath = '/Users/test/new-roadmap.md';
    mockSave.mockResolvedValue(mockSaveAsPath);
    mockWriteTextFile.mockResolvedValue();
    
    // Render component (no file loaded)
    render(<IntegratedRoadmapEditor />);
    
    // Act: Make changes to default content
    const editor = screen.getByRole('textbox');
    await user.type(editor, '\n- **New Project**: Aug W1 | Team C | color: #10B981');
    
    // Act: Save the file
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);
    
    // Assert: Should show Save As dialog for new document
    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith({
        filters: [{ name: 'Markdown', extensions: ['md'] }]
      });
    });
    
    // Assert: Should save to chosen location
    await waitFor(() => {
      expect(mockWriteTextFile).toHaveBeenCalledWith(
        mockSaveAsPath,
        expect.stringContaining('New Project')
      );
    });
  });

  it('should show Save As dialog when explicitly requested', async () => {
    // This would be for a "Save As" menu item or button
    // Even if file is already loaded, user wants to save to different location
    
    // Arrange: Load a file first
    const mockOriginalPath = '/Users/test/original.md';
    const mockSaveAsPath = '/Users/test/copy.md';
    
    mockOpen.mockResolvedValue(mockOriginalPath);
    mockReadTextFile.mockResolvedValue('# Original Roadmap');
    mockSave.mockResolvedValue(mockSaveAsPath);
    mockWriteTextFile.mockResolvedValue();
    
    render(<IntegratedRoadmapEditor />);
    
    // Load original file
    const loadButton = screen.getByRole('button', { name: /load/i });
    await user.click(loadButton);
    
    await waitFor(() => {
      expect(mockReadTextFile).toHaveBeenCalledWith(mockOriginalPath);
    });
    
    // TODO: Add "Save As" button/functionality to component
    // This test documents the expected behavior for future implementation
    
    // For now, just verify the loaded file state
    expect(mockOpen).toHaveBeenCalledOnce();
  });

  it('should handle save errors gracefully', async () => {
    // Arrange: Set up file loading and save error
    const mockFilePath = '/Users/test/readonly.md';
    mockOpen.mockResolvedValue(mockFilePath);
    mockReadTextFile.mockResolvedValue('# Test Content');
    mockWriteTextFile.mockRejectedValue(new Error('Permission denied'));
    
    // Mock console.error to verify error handling
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<IntegratedRoadmapEditor />);
    
    // Load file
    const loadButton = screen.getByRole('button', { name: /load/i });
    await user.click(loadButton);
    
    await waitFor(() => {
      expect(mockReadTextFile).toHaveBeenCalledWith(mockFilePath);
    });
    
    // Try to save - should handle error
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);
    
    // Verify error was handled
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to save:', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });
});
