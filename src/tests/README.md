# Timeline Bar Rendering Tests

This directory contains comprehensive tests to prevent regression of the critical timeline bar rendering bug.

## Bug History

### The Issue
Timeline bars (project timeline visualizations) were not rendering correctly. The bars appeared to be missing or positioned way off-screen due to incorrect pixel positioning calculations.

### Root Cause
The positioning calculation was using an incorrect formula:
- **Incorrect**: `left = (start * 4) * 64px` → This caused positions like 1024px, 1536px (way off-screen)
- **Correct**: `left = start * 64px` → This creates proper positions like 256px, 384px (visible)

### The Fix
Updated the `TimelineBar` component in `src/components/StreamComponents.jsx`:
- Changed calculation from `left = (start * 4)` to `left = start`
- Width calculation: `width = (end - start + 1)`
- Final positioning: `left * 64px`, `width * 64px`

## Test Coverage

### Timeline Bar Rendering Tests (`timeline-bar-rendering.test.js`)

**Core Tests:**
- ✅ Timeline bars are visible and properly rendered
- ✅ Positioning calculations are correct (not off-screen)
- ✅ Text content is displayed correctly
- ✅ Z-index stacking order is proper (bars appear above other elements)
- ✅ Container overflow is handled correctly
- ✅ All streams have their timeline bars rendered

**Regression Prevention Tests:**
- ✅ Bars are positioned within reasonable bounds (< 1000px)
- ✅ Specific project positioning matches expected week calculations
- ✅ Width calculations are accurate for project duration
- ✅ Original positioning bug cannot occur (positions < 1000px)

### Data Test IDs Added

The following `data-testid` attributes were added to components for reliable testing:

- `roadmap-container` - Main roadmap container
- `streams-container` - Container for all streams
- `stream-container` - Individual stream container
- `stream-item` - Individual stream item row
- `timeline-bar` - Timeline bar element (the critical component)
- `week-cell` - Week cell elements

## Running Tests

### Run Timeline Bar Tests Only
```bash
npm run test:timeline-bars
```

### Run All Tests
```bash
npm run test
```

### Run Tests with UI
```bash
npm run test:ui
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

## CI/CD Integration

The tests are automatically run on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

The workflow runs:
1. Timeline bar regression tests
2. Full test suite
3. Linting
4. Build verification

## Test Files

- `timeline-bar-rendering.test.js` - Main regression test suite
- `../components/__tests__/timeline-bars.test.jsx` - Unit tests for timeline bar components

## Mock Data

The tests use mock roadmap data to ensure consistent, predictable results:

```markdown
## Product Stream Alpha
- Widget Framework v2.0 (Jul W1-Sep W2) - color: #8B5CF6
  - Team: Team Phoenix

## Product Stream Beta  
- Notification Engine (Jul W3-Oct W4) - color: #EF4444
  - Team: Team Falcon
- Data Visualization Tool (Aug W1-Oct W2) - color: #10B981
  - Team: Team Eagle, Team Hawk
```

## Expected Positioning

With the correct calculations:
- **Widget Framework v2.0** (Jul W1-Sep W2): left ≈ 256px, width ≈ 640px
- **Notification Engine** (Jul W3-Oct W4): left ≈ 384px, width ≈ 896px  
- **Data Visualization Tool** (Aug W1-Oct W2): left ≈ 512px, width ≈ 640px

## Debugging

If tests fail:

1. Check console logs for timeline bar positioning calculations
2. Verify `TimelineBar` component is rendering with correct `data-testid`
3. Check CSS positioning values are within expected ranges
4. Ensure container overflow is set to `visible`

## Contributing

When making changes to timeline bar rendering:

1. Run the timeline bar tests first: `npm run test:timeline-bars`
2. Verify positioning calculations are correct
3. Check that bars are visible in the browser
4. Update tests if new functionality is added
