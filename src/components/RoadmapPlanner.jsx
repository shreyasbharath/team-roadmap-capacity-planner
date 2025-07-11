// src/components/RoadmapPlanner.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  generateWeeks, 
  getCurrentWeek, 
  parseMarkdown 
} from '../domain/timelineParser.js';
import { QUARTERS_CONFIG } from '../data/demoData.js';
import roadmapData from '../data/roadmap.md?raw';
import { TimelineHeader, MonthHeaders, WeekHeaders } from './TimelineHeader.jsx';
import { TeamCapacityRow } from './TeamCapacity.jsx';
import { MilestonesRow } from './StreamComponents.jsx';
import { StreamContainer } from './StreamContainer.jsx';
import { 
  useZoom, 
  ZoomControls, 
  HelpPanel, 
  LoadingSpinner, 
  PanHint, 
  DebugInfo 
} from './NavigationControls.jsx';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation.js';

/**
 * Main roadmap planner component
 */
export const RoadmapPlanner = ({ 
  markdownData = roadmapData,
  quarters = QUARTERS_CONFIG,
  enableDebug = false,
  loadingDelay = 1000
}) => {
  const [loading, setLoading] = useState(true);
  const [showPanHint, setShowPanHint] = useState(true);
  const containerRef = useRef(null);
  
  // Generate timeline data
  const weeks = generateWeeks(quarters);
  const currentWeek = getCurrentWeek(weeks);
  const currentWeekIndex = weeks.indexOf(currentWeek);
  const currentDate = new Date().toLocaleDateString('en-AU', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
  
  // Parse roadmap data
  const { streams, teamCapacity, milestones } = parseMarkdown(markdownData);
  
  // Zoom functionality
  const { zoom, zoomIn, zoomOut, resetZoom } = useZoom();
  
  // Keyboard navigation
  useKeyboardNavigation({
    containerRef,
    zoomIn,
    zoomOut,
    resetZoom
  });

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setTimeout(() => setShowPanHint(false), 3000);
    }, loadingDelay);
    return () => clearTimeout(timer);
  }, [loadingDelay]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full h-screen bg-gray-50 relative">
      {/* Controls */}
      <div className="no-print fixed top-4 right-4 z-50 flex flex-col gap-2">
        <ZoomControls 
          zoom={zoom}
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          resetZoom={resetZoom}
        />
        <HelpPanel />
      </div>

      <PanHint show={showPanHint} />

      {/* Main Content */}
      <div 
        ref={containerRef}
        className="w-full h-full overflow-auto p-4"
        style={{ backgroundColor: '#f8fafc' }}
      >
        <div 
          className="roadmap-container min-w-max bg-white rounded-lg shadow-lg border"
          data-testid="roadmap-container"
          style={{ 
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            transition: 'transform 0.2s ease-out'
          }}
        >
          <TimelineHeader quarters={quarters} />
          <MonthHeaders quarters={quarters} />
          <WeekHeaders weeks={weeks} currentWeekIndex={currentWeekIndex} />
          
          <TeamCapacityRow 
            teamCapacity={teamCapacity}
            weeks={weeks}
            currentWeekIndex={currentWeekIndex}
          />
          
          {/* Milestones Section */}
          {milestones && milestones.length > 0 && (
            <MilestonesRow
              milestones={milestones}
              weeks={weeks}
              currentWeekIndex={currentWeekIndex}
            />
          )}
          
          <div className="relative overflow-visible" data-testid="streams-container">
            {streams.map((stream, streamIndex) => (
              <StreamContainer
                key={streamIndex}
                stream={stream}
                weeks={weeks}
                currentWeekIndex={currentWeekIndex}
              />
            ))}
          </div>

          {enableDebug && (
            <DebugInfo 
              streams={streams}
              teamCapacity={teamCapacity}
              milestones={milestones}
              currentWeek={currentWeek}
              currentDate={currentDate}
            />
          )}
        </div>
      </div>
    </div>
  );
};
