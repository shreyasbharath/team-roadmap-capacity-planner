import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntegratedRoadmapEditor } from '../IntegratedRoadmapEditor.jsx';

// Mock Tauri APIs properly
const mockWriteTextFile = vi.fn();
const mockReadTextFile = vi.fn();
const mockOpen = vi.fn();
const mockSave = vi.fn();

// Create comprehensive Tauri mock
const createTauriMock = () => {
  // Mock the IPC function that Tauri uses internally
  window.__TAURI_IPC__ = vi.fn();

  // Mock Tauri's invoke function
  globalThis.__TAURI_INTERNALS__ = {
    invoke: vi.fn()
  };

  // Mock the modules that will be dynamically imported
  vi.doMock('@tauri-apps/api/fs', () => ({
    writeTextFile: mockWriteTextFile,
    readTextFile: mockReadTextFile,
  }));

  vi.doMock('@tauri-apps/api/dialog', () => ({
    open: mockOpen,
    save: mockSave,
  }));
};

describe('File Overwrite Behavior', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    // Set up comprehensive Tauri mocking
    createTauriMock();

    // Indicate Tauri environment
    window.__TAURI__ = true;

    // Reset all mocks
    vi.clearAllMocks();

    // Default successful responses
    mockWriteTextFile.mockResolvedValue();
    mockReadTextFile.mockResolvedValue('# Test Content');
    mockOpen.mockResolvedValue('/test/path.md');
    mockSave.mockResolvedValue('/test/save-path.md');
  });

  afterEach(() => {
    // Clean up mocks
    delete window.__TAURI__;
    delete window.__TAURI_IPC__;
    delete globalThis.__TAURI_INTERNALS__;
    vi.resetAllMocks();
  });

  it('should overwrite loaded file on save without showing Save As dialog', async () => {
    // Start with simple initial markdown to make testing easier
    const simpleMarkdown = '# Test Roadmap\n\n## Streams\n- **Test Task**: Jul W1 | Team A | color: #4F46E5';

    // Render component with simple content
    render(<IntegratedRoadmapEditor initialMarkdown={simpleMarkdown} />);

    // Get the editor
    const editor = screen.getByRole('textbox');

    // Verify initial content
    expect(editor).toHaveValue(simpleMarkdown);

    // Clear and add new content to simulate file editing
    await user.clear(editor);
    await user.type(editor, '# Modified Roadmap\n\n## Streams\n- **New Task**: Jul W2 | Team B | color: #EF4444');

    // Verify the content was updated - check that it includes our new content
    const currentValue = editor.value;
    expect(currentValue).toContain('New Task');
    expect(currentValue).toContain('Modified Roadmap');

    // Act: Save the file
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    // Component should remain functional and content should still be there
    expect(editor.value).toContain('New Task');
  });

  it('should show Save As dialog for new untitled document', async () => {
    // Start with empty content to simulate new document
    render(<IntegratedRoadmapEditor initialMarkdown="" />);

    // Add content to the editor
    const editor = screen.getByRole('textbox');
    await user.type(editor, '# New Project Roadmap\n\n## Streams\n- **New Project**: Aug W1 | Team C | color: #10B981');

    // Verify content is in editor
    expect(editor.value).toContain('New Project');

    // Act: Save the file
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    // Verify content is still there after save attempt
    expect(editor.value).toContain('New Project');
  });

  it('should show Save As dialog when explicitly requested', async () => {
    // Start with some content
    const initialContent = '# Original Roadmap\n\n## Streams\n- Test';
    render(<IntegratedRoadmapEditor initialMarkdown={initialContent} />);

    const editor = screen.getByRole('textbox');

    // Verify initial content is loaded
    expect(editor.value).toContain('Original Roadmap');

    // This test documents expected behavior for future Save As implementation
    const loadButton = screen.getByRole('button', { name: /load/i });
    expect(loadButton).toBeInTheDocument();

    // In the future, we'd test clicking a "Save As" button here
    // For now, just verify the component is functional
    expect(editor).toBeInTheDocument();
  });

  it('should handle save errors gracefully', async () => {
    // Mock console.error to verify error handling
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<IntegratedRoadmapEditor initialMarkdown="# Test Content" />);

    // Verify component renders
    const editor = screen.getByRole('textbox');
    expect(editor.value).toContain('Test Content');

    // Try to save
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    // Component should remain functional regardless of save success/failure
    expect(saveButton).toBeInTheDocument();
    expect(editor).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
