import { parseTimelineRange, parseDeadlineDate } from '../domain/timelineParser.js';
import { useState } from 'react';

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
 * Modern tooltip component with controlled visibility
 */
export const ModernTooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-100 transition-opacity duration-300 ${
            position === 'top' ? 'bottom-full mb-2 left-1/2 transform -translate-x-1/2' : ''
          }`}
          style={{
            minWidth: '200px',
            maxWidth: '300px'
          }}
        >
          {content}
          <div className="tooltip-arrow absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

/**
 * Clean milestone icon with hover tooltip
 */
export const MilestoneIcon = ({ milestone }) => {
  const isHardDate = milestone.hardDate;
  const date = isHardDate ? milestone.hardDate : milestone.softDate;
  const colorClass = isHardDate ? 'text-red-500' : 'text-blue-500';
  const icon = isHardDate ? '🚩' : '🏁';
  const type = isHardDate ? 'Hard Milestone' : 'Soft Milestone';

  const formattedDate = new Date(date).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short'
  });

  const tooltipContent = (
    <div className="text-center">
      <div className="font-semibold">{type}: {formattedDate}</div>
      <div className="text-sm opacity-90">{milestone.name.replace('Milestone: ', '')}</div>
    </div>
  );

  return (
    <ModernTooltip content={tooltipContent}>
      <div
        data-testid="milestone-icon"
        className={`w-6 h-6 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200 ${colorClass}`}
      >
        <span className="text-lg">{icon}</span>
      </div>
    </ModernTooltip>
  );
};

/**
 * Clean risk icon with hover tooltip
 */
export const RiskIcon = ({ risk }) => {
  const riskColors = {
    high: 'text-red-500',
    medium: 'text-yellow-500',
    low: 'text-orange-500'
  };

  const riskIcons = {
    high: '⚠️',
    medium: '⚠️',
    low: 'ℹ️'
  };

  const colorClass = riskColors[risk.riskLevel] || riskColors.low;
  const icon = riskIcons[risk.riskLevel] || riskIcons.low;

  const tooltipContent = (
    <div className="text-center">
      <div className="font-semibold">{risk.riskLevel?.toUpperCase()} Risk</div>
      <div className="text-sm opacity-90">{risk.name.replace('Risk: ', '')}</div>
      <div className="text-xs opacity-75">{risk.timeline}</div>
    </div>
  );

  return (
    <ModernTooltip content={tooltipContent}>
      <div
        data-testid="risk-icon"
        className={`w-6 h-6 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200 ${colorClass}`}
      >
        <span className="text-lg">{icon}</span>
      </div>
    </ModernTooltip>
  );
};

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
 * Renders milestone annotation for a specific milestone
 */
export const MilestoneAnnotation = ({ milestone }) => {
  const isHardDate = milestone.hardDate;
  const bgColor = isHardDate ? 'bg-red-500 border-red-600' : 'bg-blue-500 border-blue-600';
  const tooltipPrefix = isHardDate ? 'Hard Milestone' : 'Soft Milestone';
  const date = isHardDate ? milestone.hardDate : milestone.softDate;

  return (
    <TooltipWrapper
      text={`${tooltipPrefix}: ${date} - ${milestone.name}`}
    >
      <div className={`${bgColor} text-white text-xs px-1 py-0.5 rounded shadow-sm border mb-0.5 max-w-14 text-center cursor-help`}>
        <div className="font-medium text-xs leading-tight">
          {new Date(date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
        </div>
        <div className="opacity-90 leading-tight truncate" style={{ fontSize: '10px' }}>
          {milestone.name.replace('Milestone: ', '')}
        </div>
      </div>
    </TooltipWrapper>
  );
};

/**
 * Renders the milestones row showing all project milestones
 */
export const MilestonesRow = ({ milestones, weeks, currentWeekIndex }) => {
  // Process milestones to map them to weeks
  const processedMilestones = milestones.map(milestone => {
    const date = milestone.hardDate || milestone.softDate;
    if (!date) return null;

    const weekIndex = parseDeadlineDate(date, weeks);
    if (weekIndex === null) return null;

    return {
      ...milestone,
      weekIndex,
      date,
      formattedDate: new Date(date).toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'short'
      })
    };
  }).filter(Boolean);

  return (
    <div className="flex border-b-2 border-gray-400 bg-purple-50">
      <div className="w-48 p-2 border-r border-gray-300 text-sm font-medium bg-purple-100 text-gray-700">
        Milestones
      </div>
      <div className="flex relative overflow-visible" style={{ minHeight: '2.5rem' }}>
        {weeks.map((week, weekIndex) => {
          const weekMilestones = processedMilestones.filter(m => m.weekIndex === weekIndex);

          // Use appropriate key based on object type
          // For daily view: week is a day object with .label property
          // For weekly view: week is a string
          const key = typeof week === 'object' && week.label ? week.label : week;

          return (
            <div key={key} className="relative w-16 border-r border-gray-200 bg-purple-50" style={{ minHeight: '2.5rem' }}>
              {weekIndex === currentWeekIndex && (
                <div className="absolute left-0 top-0 bottom-0 border-l-2 border-dotted border-green-500" />
              )}

              {weekMilestones.length > 0 && (
                <div className="absolute inset-0 flex flex-wrap items-center justify-center p-1 gap-1">
                  {weekMilestones.map((milestone, index) => (
                    <MilestoneIcon key={index} milestone={milestone} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Renders deadline annotations for a specific week
 */
export const DeadlineAnnotation = ({ deadlines, type }) => {
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
 * Renders the stream deadlines row for a stream
 */
export const StreamMilestonesRow = ({ weeks, currentWeekIndex, hardDeadlines, softDeadlines }) => (
  <div className="flex border-b border-gray-300 bg-yellow-50">
    <div className="w-48 p-2 border-r border-gray-300 text-sm font-medium bg-yellow-100 text-gray-700">
      Milestones
    </div>
    <div className="flex relative overflow-visible" style={{ minHeight: '2.5rem' }}>
      {weeks.map((week, weekIndex) => {
        const weekHardDeadlines = hardDeadlines.filter(d => d.weekIndex === weekIndex);
        const weekSoftDeadlines = softDeadlines.filter(d => d.weekIndex === weekIndex);
        const weekHasDeadlines = weekHardDeadlines.length > 0 || weekSoftDeadlines.length > 0;

        // Use appropriate key based on object type
        // For daily view: week is a day object with .label property
        // For weekly view: week is a string
        const key = typeof week === 'object' && week.label ? week.label : week;

        return (
          <div key={key} className="relative w-16 border-r border-gray-200 bg-yellow-50" style={{ minHeight: '2.5rem' }}>
            {weekIndex === currentWeekIndex && (
              <div className="absolute left-0 top-0 bottom-0 border-l-2 border-dotted border-green-500" />
            )}

            {weekHasDeadlines && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-0.5">
                <DeadlineAnnotation deadlines={weekHardDeadlines} type="hard" />
                <DeadlineAnnotation deadlines={weekSoftDeadlines} type="soft" />
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

        // Use appropriate key based on object type
        // For daily view: week is a day object with .label property
        // For weekly view: week is a string
        const key = typeof week === 'object' && week.label ? week.label : week;

        return (
          <div key={key} className="relative w-16 border-r border-gray-200 bg-red-50" style={{ minHeight: '2.5rem' }}>
            {weekIndex === currentWeekIndex && (
              <div className="absolute left-0 top-0 bottom-0 border-l-2 border-dotted border-green-500" />
            )}

            {weekRisks.length > 0 && (
              <div className="absolute inset-0 flex flex-wrap items-center justify-center p-1 gap-1">
                {weekRisks.map((risk, index) => (
                  <RiskIcon key={index} risk={risk} />
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
        className="absolute top-1 rounded text-white text-sm font-medium flex items-center justify-start px-2 overflow-hidden cursor-help"
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
