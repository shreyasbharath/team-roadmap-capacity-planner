// src/components/TeamCapacity.jsx
import React from 'react';
import { parseTimelineRange } from '../domain/timelineParser.js';
import { TooltipWrapper } from './StreamComponents.jsx';

/**
 * Renders a single capacity bar
 */
export const CapacityBar = ({ capacity, weeks }) => {
  const { start, end } = parseTimelineRange(capacity.timeline, weeks);
  const width = ((end - start + 1) * 4);
  const left = (start * 4);
  
  return (
    <TooltipWrapper text={`${capacity.name}: ${capacity.timeline}`}>
      <div
        className="absolute top-1 rounded text-white text-sm font-medium flex items-center justify-start px-2 overflow-visible z-10 border-2 border-white cursor-help"
        style={{
          left: `${left}rem`,
          width: `${width}rem`,
          height: '2rem',
          backgroundColor: capacity.color,
          opacity: 0.8,
          textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
          background: `repeating-linear-gradient(45deg, ${capacity.color}, ${capacity.color} 10px, ${capacity.color}dd 10px, ${capacity.color}dd 20px)`
        }}
      >
        <span className="whitespace-nowrap overflow-hidden text-ellipsis">
          {capacity.name}
        </span>
      </div>
    </TooltipWrapper>
  );
};

/**
 * Renders the team capacity row
 */
export const TeamCapacityRow = ({ teamCapacity, weeks, currentWeekIndex }) => {
  if (!teamCapacity || teamCapacity.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <div className="flex border-b border-gray-300 min-h-12 relative bg-orange-50">
        <div className="w-48 p-2 border-r border-gray-300 text-sm bg-orange-100 text-orange-700 font-bold">
          Team Capacity
        </div>
        <div className="flex relative" style={{ minHeight: '3rem' }}>
          {/* Week cells */}
          {weeks.map((week, weekIndex) => (
            <div key={week} className="relative w-16 border-r border-gray-100 bg-orange-50" style={{ minHeight: '3rem' }}>
              {/* Current Date Line */}
              {weekIndex === currentWeekIndex && (
                <div className="absolute left-0 top-0 bottom-0 border-l-2 border-dotted border-green-500" />
              )}
            </div>
          ))}
          
          {/* Capacity bars */}
          {teamCapacity.map((capacity, capacityIndex) => (
            <CapacityBar 
              key={capacityIndex} 
              capacity={capacity} 
              weeks={weeks} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};
