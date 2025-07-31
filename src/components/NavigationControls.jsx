import { useAutoHide } from '../hooks/useAutoHide.js';

/**
 * Zoom control buttons with auto-hide functionality
 */
export const ZoomControls = ({ zoom, zoomIn, zoomOut, resetZoom }) => {
  // Check if we're in print mode (disable auto-hide for print)
  const isPrintMode = typeof window !== 'undefined' && 
    window.matchMedia && 
    window.matchMedia('print') && 
    window.matchMedia('print').matches || false;
  
  const { isVisible, handlers } = useAutoHide(3000, isPrintMode);

  return (
    <div 
      className={`zoom-controls rounded-lg p-3 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      data-testid="zoom-controls"
      {...handlers}
    >
      <div className="text-xs text-gray-600 mb-2 font-medium">
        Zoom: {Math.round(zoom * 100)}%
      </div>
      <div className="flex gap-1">
        <button
          onClick={(e) => {
            zoomOut();
            handlers.onClick(e);
          }}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colours"
          title="Zoom Out (Ctrl/Cmd + -)"
          aria-label="Zoom Out"
        >
          −
        </button>
        <button
          onClick={(e) => {
            resetZoom();
            handlers.onClick(e);
          }}
          className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colours"
          title="Reset Zoom (Ctrl/Cmd + 0)"
          aria-label="Reset Zoom"
        >
          ⌂
        </button>
        <button
          onClick={(e) => {
            zoomIn();
            handlers.onClick(e);
          }}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colours"
          title="Zoom In (Ctrl/Cmd + +)"
          aria-label="Zoom In"
        >
          +
        </button>
      </div>
    </div>
  );
};

/**
 * Help and navigation hints with auto-hide
 */
export const HelpPanel = () => {
  // Check if we're in print mode (disable auto-hide for print)
  const isPrintMode = typeof window !== 'undefined' && 
    window.matchMedia && 
    window.matchMedia('print') && 
    window.matchMedia('print').matches || false;
  
  const { isVisible, handlers } = useAutoHide(3000, isPrintMode);

  return (
    <div 
      className={`zoom-controls rounded-lg p-3 text-xs text-gray-600 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      data-testid="help-panel"
      {...handlers}
    >
      <div className="font-medium mb-1">Navigation:</div>
      <div>Arrow keys to pan</div>
      <div>Ctrl/Cmd + +/- to zoom</div>
      <div>Hover for full text</div>
    </div>
  );
};

/**
 * Loading spinner component
 */
export const LoadingSpinner = () => (
  <div className="w-full h-screen bg-white flex items-center justify-center">
    <div className="text-center">
      <div className="loading-spinner mx-auto mb-4" />
      <div className="text-gray-600">Loading Roadmap...</div>
    </div>
  </div>
);

/**
 * Pan hint notification
 */
export const PanHint = ({ show }) => {
  if (!show) return null;

  return (
    <div className="no-print fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm pan-hint">
      Use arrow keys or scroll to navigate the timeline
    </div>
  );
};

/**
 * Debug information panel
 */
export const DebugInfo = ({ streams, teamCapacity, milestones, currentWeek, currentDate }) => {
  const totalRisks = streams.reduce((total, stream) =>
    total + (stream.risks ? stream.risks.length : 0), 0
  );

  return (
    <div className="no-print mt-4 text-xs text-gray-500 bg-gray-50 p-3 rounded border-t">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <div>Streams: {streams.length}</div>
        <div>Team Capacity: {teamCapacity.length}</div>
        <div>Milestones: {milestones ? milestones.length : 0}</div>
        <div>Risks: {totalRisks}</div>
        <div>Current: {currentWeek} ({currentDate})</div>
      </div>
    </div>
  );
};
