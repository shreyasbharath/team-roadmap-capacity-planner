# Team Roadmap Capacity Planner - Domain Logic

## Business Domain

### Purpose
Interactive roadmap and capacity planning tool for software development teams. A generic, open-source solution suitable for product teams across various industries including tech companies, agencies, and enterprise development teams.

### Core Concepts

**Roadmap**: Visual timeline showing project streams, team capacity, milestones, and risks across quarters/months/weeks

**Stream**: Logical grouping of related projects (e.g., "Mobile Platform", "Backend Services")

**Project**: Individual work item with timeline, team assignment, and properties

**Timeline Granularity**: Adaptive scaling between daily, weekly, and quarterly views

**Team Capacity**: Resource planning showing leave, holidays, and availability

## Domain Objects

### Roadmap Structure
```javascript
{
  streams: [
    {
      name: "Stream Name",
      items: [...projects],
      risks: [...riskItems]
    }
  ],
  teamCapacity: [...capacityItems],
  milestones: [...milestoneItems]
}
```

### Project Item
```javascript
{
  name: "Project Name",
  timeline: "Jul W1-Sep W2",          // Timeline range
  team: "Frontend Team",             // Team assignment
  color: "#4F46E5",                  // Visual color
  hardDeadline: "2025-08-15",        // Must-hit date
  softDeadline: "2025-08-20",        // Target date
  deadlineLabel: "App Release",      // Milestone context
  riskLevel: "high",                 // high|medium|low
  progress: 75                       // Completion percentage (future)
}
```

### Team Capacity Item
```javascript
{
  name: "Developer Leave",
  timeline: "Aug W2-Aug W3",
  color: "#FFA500"
}
```

## Core Business Logic

### src/domain/timelineParser.js

#### Key Functions

**`parseMarkdown(markdownText)`**
- Parses complete roadmap markdown into structured data
- Handles streams, team capacity, milestones, and risks
- Returns: `{ streams, teamCapacity, milestones }`

**`parseTimelineRange(timeline, weeks)`**
- Converts timeline strings ("Jul W1-Sep W2") to array indices  
- Returns: `{ start: number, end: number }`
- Handles single weeks and date ranges

**`parseDeadlineDate(dateStr, weeks)`**
- Converts deadline dates to week indices
- Supports ISO format (2025-10-15) and natural format (Oct 15)
- Maps dates to 4-week-per-month model
- Returns: `weekIndex | null`

**`generateWeeks(quarters)`**
- Creates week array from quarter configuration
- Format: ["Jul W1", "Jul W2", "Jul W3", "Jul W4", "Aug W1", ...]

**`getCurrentWeek(weeks, fallback)`**
- Determines current week based on today's date
- Maps calendar dates to 4-week-per-month model
- Provides fallback for out-of-range dates

#### Business Rules

**Week Mapping**: Dates falling in "Week 5" of a month are automatically mapped to "Week 4" to fit the 4-week-per-month model

**Timeline Parsing**: Supports both range format ("Jul W1-Aug W3") and single week format ("Aug W2")

**Color Defaults**: Items without explicit colors default to `#3B82F6` (blue)

### src/domain/adaptiveTimelineScaling.js

#### Key Functions

**`determineTimelineGranularity(markdownText)`**
- Analyzes timeline patterns to determine appropriate granularity
- Returns: `{ granularity: 'daily'|'weekly', config: object }`

**`parseSprintMarkdown(markdownText)`**
- Specialized parser for daily/sprint-level granularity
- Handles business day calculations
- Returns structured data optimized for daily view

**`analyzeTimelinePatterns(items)`**
- Examines timeline formats to suggest granularity
- Detects daily patterns, sprint patterns, weekly patterns

#### Business Rules

**Granularity Detection**: 
- Daily: Contains "Day X" patterns or very short timelines
- Weekly: Contains "W1-W2" patterns (default)
- Quarterly: Long-range planning (3+ months)

**Business Days Only**: Daily view excludes weekends for practical planning

## Data Format Specification

### Markdown Syntax
```markdown
# Roadmap Title

## Team Capacity
- **Person Name**: Timeline | color: #HexCode

## Streams

### Stream Name
- **Project Name**: Timeline | Team | Properties | color: #HexCode

## Milestones
- **Milestone Name**: Timeline | deadline-type: date | deadline-label: Label
```

### Supported Properties
- `color: #HexCode` - Visual styling
- `hard-deadline: YYYY-MM-DD` - Must-hit dates
- `soft-deadline: YYYY-MM-DD` - Target dates  
- `deadline-label: Text` - Milestone description
- `risk-level: high|medium|low` - Risk assessment
- `progress: N%` - Completion percentage (planned)

### Timeline Formats
- **Week Range**: "Jul W1-Sep W2"
- **Single Week**: "Aug W3"
- **Daily Range**: "Day 1-Day 5" (for daily granularity)
- **Custom**: Any format supported by parsing logic

## Domain-Specific Rules

### Example Usage Context
**Common Streams**: 
- Mobile Platform
- Backend Services  
- Frontend Development
- Infrastructure & DevOps
- Data & Analytics
- Quality Assurance

**Team Structure**: Flexible support for any team names and roles

**Planning Horizon**: Configurable quarters and timeline ranges

### Capacity Planning Rules
- Leave blocks shown as overlays on timeline
- Multiple capacity items can overlap
- Capacity affects project timeline visibility
- Color coding for different types (leave, training, holidays)

### Risk Management Rules
- High risk: Red indicators (#DC2626)
- Medium risk: Yellow indicators (#F59E0B)  
- Low risk: Green indicators (#10B981)
- Risks can be standalone or associated with projects

### Milestone Rules
- Hard deadlines: Must-hit dates with strong visual indicators
- Soft deadlines: Target dates with lighter indicators
- Deadline labels provide context ("App Release", "Beta Launch")
- Milestones can span multiple streams

## Validation Rules

### Timeline Validation
- Start week must come before or equal end week
- Week names must exist in weeks array
- Single week format is valid

### Date Validation  
- ISO dates must be valid (YYYY-MM-DD)
- Natural dates must be parseable
- Dates outside planning horizon return null

### Color Validation
- Hex colors must be valid format (#RRGGBB)
- Invalid colors fall back to default blue
- Color consistency maintained across related items

## Performance Considerations

### Parsing Optimization
- Markdown parsing is cached per component render
- Large roadmaps (100+ items) parsed efficiently
- Timeline range calculations are O(1) operations

### Memory Management
- Structured data is immutable
- No circular references in parsed objects
- Efficient array operations for timeline calculations

## Error Handling

### Graceful Degradation
- Invalid timeline formats default to week 0
- Missing properties use sensible defaults
- Parse errors don't break entire roadmap

### Error Reporting
- Validation errors logged to console (development)
- Invalid items excluded from final output
- User-friendly error messages for common mistakes

## Extension Points

### Adding New Properties
1. Extend `parseMarkdownItem()` to recognize new syntax
2. Add property to domain object structure
3. Update validation rules
4. Add tests for new property

### Custom Timeline Formats
1. Extend `parseTimelineRange()` with new pattern
2. Add business rules for new format
3. Update granularity detection logic
4. Test across different scales

### New Granularities
1. Add granularity detection in `analyzeTimelinePatterns()`
2. Create specialized parser (like `parseSprintMarkdown()`)
3. Define business rules for new scale
4. Update component rendering logic