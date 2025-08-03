# Team Roadmap Capacity Planner - Coding Standards

## Overview

This document outlines the coding standards for the Team Roadmap Capacity Planner project. These standards ensure code maintainability, readability, and consistency across the codebase.

## Clean Code Principles

### 1. No Magic Numbers

**❌ Bad:**
```javascript
if (daySpan <= 21) { // What is 21? Why 21?
  return 'daily';
} else if (daySpan <= 84) { // What is 84?
  return 'weekly';
}
```

**✅ Good:**
```javascript
const DAILY_VIEW_MAX_DAYS = 30;      // Up to 4+ weeks - use daily view
const WEEKLY_VIEW_MAX_DAYS = 84;     // Up to 12 weeks - use weekly view

if (daySpan <= DAILY_VIEW_MAX_DAYS) {
  return 'daily';
} else if (daySpan <= WEEKLY_VIEW_MAX_DAYS) {
  return 'weekly';
}
```

**Why:** Named constants are self-documenting and easier to maintain. If we need to change the threshold, we change it in one place.

### 2. Meaningful Names

**❌ Bad:**
```javascript
const d = new Date();
const msPerDay = 1000 * 60 * 60 * 24;
const daySpan = Math.ceil((endDate - startDate) / msPerDay);
```

**✅ Good:**
```javascript
const currentDate = new Date();
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
const daySpan = Math.ceil((endDate - startDate) / MILLISECONDS_PER_DAY);
```

### 3. Single Responsibility Functions

**❌ Bad:**
```javascript
function parseAndValidateAndConvert(input) {
  // Parse markdown
  // Validate dates
  // Convert to timeline indices
  // Format output
  // 100+ lines of mixed concerns
}
```

**✅ Good:**
```javascript
function parseMarkdownItem(line) {
  // Single responsibility: parse one line
}

function validateDateRange(startDate, endDate) {
  // Single responsibility: validate dates
}

function convertToTimelineIndices(timeline, config) {
  // Single responsibility: convert to indices
}
```

### 4. Pure Functions Where Possible

**❌ Bad:**
```javascript
let globalConfig = {};

function determineGranularity(markdown) {
  globalConfig.lastMarkdown = markdown; // Side effect
  return calculateGranularity(markdown);
}
```

**✅ Good:**
```javascript
function determineGranularity(markdown) {
  // No side effects, same input = same output
  return calculateGranularity(markdown);
}
```

## Specific Standards

### Constants and Configuration

- **All magic numbers must be named constants**
- Place constants at the top of the file with clear comments
- Group related constants together
- Use SCREAMING_SNAKE_CASE for constants

```javascript
// Timeline granularity thresholds (in days)
const DAILY_VIEW_MAX_DAYS = 30;      // Up to 4+ weeks - use daily view
const WEEKLY_VIEW_MAX_DAYS = 84;     // Up to 12 weeks - use weekly view

// Date/time calculation constants
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
const DAYS_PER_WEEK = 7;

// Validation ranges
const DAY_RANGE = { MIN: 1, MAX: 31 };
const WEEKDAY_RANGE = { MIN: 1, MAX: 5 }; // Monday = 1, Friday = 5
```

### Function Structure

- **One abstraction level per function**
- **Early returns for guard clauses**
- **Descriptive parameter names**

```javascript
function convertTimelineToDaily(timeline, timelineConfig) {
  // Guard clauses with early returns
  if (!timeline || !timelineConfig.config.days) {
    return null;
  }

  const range = parseTimelineFromMarkdown(`- **temp**: ${timeline}`);
  if (!range) {
    return null;
  }

  // Main logic at same abstraction level
  const { startDate, endDate } = range;
  return findDayIndices(startDate, endDate, timelineConfig.config.days);
}
```

### Error Handling

- **Explicit error handling, no silent failures**
- **Meaningful error messages**
- **Fail fast with guard clauses**

```javascript
function parseFlexibleDate(dateStr) {
  if (!dateStr) {
    return null; // Explicit null for missing input
  }

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date format: ${dateStr}`);
      return null;
    }
    return date;
  } catch (error) {
    console.warn(`Failed to parse date: ${dateStr}`, error);
    return null;
  }
}
```

### Testing Standards

- **Test behavior, not implementation**
- **Descriptive test names that explain the scenario**
- **Arrange-Act-Assert pattern**

```javascript
describe('Timeline Granularity Detection', () => {
  it('should use daily view for roadmaps spanning 22 days with mixed date formats', () => {
    // Arrange
    const markdown = `
      ### Sprint Tasks
      - **Task 1**: 2025-08-04 to 2025-08-06 | Team | color: #4F46E5
      - **Task 2**: 2025-08-22 to 2025-08-26 | Team | color: #10B981
    `;

    // Act
    const result = determineTimelineGranularity(markdown);

    // Assert
    expect(result.granularity).toBe('daily');
    expect(result.span).toBe(22);
    expect(result.config.type).toBe('daily');
  });
});
```

### Documentation Standards

- **Comments explain WHY, not WHAT**
- **JSDoc for public functions**
- **Examples in complex functions**

```javascript
/**
 * Determines the optimal timeline granularity based on date ranges found in markdown.
 * 
 * Uses business rules:
 * - ≤30 days: Daily view for sprint/short-term planning
 * - 31-84 days: Weekly view for project planning  
 * - >84 days: Quarterly view for long-term roadmaps
 * 
 * @param {string} markdownText - The roadmap markdown content
 * @returns {Object} Granularity result with config and span
 * 
 * @example
 * const result = determineTimelineGranularity('# Sprint\n- **Task**: Aug 4-6');
 * // Returns: { granularity: 'daily', config: {...}, span: 2 }
 */
function determineTimelineGranularity(markdownText) {
  // Implementation focuses on business logic, not technical details
}
```

## Code Review Checklist

### Before Committing

- [ ] No magic numbers - all constants are named
- [ ] Function names describe what they do
- [ ] No functions longer than 30 lines
- [ ] No more than 3 levels of nesting
- [ ] All edge cases have tests
- [ ] Error handling is explicit
- [ ] Comments explain business logic, not syntax

### Code Review Focus Areas

1. **Readability**: Can a new developer understand this in 2 minutes?
2. **Maintainability**: Is it easy to change requirements?
3. **Testability**: Can each function be tested in isolation?
4. **Performance**: Are there obvious bottlenecks?
5. **Standards Compliance**: Does it follow these guidelines?

## File Organization

```
src/
├── domain/              # Business logic (pure functions)
│   ├── constants.js     # Shared constants
│   ├── timelineParser.js
│   └── adaptiveTimelineScaling.js
├── components/          # React components
├── hooks/              # Custom React hooks
└── utils/              # Generic utilities
```

## Naming Conventions

- **Files**: camelCase.js (timelineParser.js)
- **Components**: PascalCase.jsx (RoadmapPlanner.jsx)
- **Functions**: camelCase (determineGranularity)
- **Constants**: SCREAMING_SNAKE_CASE (DAILY_VIEW_MAX_DAYS)
- **Variables**: camelCase (currentDate, daySpan)

## Performance Guidelines

- **Avoid premature optimization**
- **Profile before optimizing**
- **Cache expensive calculations**
- **Use appropriate data structures**

```javascript
// Good: Cache expensive parsing results
const memoizedParser = useMemo(() => 
  parseSprintMarkdown(markdownData), 
  [markdownData]
);
```

## Accessibility

- **All interactive elements must have proper ARIA labels**
- **Keyboard navigation support**
- **Semantic HTML structure**
- **Color contrast compliance**

---

*These standards are living guidelines. Update them as the project evolves and new patterns emerge.*
