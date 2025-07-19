// src/components/__tests__/markdown-editor-smoke-test.jsx
// Quick smoke test to verify our MarkdownEditor components work

import { describe, it, expect } from 'vitest';

describe('MarkdownEditor Components', () => {
  it('should be importable without errors', async () => {
    // Test that we can import the components
    const { MarkdownEditor } = await import('../MarkdownEditor.jsx');
    const { IntegratedRoadmapEditor } = await import('../IntegratedRoadmapEditor.jsx');
    
    expect(MarkdownEditor).toBeDefined();
    expect(IntegratedRoadmapEditor).toBeDefined();
  });

  it('should have correct exports', async () => {
    const markdownEditorModule = await import('../MarkdownEditor.jsx');
    const integratedEditorModule = await import('../IntegratedRoadmapEditor.jsx');
    
    expect(typeof markdownEditorModule.MarkdownEditor).toBe('function');
    expect(typeof markdownEditorModule.RoadmapEditor).toBe('function');
    expect(typeof integratedEditorModule.IntegratedRoadmapEditor).toBe('function');
  });
});
