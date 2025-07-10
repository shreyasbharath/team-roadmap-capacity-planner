// src/components/StreamComponents.jsx
import React from 'react';
import { parseTimelineRange, parseDeadlineDate } from '../domain/timelineParser.js';

/**
 * Renders a tooltip wrapper for interactive elements
 */
export const TooltipWrapper = ({ children, text, className = "" }) => (
  <div className={`tooltip ${className}`}>
    {children}
    {text && <span className="tooltip-text">{text}</span>}
  </div>
);

/**
 * Renders the stream header with title
 */
export const StreamHeader = ({ streamName, itemCount, riskCount }) => (
  <div className="flex border-b-2 border-gray-400 bg-gray-100">
    <TooltipWrapper text={`${streamName} - ${itemCount} items, ${riskCount} risks`}>
      <div className="w-48 p-3 border-r border-gray-300 text-sm font-bold bg-gray-200 text-gray-800 cursor-help">
        {streamName}
      </div>
    </TooltipWrapper>
    <div className="flex-1 bg-gray-100 border-r border-gray-300" />
  </div>
);

/**
 * Renders milestone annotations for a specific week
 */
export const MilestoneAnnotation = ({ deadlines, type }) => {
  const bgColor = type === 'hard' ? 'bg-red-500 border-red-600' : 'bg-blue-500 border-blue-600';
  const tooltipPrefix = type === 'hard' ? 'Hard Deadline' : 'Soft Deadline';
  
  return deadlines.map((deadline, index) => (
    <TooltipWrapper 
      key={`${type}-${index}`}
      text={`${tooltipPrefix}: ${deadline.formattedDate} - ${deadline.item}`}
    >
      <div className={`${bgColor} text-white text-xs px-1 py-0.5 rounded shadow-sm border mb-0.5 max-w-14 text-center cursor-help`}>
        <div className="font-medium text-xs leading-tight">{deadline.formattedDate}</div>
        <div className="opacity-90 leading-tight truncate" style={{ fontSize: '10px' }}>
          {deadline.item}
        </div>
      </div>
    </TooltipWrapper>
  ));
};

/**
 * Renders the milestones row for a stream
 */
export const MilestonesRow = ({ weeks, currentWeekIndex, hardDeadlines, softDeadlines }) => (
  <div className="flex border-b border-gray-300 bg-yellow-50">
    <div className="w-48 p-2 border-r border-gray-300 text-sm font-medium bg-yellow-100 text-gray-700">
      Milestones
    </div>
    <div className="flex relative overflow-visible" style={{ minHeight: '2.5rem' }}>
      {weeks.map((week, weekIndex) => {
        const weekHardDeadlines = hardDeadlines.filter(d => d.weekIndex === weekIndex);
        const weekSoftDeadlines = softDeadlines.filter(d => d.weekIndex === weekIndex);
        const weekHasDeadlines = weekHardDeadlines.length > 0 || weekSoftDeadlines.length > 0;
        
        return (
          <div key={week} className="relative w-16 border-r border-gray-200 bg-yellow-50" style={{ minHeight: '2.5rem' }}>
            {weekIndex === currentWeekIndex && (
              <div className="absolute left-0 top-0 bottom-0 border-l-2 border-dotted border-green-500" />
            )}
            
            {weekHasDeadlines && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-0.5">
                <MilestoneAnnotation deadlines={weekHardDeadlines} type="hard" />
                <MilestoneAnnotation deadlines={weekSoftDeadlines} type="soft" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

/**
 * Renders risk annotation for a specific risk
 */
export const RiskAnnotation = ({ risk }) => {
  const riskColors = {
    high: 'bg-red-600 border-red-700',
    medium: 'bg-yellow-600 border-yellow-700',
    low: 'bg-orange-600 border-orange-700'
  };
  
  const riskEmojis = {
    high: '🔴',
    medium: '🟡', 
    low: '🟠'
  };
  
  return (
    <TooltipWrapper text={`${risk.riskLevel?.toUpperCase()} Risk: ${risk.name} (${risk.timeline})`}>
      <div className={`text-white text-xs px-1 py-0.5 rounded shadow-sm border mb-0.5 max-w-14 text-center cursor-help ${riskColors[risk.riskLevel] || riskColors.low}`}>
        <div className="text-xs font-medium leading-tight">
          {riskEmojis[risk.riskLevel] || riskEmojis.low}
        </div>
        <div className="opacity-90 leading-tight truncate" style={{ fontSize: '10px' }}>
          {risk.name.replace('Risk: ', '')}
        </div>
      </div>
    </TooltipWrapper>
  );
};

/**
 * Renders the risks row for a stream
 */
export const RisksRow = ({ weeks, currentWeekIndex, risks }) => (
  <div className="flex border-b border-gray-300 bg-red-50">
    <div className="w-48 p-2 border-r border-gray-300 text-sm font-medium bg-red-100 text-gray-700">
      Risks
    </div>
    <div className="flex relative overflow-visible" style={{ minHeight: '2.5rem' }}>
      {weeks.map((week, weekIndex) => {
        const weekRisks = risks.filter(risk => {
          const { start, end } = parseTimelineRange(risk.timeline, weeks);
          return weekIndex >= start && weekIndex <= end;
        });
        
        return (
          <div key={week} className="relative w-16 border-r border-gray-200 bg-red-50" style={{ minHeight: '2.5rem' }}>
            {weekIndex === currentWeekIndex && (
              <div className="absolute left-0 top-0 bottom-0 border-l-2 border-dotted border-green-500" />
            )}
            
            {weekRisks.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-0.5">
                {weekRisks.map((risk, index) => (
                  <RiskAnnotation key={index} risk={risk} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

/**
 * Renders a timeline bar for a stream item
 */
export const TimelineBar = ({ item, weeks }) => {
  const { start, end } = parseTimelineRange(item.timeline, weeks);
  const width = ((end - start + 1));
  const left = (start);
  
  return (
    <TooltipWrapper text={`${item.name}: ${item.timeline} | Team: ${item.team}`}>
      <div
        className="absolute top-1 rounded text-white text-sm font-medium flex items-center justify-start px-2 overflow-hidden z-10 cursor-help"
        data-testid="timeline-bar"
        style={{
          position: 'absolute',
          left: `${left * 4}rem`,
          width: `${width * 4}rem`,
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
    </TooltipWrapper>
  );
};

/**
 * Processes deadlines for a stream's items
 */
export const processStreamDeadlines = (items, weeks) => {
  const hardDeadlines = [];
  const softDeadlines = [];
  
  items.forEach(item => {
    if (item.hardDeadline) {
      const weekIndex = parseDeadlineDate(item.hardDeadline, weeks);
      if (weekIndex !== null) {
        hardDeadlines.push({
          weekIndex,
          date: item.hardDeadline,
          item: item.deadlineLabel || item.name,
          formattedDate: new Date(item.hardDeadline).toLocaleDateString('en-AU', { 
            day: 'numeric', 
            month: 'short' 
          })
        });
      }
    }
    
    if (item.softDeadline) {
      const weekIndex = parseDeadlineDate(item.softDeadline, weeks);
      if (weekIndex !== null) {
        softDeadlines.push({
          weekIndex,
          date: item.softDeadline,
          item: item.deadlineLabel || item.name,
          formattedDate: new Date(item.softDeadline).toLocaleDateString('en-AU', { 
            day: 'numeric', 
            month: 'short' 
          })
        });
      }
    }
  });
  
  return { hardDeadlines, softDeadlines };
};
