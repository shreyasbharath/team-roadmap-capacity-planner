# Team Roadmap Capacity Planner - Quick Reference

## Project Overview
Cross-platform roadmap planning tool (React + Tauri) for generic product roadmap planning. Supports web deployment and native desktop apps. Open-source solution for teams across various industries.

## Quick Commands

### Development
```bash
pnpm dev              # Web development server
pnpm tauri:dev        # Desktop development
pnpm build            # Production web build
pnpm tauri:build      # Desktop app build
```

### Testing
```bash
pnpm test             # Run all tests
pnpm test:watch       # TDD watch mode
pnpm test:coverage    # Coverage report
pnpm test:ui          # Interactive test runner
```

### Export & Utilities
```bash
pnpm pdf              # Generate PDF
pnpm pdf:landscape    # Landscape PDF
pnpm screenshot       # Documentation screenshot
pnpm lint             # Code quality check
```

## File Structure Quick Reference
```
src/
├── components/           # React UI components
│   ├── RoadmapPlanner.jsx       # Main orchestrator
│   ├── StreamContainer.jsx      # Project streams
│   ├── TimelineHeader.jsx       # Date navigation
│   ├── MarkdownEditor.jsx       # Live editor
│   └── NavigationControls.jsx   # User controls
├── domain/              # Business logic
│   ├── timelineParser.js        # Markdown parsing
│   └── adaptiveTimelineScaling.js # Granularity detection
├── data/
│   └── roadmap.md              # Data source
├── hooks/
│   └── useKeyboardNavigation.js # Keyboard shortcuts
└── tests/               # Test files
```

## Data Format Cheat Sheet

### Basic Structure
```markdown
# Roadmap Title

## Team Capacity
- **Person Leave**: Jul W2-Jul W3 | color: #FFA500

## Streams

### Stream Name
- **Project**: Jul W1-Aug W2 | Team | color: #4F46E5
```

### Properties Reference
- `color: #HexCode` - Visual styling
- `hard-deadline: 2025-08-15` - Must-hit date
- `soft-deadline: 2025-08-20` - Target date
- `deadline-label: App Release` - Milestone description
- `risk-level: high|medium|low` - Risk assessment
- `progress: 75%` - Completion percentage (planned)

## Common Patterns

### Timeline Formats
- **Week Range**: `Jul W1-Sep W2`
- **Single Week**: `Aug W3`
- **Daily**: `Day 1-Day 5` (auto-detected)

### Component Usage
```javascript
// Main component
<RoadmapPlanner 
  markdownData={roadmapData}
  quarters={QUARTERS_CONFIG}
  enableDebug={false}
/>

// With custom data
<RoadmapPlanner 
  markdownData={customMarkdown}
  loadingDelay={500}
/>
```

## Testing Quick Reference

### TDD Workflow
1. Write failing test
2. Implement feature  
3. Refactor (keeping tests green)

### Test Patterns
```javascript
// Component testing
test('renders timeline bars with correct styles', () => {
  render(<RoadmapPlanner />);
  const bars = screen.getAllByTestId('timeline-bar');
  expect(bars[0].style.position).toBe('absolute');
});

// Domain logic testing
test('parses timeline range correctly', () => {
  const result = parseTimelineRange('Jul W1-Aug W3', weeks);
  expect(result).toEqual({ start: 0, end: 6 });
});
```

## Common Issues & Solutions

### Timeline Positioning Bug
**Issue**: Timeline bars offset or clustered
**Cause**: JSDOM can't measure DOM geometry
**Solution**: Test CSS properties, not DOM measurements

### Performance with Large Roadmaps
**Issue**: Slow rendering with 100+ items
**Solution**: Use React.memo, useMemo for calculations

### Cross-Platform File Operations
**Issue**: Different behaviour web vs desktop
**Solution**: Use Tauri APIs for desktop, fallback for web

## Configuration Files

### package.json - Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build", 
    "test": "vitest run --reporter=basic",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build"
  }
}
```

### vitest.config.js - Testing
```javascript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js'
  }
});
```

### tailwind.config.js - Styling
```javascript
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: []
};
```

## Architecture Principles

### Domain-Driven Design
- Business logic in `domain/` folder
- Pure functions for calculations
- Components handle presentation only

### Component Architecture
- Single responsibility per component
- Composition over inheritance
- Props down, events up

### Testing Strategy
- 25% Unit tests (domain logic)
- 50% Integration tests (components)
- 25% E2E tests (visual regression)

## Deployment Quick Reference

### Web Deployment
```bash
pnpm build
# Deploy dist/ folder to static hosting
```

### Desktop Distribution
```bash
pnpm tauri:build
# Find installers in src-tauri/target/release/bundle/
```

## Development Tips

### Visual Debugging
- Use `enableDebug={true}` prop for debug info
- Check browser DevTools for CSS positioning
- Use `pnpm test:ui` for interactive testing

### Performance Optimization
- Use `useMemo` for expensive calculations
- `useCallback` for stable event handlers
- `React.memo` to prevent unnecessary re-renders

### Cross-Platform Development
- Test both web (`pnpm dev`) and desktop (`pnpm tauri:dev`)
- Use conditional rendering for platform-specific features
- Native file operations only work in desktop mode

## Keyboard Shortcuts

### Navigation
- **Arrow Keys**: Pan timeline
- **Ctrl/Cmd + +/-**: Zoom in/out
- **Ctrl/Cmd + 0**: Reset zoom

### Desktop-Specific
- **Ctrl/Cmd + O**: Open file
- **Ctrl/Cmd + S**: Save file
- **Ctrl/Cmd + Shift + S**: Save as

## Troubleshooting

### Build Issues
- Check Node.js version (18+)
- Clear node_modules and reinstall
- For desktop: verify Rust installation

### Test Failures
- Timeline positioning: Check CSS properties, not DOM measurements
- Async operations: Use proper waitFor conditions
- Mock issues: Verify mock setup in test files

### Performance Issues
- Profile with React DevTools
- Check for expensive renders
- Optimize large dataset handling