// src/components/MarkdownEditor.jsx
import { useState, useRef, useEffect } from 'react';

/**
 * Split-pane markdown editor with live roadmap preview
 * Provides real-time editing of roadmap markdown with syntax highlighting and validation
 */
export const MarkdownEditor = ({ 
  initialMarkdown = '', 
  onMarkdownChange, 
  children,
  className = '',
  ...props 
}) => {
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [viewMode, setViewMode] = useState('split'); // 'editor', 'preview', 'split'
  const [errors, setErrors] = useState([]);
  const [showSyntaxHelp, setShowSyntaxHelp] = useState(false);
  const textareaRef = useRef(null);

  // Update parent when markdown changes
  useEffect(() => {
    onMarkdownChange?.(markdown);
    validateMarkdown(markdown);
  }, [markdown, onMarkdownChange]);

  // Basic markdown validation
  const validateMarkdown = (text) => {
    const newErrors = [];
    const lines = text.split('\n');
    
    lines.forEach((line, index) => {
      // Check for malformed date ranges
      if (line.includes('W') && !line.match(/\w{3}\s+W\d+-\w{3}\s+W\d+/)) {
        if (line.includes('W') && !line.match(/\w{3}\s+W\d+/)) {
          newErrors.push({
            line: index + 1,
            message: 'Invalid date format. Use: Jul W1-Jul W3 or Jul W1',
            type: 'warning'
          });
        }
      }
      
      // Check for missing colors
      if (line.includes('**') && line.includes('|') && !line.includes('color:')) {
        newErrors.push({
          line: index + 1,
          message: 'Missing color property. Add: | color: #HexCode',
          type: 'info'
        });
      }
    });
    
    setErrors(newErrors);
  };

  const handleKeyDown = (e) => {
    // Tab support for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.target;
      const newValue = markdown.substring(0, selectionStart) + '  ' + markdown.substring(selectionEnd);
      setMarkdown(newValue);
      
      // Restore cursor position safely
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = selectionStart + 2;
        }
      }, 0);
    }
  };

  const insertTemplate = (template) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const { selectionStart } = textarea;
    const newValue = markdown.substring(0, selectionStart) + template + markdown.substring(selectionStart);
    setMarkdown(newValue);
    
    // Focus back to editor safely
    setTimeout(() => {
      if (textarea && document.contains(textarea)) {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = selectionStart + template.length;
      }
    }, 0);
  };

  const templates = {
    stream: '\n### 🚀 New Stream\n- **New Task**: Jul W1-Jul W4 | Team Member | color: #4F46E5\n',
    task: '- **New Task**: Jul W1-Jul W4 | Team Member | color: #4F46E5\n',
    milestone: '- **Milestone: New Milestone**: hard-date: 2025-07-31 | color: #DC2626\n',
    capacity: '- **Team Member Leave**: Jul W1-Jul W2 | color: #FFA500\n',
    risk: '- **Risk: New Risk**: Jul W1-Jul W4 | risk-level: medium | color: #F59E0B\n'
  };

  const ViewModeButton = ({ mode, icon, label, isActive }) => (
    <button
      onClick={() => setViewMode(mode)}
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 flex items-center gap-1.5 ${
        isActive 
          ? 'bg-blue-600 text-white shadow-sm' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
      title={label}
    >
      <span>{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className={`markdown-editor flex flex-col h-full ${className}`} {...props}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {/* View mode toggles */}
          <div className="flex bg-white rounded-lg shadow-sm border border-gray-300 p-1">
            <ViewModeButton mode="editor" icon="✏️" label="Editor" isActive={viewMode === 'editor'} />
            <ViewModeButton mode="split" icon="⚌" label="Split" isActive={viewMode === 'split'} />
            <ViewModeButton mode="preview" icon="👁" label="Preview" isActive={viewMode === 'preview'} />
          </div>
          
          {/* Template buttons - only show in editor mode */}
          {(viewMode === 'editor' || viewMode === 'split') && (
            <div className="flex items-center gap-1 ml-4">
              <span className="text-sm text-gray-500 mr-2">Quick Add:</span>
              {Object.entries(templates).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => insertTemplate(template)}
                  className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors duration-150"
                  title={`Add ${key}`}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Error indicator */}
          {errors.length > 0 && (
            <span className="text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded">
              {errors.length} issue{errors.length !== 1 ? 's' : ''}
            </span>
          )}
          
          {/* Syntax help toggle */}
          <button
            onClick={() => setShowSyntaxHelp(!showSyntaxHelp)}
            className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
          >
            {showSyntaxHelp ? 'Hide Help' : 'Syntax Help'}
          </button>
        </div>
      </div>

      {/* Syntax help panel */}
      {showSyntaxHelp && (
        <div className="bg-blue-50 border-b border-blue-200 p-4 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Basic Syntax</h4>
              <div className="space-y-1 text-blue-800">
                <div><code># Title</code> - Main title</div>
                <div><code>## Section</code> - Section header</div>
                <div><code>### Stream</code> - Project stream</div>
                <div><code>- **Task**: Date | Team | color: #hex</code></div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Date Formats</h4>
              <div className="space-y-1 text-blue-800">
                <div><code>Jul W1-Jul W4</code> - Week ranges</div>
                <div><code>hard-deadline: 2025-07-31</code> - Hard deadline</div>
                <div><code>soft-deadline: 2025-07-31</code> - Soft deadline</div>
                <div><code>risk-level: high</code> - Risk indicator</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex min-h-0">
        {/* Editor pane */}
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} flex flex-col border-r border-gray-200`}>
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full h-full p-4 font-mono text-sm border-none resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                placeholder="# Roadmap Title

## Team Capacity
- **Person Leave**: Jul W1-Jul W2 | color: #FFA500

## Streams

### 🚀 Platform Work
- **Feature Name**: Jul W1-Jul W4 | Team Member | color: #4F46E5

## Milestones
- **Milestone: Launch**: hard-date: 2025-07-31 | color: #DC2626"
                spellCheck={false}
                data-testid="markdown-textarea"
              />
              
              {/* Error overlay */}
              {errors.length > 0 && (
                <div className="absolute bottom-4 left-4 right-4 bg-white border border-amber-200 rounded-md shadow-lg p-3 max-h-40 overflow-y-auto">
                  <h5 className="font-medium text-amber-800 mb-2">Issues Found:</h5>
                  {errors.map((error, index) => (
                    <div key={index} className={`text-sm mb-1 ${
                      error.type === 'warning' ? 'text-amber-700' : 'text-blue-700'
                    }`}>
                      Line {error.line}: {error.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preview pane */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} flex flex-col bg-gray-50`}>
            <div className="p-2 bg-white border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
            </div>
            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Standalone roadmap editor with built-in roadmap planner
 */
export const RoadmapEditor = ({ initialMarkdown, onSave, ...props }) => {
  // This would integrate with your RoadmapPlanner component
  const handleMarkdownChange = (markdown) => {
    onSave?.(markdown);
  };

  return (
    <MarkdownEditor
      initialMarkdown={initialMarkdown}
      onMarkdownChange={handleMarkdownChange}
      {...props}
    >
      {/* This is where your RoadmapPlanner would be rendered */}
      <div className="p-4 text-center text-gray-500">
        <p>Roadmap preview will appear here</p>
        <p className="text-sm mt-2">Connect with RoadmapPlanner component</p>
      </div>
    </MarkdownEditor>
  );
};

export default MarkdownEditor;
