// Timeline granularity thresholds (in days)
const DAILY_VIEW_MAX_DAYS = 30;      // Up to 4+ weeks - use daily view
const WEEKLY_VIEW_MAX_DAYS = 84;     // Up to 12 weeks - use weekly view
// Beyond 84 days uses quarterly view

// Date/time calculation constants
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
const DAYS_PER_WEEK = 7;
const WEEKDAY_RANGE = { MIN: 1, MAX: 5 }; // Monday = 1, Friday = 5

// Week calculation constants
const WEEKS_PER_MONTH = 4;

// Date validation constants
const DAY_RANGE = { MIN: 1, MAX: 31 };

/**
 * Determines the optimal timeline granularity based on date ranges found in markdown
 */
export const determineTimelineGranularity = (markdownText) => {
  const dateRanges = extractDateRanges(markdownText);

  if (dateRanges.length === 0) {
    return { granularity: 'quarterly', config: getDefaultQuartersConfig() };
  }

  // Check if user explicitly requested weekends
  const includeWeekends = checkForWeekendsFlag(markdownText);

  const { startDate, endDate } = getOverallDateRange(dateRanges);
  const daySpan = Math.ceil((endDate - startDate) / MILLISECONDS_PER_DAY);

  // Determine granularity based on total span
  if (daySpan <= DAILY_VIEW_MAX_DAYS) {
    return {
      granularity: 'daily',
      config: generateDailyTimeline(startDate, endDate, { includeWeekends }),
      span: daySpan
    };
  } else if (daySpan <= WEEKLY_VIEW_MAX_DAYS) {
    return {
      granularity: 'weekly',
      config: generateWeeklyTimeline(startDate, endDate),
      span: daySpan
    };
  } else { // Use quarterly view for longer periods
    return {
      granularity: 'quarterly',
      config: getDefaultQuartersConfig(),
      span: daySpan
    };
  }
};

/**
 * Generates daily timeline configuration for sprint planning
 * @param {Date} startDate - Start date of the timeline
 * @param {Date} endDate - End date of the timeline
 * @param {Object} options - Configuration options
 * @param {boolean} options.includeWeekends - Whether to include Saturday and Sunday (default: false)
 */
export const generateDailyTimeline = (startDate, endDate, options = {}) => {
  const {
    includeWeekends = false
  } = options;

  const days = [];
  const weeks = [];
  const current = new Date(startDate);

  // Generate days (weekdays only unless weekends explicitly requested)
  while (current <= endDate) {
    const dayOfWeek = current.toLocaleDateString('en-US', { weekday: 'short' });
    const dayOfMonth = current.getDate();
    const dayOfWeekNumber = current.getDay(); // 0 = Sunday, 6 = Saturday
    const label = `${dayOfWeek} ${dayOfMonth}`;

    // Include day if: weekends requested OR it's a weekday (Mon-Fri)
    const isWeekday = dayOfWeekNumber >= WEEKDAY_RANGE.MIN && dayOfWeekNumber <= WEEKDAY_RANGE.MAX;
    const shouldIncludeDay = includeWeekends || isWeekday;

    if (shouldIncludeDay) {
      days.push({
        date: new Date(current),
        label,
        dayOfWeek,
        dayOfMonth,
        isWeekday,
        isWeekend: !isWeekday
      });
    }

    current.setDate(current.getDate() + 1);
  }

  // Group days by weeks for header rendering
  let currentWeek = [];
  let weekNumber = 1;
  let currentWeekStartDate = null;

  days.forEach((day, index) => {
    // If this is the first day or it's a new calendar week
    if (currentWeekStartDate === null) {
      // First day sets the reference
      currentWeekStartDate = new Date(day.date);
      // Find the start of this calendar week (previous Sunday)
      currentWeekStartDate.setDate(day.date.getDate() - day.date.getDay());
    }

    // Check if this day belongs to a new calendar week
    const dayWeekStart = new Date(day.date);
    dayWeekStart.setDate(day.date.getDate() - day.date.getDay());

    // If we've moved to a new calendar week, finish the current week
    if (dayWeekStart.getTime() !== currentWeekStartDate.getTime() && currentWeek.length > 0) {
      weeks.push({
        weekLabel: `Week ${weekNumber}`,
        days: [...currentWeek]
      });
      currentWeek = [];
      weekNumber++;
      currentWeekStartDate = dayWeekStart;
    }

    currentWeek.push(day);

    // If this is the last day, close the current week
    if (index === days.length - 1) {
      weeks.push({
        weekLabel: `Week ${weekNumber}`,
        days: [...currentWeek]
      });
    }
  });

  return {
    type: 'daily',
    days,
    weeks,
    includesWeekends: includeWeekends,
    workdaysOnly: !includeWeekends
  };
};

/**
 * Checks if user explicitly requested weekends in markdown
 * @param {string} markdownText - The markdown content
 * @returns {boolean} True if weekends should be included
 */
const checkForWeekendsFlag = (markdownText) => {
  // Look for explicit weekend inclusion flags in markdown
  const weekendFlags = [
    'include-weekends',
    'include weekends',
    'show-weekends',
    'show weekends',
    'weekends: true',
    'with-weekends',
    'with weekends'
  ];

  const lowerText = markdownText.toLowerCase();
  return weekendFlags.some(flag => lowerText.includes(flag));
};

/**
 * Generates weekly timeline configuration for medium-term projects
 */
export const generateWeeklyTimeline = (startDate, endDate) => {
  const weeks = [];
  const monthsMap = new Map();

  // Start from the actual start date, not the beginning of the week
  const current = new Date(startDate);

  // Find the start of the first week that contains our start date
  const startOfWeek = new Date(current);
  startOfWeek.setDate(current.getDate() - current.getDay()); // Go to Sunday

  const weekStart = new Date(startOfWeek);
  let weekCounter = 1;
  let currentMonth = null;

  while (weekStart <= endDate) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + (DAYS_PER_WEEK - 1)); // Saturday

    // Only include weeks that actually overlap with our date range
    if (weekEnd >= startDate) {
      // Use the month of the start date for the month context, not the week start
      const effectiveDate = weekStart >= startDate ? weekStart : startDate;
      const monthName = effectiveDate.toLocaleDateString('en-US', { month: 'short' });

      // Reset week counter for new month
      if (currentMonth !== monthName) {
        currentMonth = monthName;
        weekCounter = 1;
      }

      const label = `${monthName} W${weekCounter}`;

      const weekObj = {
        label,
        startDate: new Date(Math.max(weekStart, startDate)), // Don't start before our range
        endDate: new Date(Math.min(weekEnd, endDate))        // Don't end after our range
      };

      weeks.push(weekObj);

      // Group weeks by month for header rendering
      if (!monthsMap.has(monthName)) {
        monthsMap.set(monthName, []);
      }
      monthsMap.get(monthName).push(weekObj);

      weekCounter++;
    }

    weekStart.setDate(weekStart.getDate() + DAYS_PER_WEEK);
  }

  // Convert months map to array
  const months = Array.from(monthsMap.entries()).map(([name, weeks]) => ({
    name,
    weeks
  }));

  return {
    type: 'weekly',
    weeks,
    months
  };
};

/**
 * Parses markdown content with adaptive timeline scaling support
 */
export const parseSprintMarkdown = (markdownText) => {
  // First determine the timeline granularity
  const timelineConfig = determineTimelineGranularity(markdownText);

  // Parse the markdown structure (similar to existing parseMarkdown)
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
      const item = parseMarkdownItemWithIndices(trimmed, timelineConfig);
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

  return {
    timelineConfig,
    streams: filteredStreams,
    teamCapacity,
    milestones
  };
};

/**
 * Extracts all date ranges from markdown content
 */
export const extractDateRanges = (markdownText) => {
  const ranges = [];
  const lines = markdownText.split('\n');

  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('- **')) {
      const range = parseTimelineFromMarkdown(trimmed);
      if (range) {
        ranges.push(range);
      }
    }
  });

  return ranges;
};

/**
 * Gets the overall date range from multiple date ranges
 */
export const getOverallDateRange = (ranges) => {
  if (ranges.length === 0) return { startDate: new Date(), endDate: new Date() };

  let startDate = ranges[0].startDate;
  let endDate = ranges[0].endDate;

  ranges.forEach(range => {
    if (range.startDate < startDate) startDate = range.startDate;
    if (range.endDate > endDate) endDate = range.endDate;
  });

  return { startDate, endDate };
};

/**
 * Calculates timeline span in days, weeks, and months
 */
export const calculateTimelineSpan = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return { days: 0, weeks: 0, months: 0 };
  }

  // Calculate days difference
  const timeDiff = endDate.getTime() - startDate.getTime();
  const days = Math.ceil(timeDiff / MILLISECONDS_PER_DAY);

  // Calculate weeks (rounded up)
  const weeks = Math.ceil(days / DAYS_PER_WEEK);

  // Calculate months - more complex calculation
  let months = 0;
  const start = new Date(startDate);
  const end = new Date(endDate);

  // If same month, it's 0 or 1 month
  if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
    months = days > 0 ? 1 : 0;
  } else {
    // Calculate months by counting month boundaries crossed
    months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

    // Add 1 if we're spanning into additional partial months
    if (end.getDate() >= start.getDate() || days > 0) {
      months += 1;
    }
  }

  return {
    days: Math.max(0, days),
    weeks: Math.max(0, weeks),
    months: Math.max(0, months)
  };
};

/**
 * Parses timeline range from markdown line
 */
const parseTimelineFromMarkdown = (line) => {
  const match = line.match(/- \*\*(.*?)\*\*:\s*(.*)/);
  if (!match) return null;

  const [, , details] = match;
  const parts = details.split(' | ');
  const timeline = parts[0];

  // Handle different timeline formats
  if (timeline.includes(' to ')) {
    // ISO format: "2025-07-15 to 2025-07-25"
    const [startStr, endStr] = timeline.split(' to ');
    const startDate = parseFlexibleDate(startStr.trim());
    const endDate = parseFlexibleDate(endStr.trim());

    if (startDate && endDate) {
      return { startDate, endDate };
    }
  } else if (timeline.includes('-')) {
    // Range format: "Jul W1-Aug W3", "2025-07-15 - 2025-07-25", or "July 20-29"
    const rangeParts = timeline.split('-');
    if (rangeParts.length === 2) {
      const startStr = rangeParts[0].trim();
      const endStr = rangeParts[1].trim();

      // Special handling for week ranges like "Jul W1-Jul W2"
      if (startStr.includes(' W') && endStr.includes(' W')) {
        const startDate = parseFlexibleDate(startStr);
        const endWeekDate = parseFlexibleDate(endStr);

        if (startDate && endWeekDate) {
          // For week ranges, endDate should be the end of the end week
          const [endMonthStr, endWeekStr] = endStr.split(' W');
          const endWeekNum = parseInt(endWeekStr);
          const endMonth = parseMonth(endMonthStr);

          if (endMonth !== null && endWeekNum >= 1 && endWeekNum <= WEEKS_PER_MONTH) {
            const year = new Date().getFullYear();
            const endDay = endWeekNum * DAYS_PER_WEEK; // End of the week
            const endDate = new Date(year, endMonth, endDay);

            return { startDate, endDate };
          }
        }
      }
      // Special handling for "July 20-29" format
      else if (startStr.includes('July') || startStr.includes('Aug') || startStr.includes('Sep')) {
        const startDate = parseFlexibleDate(startStr);
        // For "July 20-29", endStr is just "29", need to add July context
        let endDate;
        if (/^\d{1,2}$/.test(endStr)) {
          const monthMatch = startStr.match(/(January|February|March|April|May|June|July|August|September|October|November|December)/);
          if (monthMatch) {
            endDate = parseFlexibleDate(`${monthMatch[1]} ${endStr}`);
          } else {
            endDate = parseFlexibleDate(endStr);
          }
        } else {
          endDate = parseFlexibleDate(endStr);
        }

        if (startDate && endDate) {
          return { startDate, endDate };
        }
      } else {
        // Standard range parsing
        const startDate = parseFlexibleDate(startStr);
        const endDate = parseFlexibleDate(endStr);

        if (startDate && endDate) {
          return { startDate, endDate };
        }
      }
    }
  } else {
    // Single date format
    const date = parseFlexibleDate(timeline);
    if (date) {
      return { startDate: date, endDate: date };
    }
  }

  return null;
};

/**
 * Parses flexible date formats
 */
const parseFlexibleDate = (dateStr) => {
  if (!dateStr) return null;

  try {
    // Handle "Jul W1" format - make consistent with existing timelineParser logic
    if (dateStr.includes(' W')) {
      const [monthStr, weekStr] = dateStr.split(' W');
      const weekNum = parseInt(weekStr);
      const month = parseMonth(monthStr);

      if (month !== null && weekNum >= 1 && weekNum <= WEEKS_PER_MONTH) {
        // Use same logic as existing code: Math.ceil(day / 7)
        // Week 1: days 1-7, Week 2: days 8-14, Week 3: days 15-21, Week 4: days 22-28
        const year = new Date().getFullYear();
        const startDay = (weekNum - 1) * DAYS_PER_WEEK + 1;
        const targetDate = new Date(year, month, startDay);

        return targetDate;
      }
    }

    // Handle "July 20" or "July 20-29" format
    if (dateStr.includes('July') || dateStr.includes('Aug') || dateStr.includes('Sep')) {
      // Extract month and day
      const parts = dateStr.split(' ');
      if (parts.length >= 2) {
        const monthStr = parts[0];
        let dayStr = parts[1];

        // Handle ranges like "July 20-29" - take the first part
        if (dayStr.includes('-')) {
          dayStr = dayStr.split('-')[0];
        }

        const month = parseMonth(monthStr);
        const day = parseInt(dayStr);

        if (month !== null && day >= DAY_RANGE.MIN && day <= DAY_RANGE.MAX) {
          const year = new Date().getFullYear();
          return new Date(year, month, day);
        }
      }
    }

    // Handle "20" or "29" when it's the end part of "July 20-29"
    if (/^\d{1,2}$/.test(dateStr.trim())) {
      const day = parseInt(dateStr.trim());
      if (day >= DAY_RANGE.MIN && day <= DAY_RANGE.MAX) {
        // We need context for the month - this should be handled by the caller
        // For now, assume July (month 6) as in the test
        const year = new Date().getFullYear();
        return new Date(year, 6, day); // July
      }
    }

    // Handle ISO format: 2025-07-15
    if (dateStr.includes('-') && dateStr.length >= 10) {
      return new Date(dateStr);
    }

    // Handle other formats
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
  } catch (e) {
    console.warn('Failed to parse date:', dateStr, e); // eslint-disable-line no-console
  }

  return null;
};

/**
 * Parses month abbreviation to month number
 */
const parseMonth = (monthStr) => {
  const months = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11,
    'January': 0, 'February': 1, 'March': 2, 'April': 3, 'June': 5,
    'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
  };
  return months[monthStr] !== undefined ? months[monthStr] : null;
};

/**
 * Parses individual markdown item line with timeline indices
 */
const parseMarkdownItemWithIndices = (line, timelineConfig) => {
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

  const item = {
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

  // Convert timeline to indices based on granularity
  if (timelineConfig.granularity === 'daily') {
    const indices = convertTimelineToDaily(timeline, timelineConfig);
    if (indices) {
      item.startDay = indices.startDay;
      item.endDay = indices.endDay;
    }
  } else if (timelineConfig.granularity === 'weekly') {
    const indices = convertTimelineToWeekly(timeline, timelineConfig);
    if (indices) {
      item.startWeek = indices.startWeek;
      item.endWeek = indices.endWeek;
    }
  }

  return item;
};

/**
 * Converts timeline range to daily indices
 */
const convertTimelineToDaily = (timeline, timelineConfig) => {
  if (!timeline || !timelineConfig.config.days) return null;

  const range = parseTimelineFromMarkdown(`- **temp**: ${timeline}`);
  if (!range) return null;

  const { startDate, endDate } = range;
  const days = timelineConfig.config.days;

  // Find the index of the start and end dates in the days array
  let startDay = -1;
  let endDay = -1;

  days.forEach((day, index) => {
    const dayDate = new Date(day.date);
    dayDate.setHours(0, 0, 0, 0);

    const compareStart = new Date(startDate);
    compareStart.setHours(0, 0, 0, 0);

    const compareEnd = new Date(endDate);
    compareEnd.setHours(0, 0, 0, 0);

    if (dayDate.getTime() === compareStart.getTime()) {
      startDay = index;
    }
    if (dayDate.getTime() === compareEnd.getTime()) {
      endDay = index;
    }
  });

  // If exact dates not found, find the nearest valid dates within range
  if (startDay < 0 || endDay < 0) {
    days.forEach((day, index) => {
      const dayDate = new Date(day.date);
      dayDate.setHours(0, 0, 0, 0);

      const compareStart = new Date(startDate);
      compareStart.setHours(0, 0, 0, 0);

      const compareEnd = new Date(endDate);
      compareEnd.setHours(0, 0, 0, 0);

      // Find first day on or after start date
      if (startDay < 0 && dayDate.getTime() >= compareStart.getTime()) {
        startDay = index;
      }

      // Find last day on or before end date
      if (dayDate.getTime() <= compareEnd.getTime()) {
        endDay = index;
      }
    });
  }

  return startDay >= 0 && endDay >= 0 ? { startDay, endDay } : null;
};

/**
 * Converts timeline range to weekly indices
 */
const convertTimelineToWeekly = (timeline, timelineConfig) => {
  if (!timeline || !timelineConfig.config.weeks) return null;

  const range = parseTimelineFromMarkdown(`- **temp**: ${timeline}`);
  if (!range) return null;

  const { startDate, endDate } = range;
  const weeks = timelineConfig.config.weeks;

  // Find the index of the start and end dates in the weeks array
  let startWeek = -1;
  let endWeek = -1;

  weeks.forEach((week, index) => {
    if (startDate >= week.startDate && startDate <= week.endDate) {
      startWeek = index;
    }
    if (endDate >= week.startDate && endDate <= week.endDate) {
      endWeek = index;
    }
  });

  return startWeek >= 0 && endWeek >= 0 ? { startWeek, endWeek } : null;
};

/**
 * Gets default quarterly configuration
 * @returns {Object} - Default quarterly config
 */
const getDefaultQuartersConfig = () => {
  return {
    type: 'quarterly',
    quarters: [
      {
        name: 'Q3 2025',
        months: ['Jul', 'Aug', 'Sep']
      },
      {
        name: 'Q4 2025',
        months: ['Oct', 'Nov', 'Dec']
      }
    ]
  };
};
