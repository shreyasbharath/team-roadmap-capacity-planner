// src/components/IntegratedRoadmapEditor.jsx
import { useState, useEffect, useCallback } from 'react';
import { MarkdownEditor } from './MarkdownEditor.jsx';
import { RoadmapPlanner } from './RoadmapPlanner.jsx';
import roadmapData from '../data/roadmap.md?raw';

/**
 * Integrated roadmap editor combining markdown editing with live preview
 * Provides seamless editing experience with real-time roadmap updates
 */
export const IntegratedRoadmapEditor = ({
  initialMarkdown = roadmapData,
  enableDebug = false,
  className = '',
  ...props
}) => {
  const [currentMarkdown, setCurrentMarkdown] = useState(initialMarkdown);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentFilePath, setCurrentFilePath] = useState(null);
  const [currentFileName, setCurrentFileName] = useState(null);
  const [isModified, setIsModified] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState(initialMarkdown);

  const handleMarkdownChange = (markdown) => {
    setCurrentMarkdown(markdown);
    setIsModified(markdown !== lastSavedContent);
  };

  const handleSave = useCallback(async () => {
    // In desktop mode, this would save to file
    // In web mode, this could trigger a download or save to localStorage
    try {
      if (window.__TAURI__) {
        // Tauri desktop save
        const { save } = await import('@tauri-apps/api/dialog');
        const { writeTextFile } = await import('@tauri-apps/api/fs');

        let filePath = currentFilePath;
        
        // If no current file, prompt for save location
        if (!filePath) {
          filePath = await save({
            filters: [{
              name: 'Markdown',
              extensions: ['md']
            }]
          });
        }

        if (filePath) {
          await writeTextFile(filePath, currentMarkdown);

          // Update file state after successful save
          if (!currentFilePath) {
            setCurrentFilePath(filePath);
            setCurrentFileName(filePath.split('/').pop());
          }

          // Mark as saved
          setLastSavedContent(currentMarkdown);
          setIsModified(false);

          // Show success toast or notification
        }
      } else {
        // Web download fallback
        const blob = new Blob([currentMarkdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = currentFileName || 'roadmap.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to save:', error); // eslint-disable-line no-console
      // Show error toast or notification
    }
  }, [currentMarkdown, currentFilePath, currentFileName, setCurrentFilePath, setCurrentFileName, setLastSavedContent, setIsModified]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]); // handleSave is now stable due to useCallback

  const handleLoad = async () => {
    try {
      if (window.__TAURI__) {
        // Tauri desktop load
        const { open } = await import('@tauri-apps/api/dialog');
        const { readTextFile } = await import('@tauri-apps/api/fs');

        const selected = await open({
          filters: [{
            name: 'Markdown',
            extensions: ['md']
          }]
        });

        if (selected && typeof selected === 'string') {
          const contents = await readTextFile(selected);
          setCurrentMarkdown(contents);
          setCurrentFilePath(selected);
          setCurrentFileName(selected.split('/').pop());
          setLastSavedContent(contents);
          setIsModified(false);
        }
      } else {
        // Web file input fallback
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.md,.txt';
        input.onchange = (e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              setCurrentMarkdown(e.target.result);
              setCurrentFileName(file.name);
              setLastSavedContent(e.target.result);
              setIsModified(false);
              // Can't set file path in web mode
              setCurrentFilePath(null);
            };
            reader.readAsText(file);
          }
        };
        input.click();
      }
    } catch (error) {
      console.error('Failed to load:', error); // eslint-disable-line no-console
      // Show error toast or notification
    }
  };

  const handleExportPDF = () => {
    // Trigger the existing PDF export functionality
    const event = new CustomEvent('export-pdf', {
      detail: { format: 'landscape', markdownData: currentMarkdown }
    });
    window.dispatchEvent(event);
  };

  return (
    <div className={`integrated-roadmap-editor h-screen flex flex-col ${className}`} {...props}>
      {/* Header toolbar */}
      <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-gray-900">Roadmap Editor</h1>
          {currentFileName && (
            <span className={`px-2 py-1 text-xs rounded ${
              isModified
                ? 'bg-amber-100 text-amber-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {currentFileName}{isModified ? ' •' : ''}
            </span>
          )}
          {enableDebug && (
            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
              Debug Mode
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLoad}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-150"
            title="Load roadmap file"
          >
            📂 Load
          </button>

          <button
            onClick={handleSave}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
              isModified
                ? 'text-white bg-blue-600 hover:bg-blue-700'
                : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
            }`}
            title="Save roadmap file"
          >
            💾 Save{isModified ? ' *' : ''}
          </button>

          <button
            onClick={handleExportPDF}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-150"
            title="Export to PDF"
          >
            📄 Export PDF
          </button>

          <div className="h-6 border-l border-gray-300 mx-2" />

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-150"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? '🗗' : '🗖'}
          </button>
        </div>
      </div>

      {/* Main editor area */}
      <div className="flex-1 flex">
        <MarkdownEditor
          initialMarkdown={currentMarkdown}
          onMarkdownChange={handleMarkdownChange}
          className="flex-1"
        >
          {/* Live roadmap preview */}
          <div className="h-full">
            <RoadmapPlanner
              markdownData={currentMarkdown}
              enableDebug={enableDebug}
              loadingDelay={0} // Instant loading for live preview
            />
          </div>
        </MarkdownEditor>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span>Lines: {currentMarkdown.split('\n').length}</span>
          <span>Characters: {currentMarkdown.length}</span>
        </div>

        <div className="flex items-center gap-4">
          <span>{isModified ? 'Modified' : 'Saved'}</span>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isModified ? 'bg-amber-500' : 'bg-green-500'}`}></div>
            <span>Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegratedRoadmapEditor;
