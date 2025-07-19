import { parseDeadlineDate } from '../domain/timelineParser.js';

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