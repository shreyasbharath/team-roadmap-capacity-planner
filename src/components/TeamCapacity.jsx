// src/components/TeamCapacity.jsx
import React from 'react';
import { parseTimelineRange } from '../domain/timelineParser.js';

/**
 * Renders a single capacity bar
 */
export const CapacityBar = ({ capacity, weeks }) => {
  const { start, end } = parseTimelineRange(capacity.timeline, weeks);
  
  return (
    <div
      className="absolute top-1 rounded text-white text-sm font-medium flex items-center justify-start px-2 overflow-hidden cursor-help"
      title={`${capacity.name}: ${capacity.timeline}`}
      style={{
        left: `${start * 4}rem`,
        width: `${(end - start + 1) * 4}rem`,
        height: '2rem',
        backgroundColor: capacity.color,
        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
        zIndex: 20
      }}
    >
      <span className="whitespace-nowrap overflow-hidden text-ellipsis">
        {capacity.name}
      </span>
    </div>
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
        <div className="flex relative overflow-visible" style={{ minHeight: '3rem' }}>
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
