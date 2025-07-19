// src/domain/timelineParser.js

/**
 * Generates week labels for the given quarters
 */
export const generateWeeks = (quarters) => {
  const weeks = [];
  quarters.forEach(quarter => {
    quarter.months.forEach(month => {
      for (let week = 1; week <= 4; week++) {
        weeks.push(`${month} W${week}`);
      }
    });
  });
  return weeks;
};

/**
 * Calculates the current week based on today's date
 *
 * Dates that would fall in "Week 5" of a month are automatically
 * mapped to "Week 4" to fit our 4-week-per-month model.
 */
export const getCurrentWeek = (weeks, fallback = 'Aug W2') => {
  const now = new Date();
  const month = now.getMonth();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthName = monthNames[month];
  const day = now.getDate();
  const weekOfMonth = Math.min(Math.ceil(day / 7), 4); // Cap at week 4
  const currentWeek = `${currentMonthName} W${weekOfMonth}`;

  return weeks.includes(currentWeek) ? currentWeek : fallback;
};

/**
 * Parses timeline range (e.g., "Jul W1-Sep W2") to week indices
 */
export const parseTimelineRange = (timeline, weeks) => {
  if (!timeline) return { start: 0, end: 0 };

  const parts = timeline.split('-');
  if (parts.length !== 2) return { start: 0, end: 0 };

  const startIndex = weeks.indexOf(parts[0].trim());
  const endIndex = weeks.indexOf(parts[1].trim());

  return {
    start: startIndex >= 0 ? startIndex : 0,
    end: endIndex >= 0 ? endIndex : 0
  };
};

/**
 * Parses deadline date string to week index
 *
 * Dates that would fall in "Week 5" of a month are automatically
 * mapped to "Week 4" to fit our 4-week-per-month model.
 */
export const parseDeadlineDate = (dateStr, weeks) => {
  if (!dateStr) return null;

  try {
    let date;

    if (dateStr.includes('-')) {
      // ISO format: 2025-10-15
      date = new Date(dateStr);
    } else if (dateStr.includes(' ')) {
      // Format like "Oct 15" or "15 Oct 2025"
      const parts = dateStr.split(' ');
      if (parts.length === 2) {
        const [monthStr, dayStr] = parts;
        if (isNaN(monthStr)) {
          // "Oct 15" format
          date = new Date(`${monthStr} ${dayStr}, 2025`);
        } else {
          // "15 Oct 2025" format
          date = new Date(`${parts[1]} ${parts[0]}, ${parts[2] || '2025'}`);
        }
      }
    } else {
      date = new Date(dateStr);
    }

    if (isNaN(date.getTime())) {
      return null;
    }

    // Map date to week
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const weekOfMonth = Math.min(Math.ceil(day / 7), 4); // Cap at week 4
    const weekStr = `${month} W${weekOfMonth}`;

    const weekIndex = weeks.indexOf(weekStr);
    return weekIndex >= 0 ? weekIndex : null;
  } catch {
    return null;
  }
};

/**
 * Parses markdown content into structured roadmap data
 */
export const parseMarkdown = (markdownText) => {
  const lines = markdownText.split('\n');
  const streams = [];
  const teamCapacity = [];
  const milestones = [];
  let currentStream = null;
  let inTeamCapacitySection = false;
  let inMilestonesSection = false;

  lines.forEach(line => {
    const trimmed = line.trim();

    if (trimmed.startsWith('## Team Capacity')) {
      inTeamCapacitySection = true;
      inMilestonesSection = false;
      return;
    }

    if (trimmed.startsWith('## Streams')) {
      inTeamCapacitySection = false;
      inMilestonesSection = false;
      return;
    }

    if (trimmed.startsWith('## Milestones')) {
      inTeamCapacitySection = false;
      inMilestonesSection = true;
      return;
    }

    if (trimmed.startsWith('### ')) {
      if (currentStream) streams.push(currentStream);
      currentStream = {
        name: trimmed.slice(4),
        items: [],
        risks: []
      };
      inTeamCapacitySection = false;
      inMilestonesSection = false;
    } else if (trimmed.startsWith('- **')) {
      const item = parseMarkdownItem(trimmed);
      if (!item) return;

      if (inTeamCapacitySection) {
        teamCapacity.push(item);
      } else if (inMilestonesSection) {
        milestones.push(item);
      } else if (currentStream) {
        if (item.riskLevel) {
          currentStream.risks.push(item);
        } else {
          currentStream.items.push(item);
        }
      }
    }
  });

  if (currentStream) streams.push(currentStream);

  // Filter out streams with no items and no risks
  const filteredStreams = streams.filter(stream =>
    stream.items.length > 0 || (stream.risks && stream.risks.length > 0)
  );

  return { streams: filteredStreams, teamCapacity, milestones };
};

/**
 * Parses individual markdown item line
 */
const parseMarkdownItem = (line) => {
  const match = line.match(/- \*\*(.*?)\*\*:\s*(.*)/);
  if (!match) return null;

  const [, name, details] = match;
  const parts = details.split(' | ');
  const timeline = parts[0];
  const team = parts[1] || '';

  let color = '#3B82F6';
  let hardDeadline = null;
  let softDeadline = null;
  let deadlineLabel = null;
  let riskLevel = null;
  let hardDate = null;
  let softDate = null;

  // Parse additional properties
  parts.forEach(part => {
    if (part.includes('color:')) {
      color = part.split('color:')[1].trim();
    }
    if (part.includes('hard-deadline:')) {
      hardDeadline = part.split('hard-deadline:')[1].trim();
    }
    if (part.includes('soft-deadline:')) {
      softDeadline = part.split('soft-deadline:')[1].trim();
    }
    if (part.includes('deadline-label:')) {
      deadlineLabel = part.split('deadline-label:')[1].trim();
    }
    if (part.includes('risk-level:')) {
      riskLevel = part.split('risk-level:')[1].trim();
    }
    if (part.includes('hard-date:')) {
      hardDate = part.split('hard-date:')[1].trim();
    }
    if (part.includes('soft-date:')) {
      softDate = part.split('soft-date:')[1].trim();
    }
  });

  return {
    name,
    timeline,
    team,
    color,
    hardDeadline,
    softDeadline,
    deadlineLabel,
    riskLevel,
    hardDate,
    softDate
  };
};
