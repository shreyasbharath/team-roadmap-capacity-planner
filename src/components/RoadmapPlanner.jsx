// src/components/RoadmapPlanner.jsx
import { useState, useEffect, useRef } from 'react';
import {
  generateWeeks,
  getCurrentWeek,
  parseMarkdown
} from '../domain/timelineParser.js';
import {
  parseSprintMarkdown,
  determineTimelineGranularity
} from '../domain/adaptiveTimelineScaling.js';
import { QUARTERS_CONFIG } from '../data/demoData.js';
import roadmapData from '../data/roadmap.md?raw';
import { TimelineHeader, MonthHeaders, WeekHeaders, DayHeaders } from './TimelineHeader.jsx';
import { TeamCapacityRow } from './TeamCapacity.jsx';
import { MilestonesRow } from './StreamComponents.jsx';
import { StreamContainer } from './StreamContainer.jsx';
import { useZoom } from '../hooks/useZoom.js';
import {
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

  // Determine timeline granularity and parse data accordingly
  const granularityResult = determineTimelineGranularity(markdownData);
  const { granularity, config: timelineConfig } = granularityResult;

  let weeks, currentWeek, currentWeekIndex, streams, teamCapacity, milestones;

  if (granularity === 'daily') {
    // Use adaptive timeline scaling for daily view
    const parseResult = parseSprintMarkdown(markdownData);
    streams = parseResult.streams;
    teamCapacity = parseResult.teamCapacity;
    milestones = parseResult.milestones;

    // For daily view, we don't use traditional weeks but days
    weeks = timelineConfig.days || [];
    currentWeek = null; // Not applicable for daily view
    currentWeekIndex = -1;
  } else {
    // Use traditional parsing for weekly/quarterly views
    weeks = generateWeeks(quarters);
    currentWeek = getCurrentWeek(weeks);
    currentWeekIndex = weeks.indexOf(currentWeek);
    const parseResult = parseMarkdown(markdownData);
    streams = parseResult.streams;
    teamCapacity = parseResult.teamCapacity;
    milestones = parseResult.milestones;
  }

  const currentDate = new Date().toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

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
          {granularity === 'daily' ? (
            // Daily view headers
            <>
              <div className="flex border-b-2 border-gray-300">
                <div className="w-48 bg-blue-600 text-white font-bold p-2 border-r-2 border-gray-300">
                  Daily View
                </div>
                <div className="bg-blue-500 text-white text-center font-semibold p-2"
                     style={{ width: `${weeks.length * 4}rem` }}>
                  Daily Timeline
                </div>
              </div>
              <DayHeaders days={weeks} />
            </>
          ) : (
            // Traditional quarterly/weekly view headers
            <>
              <TimelineHeader quarters={quarters} />
              <MonthHeaders quarters={quarters} />
              <WeekHeaders weeks={weeks} currentWeekIndex={currentWeekIndex} />
            </>
          )}

          <TeamCapacityRow
            teamCapacity={teamCapacity}
            weeks={weeks}
            currentWeekIndex={currentWeekIndex}
            granularity={granularity}
          />

          {/* Milestones Section */}
          {milestones && milestones.length > 0 && (
            <MilestonesRow
              milestones={milestones}
              weeks={weeks}
              currentWeekIndex={currentWeekIndex}
              granularity={granularity}
            />
          )}

          <div className="relative overflow-visible" data-testid="streams-container">
            {streams.map((stream, streamIndex) => (
              <StreamContainer
                key={streamIndex}
                stream={stream}
                weeks={weeks}
                currentWeekIndex={currentWeekIndex}
                granularity={granularity}
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
              granularity={granularity}
              timelineConfig={timelineConfig}
            />
          )}
        </div>
      </div>
    </div>
  );
};
