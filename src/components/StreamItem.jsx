// src/components/StreamItem.jsx
import React from 'react';
import { parseTimelineRange } from '../domain/timelineParser.js';
import { TooltipWrapper, TimelineBar } from './StreamComponents.jsx';

/**
 * Renders a week cell with vertical indicator lines
 */
export const WeekCell = ({ 
  week, 
  weekIndex, 
  currentWeekIndex, 
  hasHardDeadline, 
  hasSoftDeadline, 
  hasRisk 
}) => (
  <div key={week} className="relative w-16 border-r border-gray-100" data-testid="week-cell" style={{ minHeight: '3rem' }}>
    {/* Current Date Line */}
    {weekIndex === currentWeekIndex && (
      <div className="absolute left-0 top-0 bottom-0 border-l-2 border-dotted border-green-500" />
    )}
    
    {/* Hard Deadline Lines */}
    {hasHardDeadline && (
      <div className="absolute left-0 top-0 bottom-0 border-l-2 border-dashed border-red-500" />
    )}
    
    {/* Soft Deadline Lines */}
    {hasSoftDeadline && (
      <div className="absolute left-0 top-0 bottom-0 border-l-2 border-dashed border-blue-500" />
    )}
    
    {/* Risk Lines */}
    {hasRisk && (
      <div className="absolute left-0 top-0 bottom-0 border-l-2 border-dotted border-red-600" />
    )}
  </div>
);

/**
 * Renders a stream item row with timeline bar
 */
export const StreamItem = ({ 
  item, 
  weeks, 
  currentWeekIndex, 
  hardDeadlines, 
  softDeadlines, 
  risks 
}) => {
  const { start, end } = parseTimelineRange(item.timeline, weeks);
  
  return (
    <div className="flex border-b border-gray-200 min-h-12 relative bg-white" data-testid="stream-item">
      <TooltipWrapper text={`Team: ${item.team}`}>
        <div className="w-48 p-2 border-r border-gray-300 text-sm bg-gray-50 pl-4 cursor-help overflow-hidden">
          <span className="truncate block">{item.team}</span>
        </div>
      </TooltipWrapper>
      
      <div 
        className="flex relative overflow-visible" 
        style={{ 
          minHeight: '3rem'
        }}
      >
        {/* Week cells with vertical lines */}
        {weeks.map((week, weekIndex) => {
          const hasHardDeadline = hardDeadlines.some(d => d.weekIndex === weekIndex);
          const hasSoftDeadline = softDeadlines.some(d => d.weekIndex === weekIndex);
          const hasRisk = risks && risks.some(risk => {
            const { start, end } = parseTimelineRange(risk.timeline, weeks);
            return weekIndex >= start && weekIndex <= end;
          });
          
          return (
            <WeekCell
              key={week}
              week={week}
              weekIndex={weekIndex}
              currentWeekIndex={currentWeekIndex}
              hasHardDeadline={hasHardDeadline}
              hasSoftDeadline={hasSoftDeadline}
              hasRisk={hasRisk}
            />
          );
        })}
        
        {/* Timeline bar positioned absolutely within the timeline container */}
        <div
          className="absolute top-1 rounded text-white text-sm font-medium flex items-center justify-start px-2 overflow-hidden cursor-help"
          data-testid="timeline-bar"
          style={{
            left: `${start * 4}rem`,
            width: `${(end - start + 1) * 4}rem`,
            height: '2rem',
            backgroundColor: item.color,
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            zIndex: 20
          }}
        >
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">
            {item.name}
          </span>
        </div>
      </div>
    </div>
  );
};
