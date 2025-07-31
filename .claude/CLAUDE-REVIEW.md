# Team Roadmap Capacity Planner - Code Review Guide

## Review Philosophy
Follow Shreyas's preferences: TDD methodology, Uncle Bob/Kent Beck/Fowler principles, single responsibility, clean abstractions. Focus on behaviour over implementation.

## Code Standards

### Component Architecture
- **Functional Components**: React hooks pattern throughout
- **Single Responsibility**: Each component has one clear purpose
- **Composition Over Inheritance**: Build complex UIs from simple components
- **Props Interface**: Clear, minimal prop interfaces

### File Organization
```
src/
├── components/           # UI components (React)
├── domain/              # Business logic (pure functions)
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
└── data/                # Configuration and static data
```

### Naming Conventions
- **Components**: PascalCase (`RoadmapPlanner.jsx`)
- **Functions**: camelCase (`parseTimelineRange`)
- **Constants**: UPPER_SNAKE_CASE (`QUARTERS_CONFIG`)
- **Files**: kebab-case for utilities, PascalCase for components

## Review Checklist

### ✅ Code Quality
- [ ] **Single Abstraction Level**: Functions operate at consistent abstraction level
- [ ] **DRY Principle**: No duplication (rule of three before extracting)
- [ ] **Self-Explanatory**: Code reads like well-written prose
- [ ] **Comments for WHY**: Code explains how, comments explain why
- [ ] **Small Functions**: Functions do one thing well

### ✅ React Patterns
- [ ] **Hooks Usage**: Proper use of useState, useEffect, custom hooks
- [ ] **Component Composition**: Build larger components from smaller ones
- [ ] **Props Validation**: Clear prop interfaces, reasonable defaults
- [ ] **Event Handling**: Proper event binding and cleanup
- [ ] **Performance**: Avoid unnecessary re-renders

### ✅ Business Logic
- [ ] **Domain Separation**: Business logic in `domain/` folder
- [ ] **Pure Functions**: Functions are testable and predictable
- [ ] **Error Handling**: Graceful handling of edge cases
- [ ] **Type Safety**: Consistent data structures and validation

### ✅ Testing Requirements
- [ ] **TDD Evidence**: Tests exist and pass before implementation
- [ ] **Test Coverage**: Critical paths have test coverage
- [ ] **Test Quality**: Tests focus on behaviour, not implementation
- [ ] **Edge Cases**: Error conditions and boundary cases tested

## Common Issues to Flag

### 🚨 Timeline Positioning Issues
**Watch for**: CSS positioning calculations, getBoundingClientRect usage in tests
```javascript
// ❌ Problematic: Using DOM measurements in tests
const rect = element.getBoundingClientRect();

// ✅ Better: Test CSS properties directly  
expect(element.style.left).toBe('5rem');
```

### 🚨 Component Responsibilities
**Watch for**: Components doing too much, mixing concerns
```javascript
// ❌ Problematic: Component parsing data AND rendering
const MyComponent = ({ markdownText }) => {
  const parsed = parseMarkdown(markdownText); // Should be in domain layer
  return <div>{parsed.title}</div>;
};

// ✅ Better: Separate concerns
const MyComponent = ({ parsedData }) => {
  return <div>{parsedData.title}</div>;
};
```

### 🚨 Performance Anti-patterns
**Watch for**: Expensive operations in render, missing dependencies
```javascript
// ❌ Problematic: Expensive calculation every render
const Component = ({ data }) => {
  const processed = expensiveCalculation(data); // Runs every render
  return <div>{processed}</div>;
};

// ✅ Better: Memoize expensive operations
const Component = ({ data }) => {
  const processed = useMemo(() => expensiveCalculation(data), [data]);
  return <div>{processed}</div>;
};
```

## Architecture Patterns to Enforce

### Domain-Driven Design
```
domain/
├── timelineParser.js      # Pure functions for parsing
├── adaptiveTimelineScaling.js # Business logic
└── __tests__/            # Domain logic tests
```

### Component Hierarchy
```
RoadmapPlanner (orchestrator)
├── TimelineHeader (navigation)
├── StreamContainer (data display)
│   ├── StreamItem (individual items)
│   └── TimelineBar (visual elements)
└── NavigationControls (user interaction)
```

### Data Flow Pattern
1. **Raw Data** → Domain parsing → **Structured Data**
2. **Structured Data** → Component rendering → **UI Elements**
3. **User Actions** → Event handlers → **State Updates**

## Commit Standards

### Semantic Commits (Required)
```bash
feat: add progress tracking to timeline bars
fix: resolve timeline positioning offset bug  
refactor: extract timeline calculation logic
test: add integration tests for zoom functionality
docs: update component usage examples
```

### Single Responsibility per PR
- **One feature per PR**: Easy to review and rollback
- **Atomic changes**: All related changes in one commit
- **Clear descriptions**: Explain the why, not just the what

## Testing Review Points

### ✅ Test Quality
- [ ] **AAA Pattern**: Arrange, Act, Assert clearly separated
- [ ] **Descriptive Names**: Test names describe exact scenarios
- [ ] **Single Assertion**: Each test validates one behaviour
- [ ] **Realistic Data**: Test data resembles production data

### ✅ TDD Evidence
- [ ] **Red-Green-Refactor**: Evidence of TDD cycle
- [ ] **Test-First**: Tests drive implementation design
- [ ] **Failing Tests**: PRs include initially failing tests
- [ ] **Refactoring Safety**: Tests protect against regression

## Performance Review

### ✅ Rendering Performance
- [ ] **Minimal Re-renders**: Proper use of React.memo, useMemo
- [ ] **Event Handler Stability**: useCallback for stable handlers
- [ ] **Large Lists**: Virtual scrolling for 100+ items
- [ ] **Image Optimization**: Proper image loading and sizing

### ✅ Bundle Size
- [ ] **Tree Shaking**: Only used exports included
- [ ] **Code Splitting**: Route-based splitting where appropriate
- [ ] **Dependency Audit**: No unnecessary dependencies

## Security Considerations

### ✅ Input Validation
- [ ] **Markdown Parsing**: Sanitize user input
- [ ] **File Operations**: Validate file paths and types
- [ ] **XSS Prevention**: Proper HTML escaping

### ✅ Desktop Security (Tauri)
- [ ] **API Permissions**: Minimal required permissions
- [ ] **File System Access**: Proper path validation
- [ ] **Command Execution**: Avoid shell injection

## Documentation Requirements

### ✅ Component Documentation
```javascript
/**
 * Interactive timeline component for roadmap visualization
 * 
 * @param {Object} props
 * @param {Array} props.streams - Parsed roadmap streams
 * @param {Array} props.weeks - Timeline weeks array
 * @param {number} props.currentWeekIndex - Current week position
 */
export const RoadmapPlanner = ({ streams, weeks, currentWeekIndex }) => {
  // Implementation
};
```

### ✅ Complex Logic Documentation
- **Business Rules**: Document domain-specific rules
- **Algorithm Explanations**: Explain non-obvious calculations
- **Integration Points**: Document external dependencies

## Approval Criteria

### Must-Have
- [ ] All tests pass (unit + integration)
- [ ] Code follows established patterns
- [ ] No performance regressions
- [ ] Proper error handling
- [ ] Documentation updated

### Nice-to-Have
- [ ] Performance improvements
- [ ] Additional test coverage
- [ ] Code simplification
- [ ] Better user experience

## Common Reviewer Feedback

### Code Structure
> "This component is doing too much. Can we extract the data processing logic to the domain layer?"

### Testing
> "This test is testing implementation details. Can we focus on the user-observable behaviour instead?"

### Performance
> "This calculation runs on every render. Should we memoize it?"

### Architecture
> "This breaks our domain separation. Business logic should be in the domain folder, not components."