import {
  StreamHeader,
  StreamMilestonesRow,
  RisksRow
} from './StreamComponents.jsx';
import { processStreamDeadlines } from '../utils/streamUtils.js';
import { StreamItem } from './StreamItem.jsx';

/**
 * Container component for a single stream with all its components
 */
export const StreamContainer = ({ stream, weeks, currentWeekIndex, granularity = 'weekly' }) => {
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
        <StreamMilestonesRow
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
          granularity={granularity}
        />
      ))}
    </div>
  );
};
