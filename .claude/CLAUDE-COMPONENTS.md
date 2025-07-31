# Team Roadmap Capacity Planner - Component Architecture

## Component Hierarchy

```
RoadmapPlanner (Main Orchestrator)
├── TimelineHeader (Date Navigation)
│   ├── MonthHeaders
│   ├── WeekHeaders  
│   └── DayHeaders (for daily granularity)
├── TeamCapacityRow (Resource Planning)
├── MilestonesRow (Project Milestones)
├── StreamContainer (Project Streams)
│   ├── StreamItem (Individual Stream)
│   │   ├── TimelineBar (Visual Project Bar)
│   │   ├── RiskIndicator (Risk Markers)
│   │   └── DeadlineIndicator (Milestone Markers)
│   └── StreamComponents (Shared Components)
├── NavigationControls (User Interface)
│   ├── ZoomControls
│   ├── HelpPanel
│   ├── LoadingSpinner
│   └── PanHint
├── MarkdownEditor (Live Editing)
└── IntegratedRoadmapEditor (Combined View)
```

## Core Components

### RoadmapPlanner.jsx (Main Orchestrator)
**Purpose**: Main component that coordinates all child components
**Responsibilities**:
- Timeline granularity detection (daily vs weekly)
- Data parsing coordination
- Zoom state management
- Keyboard navigation setup

**Props**: 
```javascript
{
  markdownData: string,     // Raw markdown data
  quarters: array,          // Quarter configuration
  enableDebug: boolean,     // Debug mode toggle
  loadingDelay: number      // Loading simulation delay
}
```

**Key Methods**:
- `determineTimelineGranularity()` - Detects daily vs weekly view
- `parseMarkdown()` / `parseSprintMarkdown()` - Data parsing
- Zoom controls (`zoomIn`, `zoomOut`, `resetZoom`)

### StreamContainer.jsx (Project Streams)
**Purpose**: Renders individual project streams with their items
**Responsibilities**:
- Stream header rendering
- Stream items management
- Risk indicators coordination

### StreamComponents.jsx (Shared Elements)
**Purpose**: Reusable components for timeline elements
**Components**:
- `TimelineBar` - Visual project bars
- `RiskIndicator` - Risk level markers  
- `DeadlineIndicator` - Milestone markers
- `MilestonesRow` - Milestone timeline
- `TooltipWrapper` - Hover information

### TimelineHeader.jsx (Navigation)
**Purpose**: Timeline headers and navigation
**Components**:
- `TimelineHeader` - Quarterly headers
- `MonthHeaders` - Monthly subdivisions
- `WeekHeaders` - Weekly columns with current week highlighting
- `DayHeaders` - Daily granularity view

### TeamCapacity.jsx (Resource Planning)
**Purpose**: Team capacity and availability visualization
**Components**:
- `TeamCapacityRow` - Main capacity container
- `SimpleCapacityBar` - Individual capacity indicators

### NavigationControls.jsx (User Interface)
**Purpose**: User interaction controls and feedback
**Components**:
- `ZoomControls` - Zoom in/out/reset buttons
- `HelpPanel` - Keyboard shortcuts help
- `LoadingSpinner` - Loading state
- `PanHint` - User guidance for panning
- `DebugInfo` - Development debugging info

### MarkdownEditor.jsx (Live Editing)
**Purpose**: Real-time markdown editing with syntax validation
**Features**:
- Syntax highlighting (planned)
- Real-time error checking
- Template insertion
- Live preview sync

### IntegratedRoadmapEditor.jsx (Combined View)
**Purpose**: Split-pane view combining editor and roadmap
**Features**:
- Side-by-side layout
- View mode switching (editor/roadmap/split)
- File operations integration

## Data Flow

### 1. Data Ingestion
```
Raw Markdown → timelineParser.js → Structured Data
├── streams: [{ name, items, risks }]
├── teamCapacity: [{ name, timeline, color }]
└── milestones: [{ name, timeline, deadline }]
```

### 2. Granularity Detection
```
adaptiveTimelineScaling.js
├── analyzeTimelinePatterns()
├── determineTimelineGranularity()
└── parseSprintMarkdown()
```

### 3. Rendering Pipeline
```
Structured Data → Component Props → DOM Elements
├── Timeline positioning calculations
├── CSS styling application
└── Interactive event binding
```

## State Management

### RoadmapPlanner State
```javascript
const [loading, setLoading] = useState(true);
const [showPanHint, setShowPanHint] = useState(true);
const { zoom, zoomIn, zoomOut, resetZoom } = useZoom();
```

### Custom Hooks
- `useZoom()` - Zoom level management
- `useKeyboardNavigation()` - Keyboard shortcuts

## Component Communication

### Props Down
```
RoadmapPlanner
├── markdownData → All child components
├── weeks → Timeline-dependent components  
├── currentWeekIndex → Position-aware components
└── granularity → Layout-switching components
```

### Events Up
```
User Interactions
├── Zoom controls → useZoom hook → RoadmapPlanner
├── Keyboard navigation → useKeyboardNavigation hook
└── File operations → Parent component callbacks
```

## Styling Architecture

### Tailwind Classes
- **Layout**: Flexbox and grid utilities
- **Spacing**: Consistent rem-based spacing (4rem units)
- **Colors**: Theme-based color system
- **Responsive**: Mobile-first responsive design

### CSS-in-JS (Style Props)
```javascript
// Timeline positioning uses calculated styles
style={{
  left: `${left * 4}rem`,
  width: `${width * 4}rem`,
  transform: `scale(${zoom})`,
  backgroundColor: item.color
}}
```

### Print Styles
```css
.no-print { display: none !important; }
@media print { /* Print-specific styles */ }
```

## Performance Optimizations

### React Optimizations
- **useMemo**: Expensive calculations (parsing, positioning)
- **useCallback**: Stable event handlers  
- **React.memo**: Prevent unnecessary re-renders
- **Conditional rendering**: Only render visible items

### DOM Optimizations
- **Transform-based positioning**: Hardware acceleration
- **Minimal DOM manipulation**: Batch updates
- **Event delegation**: Efficient event handling

## Testing Patterns

### Component Testing
```javascript
// Test component behaviour, not implementation
test('timeline bars render with correct positioning styles', () => {
  render(<StreamContainer stream={testStream} weeks={testWeeks} />);
  
  const timelineBars = screen.getAllByTestId('timeline-bar');
  expect(timelineBars).toHaveLength(2);
  
  timelineBars.forEach(bar => {
    expect(bar.style.position).toBe('absolute');
    expect(bar.style.left).toMatch(/\d+(\.\d+)?rem/);
  });
});
```

### Integration Testing
```javascript
// Test component interactions
test('markdown changes update timeline', async () => {
  const { user } = render(<IntegratedRoadmapEditor />);
  
  const editor = screen.getByRole('textbox');
  await user.type(editor, '- **New Task**: Jan W1-W2 | Team1');
  
  await waitFor(() => {
    expect(screen.getByText('New Task')).toBeInTheDocument();
  });
});
```

## Common Patterns

### Conditional Rendering by Granularity
```javascript
{granularity === 'daily' ? (
  <DayHeaders days={weeks} />
) : (
  <WeekHeaders weeks={weeks} currentWeekIndex={currentWeekIndex} />
)}
```

### Timeline Positioning Calculation
```javascript
const { start, end } = parseTimelineRange(item.timeline, weeks);
const width = ((end - start + 1));
const left = (start);

// Apply to DOM
style={{
  left: `${left * 4}rem`,
  width: `${width * 4}rem`
}}
```

### Error Boundaries
```javascript
// Handle component errors gracefully
try {
  return <RoadmapPlanner {...props} />;
} catch (error) {
  return <ErrorFallback error={error} />;
}
```

## Extension Points

### Adding New Timeline Elements
1. Create component in `StreamComponents.jsx`
2. Add to parsing logic in `timelineParser.js`
3. Include in rendering pipeline
4. Add corresponding tests

### New Data Properties
1. Extend `parseMarkdownItem()` function
2. Update component prop interfaces
3. Add CSS styling support
4. Update documentation and tests

### Custom Granularities
1. Extend `adaptiveTimelineScaling.js`
2. Add header components
3. Update positioning calculations
4. Test across different scales