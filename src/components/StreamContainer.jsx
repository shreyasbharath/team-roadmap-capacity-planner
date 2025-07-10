// src/components/StreamContainer.jsx
import React from 'react';
import { 
  StreamHeader, 
  MilestonesRow, 
  RisksRow, 
  processStreamDeadlines 
} from './StreamComponents.jsx';
import { StreamItem } from './StreamItem.jsx';

/**
 * Container component for a single stream with all its components
 */
export const StreamContainer = ({ stream, weeks, currentWeekIndex }) => {
  const { hardDeadlines, softDeadlines } = processStreamDeadlines(stream.items, weeks);
  const hasDeadlines = hardDeadlines.length > 0 || softDeadlines.length > 0;
  const hasRisks = stream.risks && stream.risks.length > 0;

  return (
    <div className="mb-4 overflow-visible" data-testid="stream-container">
      <StreamHeader 
        streamName={stream.name}
        itemCount={stream.items.length}
        riskCount={stream.risks ? stream.risks.length : 0}
      />

      {hasDeadlines && (
        <MilestonesRow 
          weeks={weeks}
          currentWeekIndex={currentWeekIndex}
          hardDeadlines={hardDeadlines}
          softDeadlines={softDeadlines}
        />
      )}

      {hasRisks && (
        <RisksRow 
          weeks={weeks}
          currentWeekIndex={currentWeekIndex}
          risks={stream.risks}
        />
      )}
      
      {stream.items.map((item, itemIndex) => (
        <StreamItem
          key={itemIndex}
          item={item}
          weeks={weeks}
          currentWeekIndex={currentWeekIndex}
          hardDeadlines={hardDeadlines}
          softDeadlines={softDeadlines}
          risks={stream.risks}
        />
      ))}
    </div>
  );
};
