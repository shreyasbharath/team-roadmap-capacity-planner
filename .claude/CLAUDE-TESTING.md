# Team Roadmap Capacity Planner - Testing Strategy

## Overview
Testing strategy emphasises visual regression prevention and TDD methodology. The project has a history of timeline positioning bugs that slip through traditional unit tests, requiring a balanced approach with E2E visual testing.

**Framework**: Vitest (unit/integration) + Future Playwright (E2E/visual)
**Philosophy**: Test-first development (fail → implement → pass cycle)

## Test Distribution
- **25% Unit Tests** - Pure functions, calculations, parsers
- **50% Integration Tests** - Component interactions, state management
- **25% E2E/Visual Tests** - Critical paths, visual regression (future)

## Current Test Structure

### Unit Tests (Domain Logic)
```
src/domain/__tests__/
├── timelineParser.test.js          # Markdown parsing accuracy
├── adaptiveTimelineScaling.test.js # Timeline granularity logic
└── weekdayTimeline.test.js         # Business day calculations
```

**Focus Areas:**
- Markdown roadmap parsing accuracy
- Date range calculations (daily/weekly/quarterly)
- Team capacity overlap detection
- Risk level calculations
- Timeline scaling algorithms

### Integration Tests (Components)
```
src/components/__tests__/
├── RoadmapPlanner.integration.test.jsx    # Full component integration
├── timeline-bars.test.jsx                 # Timeline rendering pipeline
└── timelinePositioning.test.jsx           # Existing positioning tests
```

**Key Scenarios:**
- Complete roadmap loading and rendering
- Timeline navigation (pan/zoom/granularity switching)
- Team capacity overlay on project timelines
- Milestone and deadline indicator placement

### Current Test Files
```
src/tests/
├── README.md
└── timeline-bar-rendering.test.jsx        # Timeline positioning tests
```

## Known Testing Challenges

### Timeline Positioning Bug (Recurring Issue)
**Problem**: Timeline bars appearing offset or clustered due to CSS calculation issues
**Root Cause**: JSDOM cannot measure actual DOM geometry (`getBoundingClientRect()` returns width: 0)
**Solution Applied**: Test CSS properties directly instead of DOM measurements

```javascript
// ❌ Failing approach (JSDOM limitation)
const barRect = bar.getBoundingClientRect();
expect(barRect.width).toBeGreaterThan(5);

// ✅ Working approach (CSS property validation)
expect(bar.style.position).toBe('absolute');
expect(bar.style.left).toMatch(/\d+(\.\d+)?rem/);
expect(bar.style.width).toMatch(/\d+(\.\d+)?rem/);
```

### Bug → Test Mapping
| Bug | Original Test Gap | Current Test Coverage |
|-----|------------------|-------------------|
| Timeline bars offset right | JSDOM can't measure positions | CSS property validation |
| Bars cluster at position 0 | CSS calc() not evaluated | Style property checking |
| Zoom breaks alignment | No zoom interaction tests | Integration tests needed |

## Test Configuration

### Vitest Config (vitest.config.js)
```javascript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/', '**/*.test.{js,jsx}']
    }
  }
});
```

### Test Commands
```bash
pnpm test              # Run all tests
pnpm test:watch        # Watch mode for TDD
pnpm test:ui           # Interactive test runner
pnpm test:coverage     # Coverage report
pnpm test:visual       # Visual regression (planned)
```

## Testing Best Practices

### TDD Workflow (Shreyas's Preference)
1. **Write failing test** - Define expected behaviour
2. **Implement feature** - Make test pass
3. **Refactor** - Clean up code while keeping tests green

### Component Testing Patterns
```javascript
// ✅ Test user-observable behaviour
test('timeline bars render with correct positioning styles', () => {
  render(<RoadmapPlanner />);

  const timelineBars = screen.getAllByTestId('timeline-bar');

  timelineBars.forEach(bar => {
    expect(bar.style.position).toBe('absolute');
    expect(bar.style.left).toMatch(/\d+(\.\d+)?rem/);
    expect(bar.style.width).toMatch(/\d+(\.\d+)?rem/);
  });
});
```

### Mock Strategies
- **Mock external dependencies** (file system, APIs)
- **Don't mock internal implementation** (timeline calculations)
- **Use dependency injection** for cleaner testing

## Future Testing Enhancements

### Planned Playwright Integration
```javascript
// Visual regression with position validation
test('timeline bars align with headers', async ({ page }) => {
  await page.goto('/');

  // Measure actual positions in real browser
  const alignment = await page.evaluate(() => {
    return measureTimelineAlignment();
  });

  expect(alignment.offset).toBeLessThan(2); // pixels
  await expect(page).toHaveScreenshot('timeline-alignment.png');
});
```

### Performance Testing
```javascript
// Benchmark large roadmap rendering
test('renders 100+ initiatives within 500ms', async () => {
  const startTime = performance.now();
  render(<RoadmapPlanner data={largeRoadmapData} />);
  const renderTime = performance.now() - startTime;
  expect(renderTime).toBeLessThan(500);
});
```

## Testing Anti-Patterns to Avoid

### ❌ Don't Test Implementation Details
```javascript
// Bad: Testing internal state
expect(component.state.zoomLevel).toBe(1.5);

// Good: Testing user-visible outcome
expect(screen.getByTestId('zoom-indicator')).toHaveTextContent('150%');
```

### ❌ Don't Use Snapshots for Logic
```javascript
// Bad: Snapshot for business logic
expect(calculatePositions(data)).toMatchSnapshot();

// Good: Explicit assertions
expect(positions[0]).toEqual({ left: 0, width: 80 });
```

## Test Data Management
```javascript
// Realistic test data
const TEST_ROADMAP = `
# Acme Q2/Q3 2025 Roadmap

## Team Capacity
- **Shreyas Leave**: Jul W2-Jul W3 | color: #FFA500

## Streams
### App
- **Feature Toggle**: Jul W1-W4 | Shreyas, Phil | color: #4F46E5
`;
```

## Success Metrics
- **Coverage**: 80%+ for business logic, 100% for critical paths
- **Speed**: Unit tests <5s, visual tests <30s
- **Reliability**: <1% flaky test rate
- **Bug Prevention**: <5% of visual bugs reach production

## Maintenance
- Monthly review of test execution times
- Update test data to reflect current roadmap structure
- Add regression test for any production issues
- Prune obsolete tests for deleted features
