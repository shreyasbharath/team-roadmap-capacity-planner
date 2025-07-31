# Team Roadmap Capacity Planner - Prompt Library

## Overview
Efficient prompts for Claude and Claude Code that leverage the project cache first, avoiding the need to re-analyze the codebase for each interaction. All prompts assume Claude has access to the cache files in `.claude/` directory.

## Cache-First Prompt Pattern
```
Check the cache in .claude/[RELEVANT-FILE].md for context, then [SPECIFIC_REQUEST]
```

## Development Prompts

### Architecture & Design

**Understanding Component Structure**
```
Check .claude/CLAUDE-COMPONENTS.md for the component hierarchy, then explain how to add a new timeline element type (like progress bars) to the existing architecture.
```

**Domain Logic Changes**
```
Refer to .claude/CLAUDE-DOMAIN.md for business rules, then help me extend the markdown parser in src/domain/timelineParser.js to support a new property: "progress: 75%".
```

**Adding New Features**
```
Review .claude/CLAUDE-DEV.md for the architecture patterns, then guide me through implementing [FEATURE_NAME] following the established component structure and data flow.
```

### Code Implementation

**Component Development**
```
Using .claude/CLAUDE-COMPONENTS.md as reference for patterns, help me create a new component for [COMPONENT_NAME] that follows the established architecture and styling conventions.
```

**Business Logic Implementation**
```
Based on .claude/CLAUDE-DOMAIN.md business rules, implement the logic for [FEATURE] in the appropriate domain module, following the pure function patterns used in timelineParser.js.
```

**Hook Creation**
```
Following the patterns in .claude/CLAUDE-COMPONENTS.md under "Custom Hooks", create a new hook called use[HOOK_NAME] for [FUNCTIONALITY].
```

## Testing Prompts

### TDD Workflow

**Test-First Development**
```
Check .claude/CLAUDE-TESTING.md for TDD patterns, then write failing tests for [FEATURE] before implementation, following the fail → implement → pass cycle.
```

**Timeline Positioning Tests**
```
Refer to .claude/CLAUDE-TESTING.md section on timeline positioning bugs, then create tests for [COMPONENT] that validate CSS properties instead of DOM measurements.
```

**Integration Testing**
```
Using .claude/CLAUDE-TESTING.md integration test patterns, create tests that validate the interaction between [COMPONENT_A] and [COMPONENT_B].
```

### Test Debugging

**Visual Test Issues**
```
Check .claude/CLAUDE-TESTING.md for visual testing challenges, then help debug why my timeline positioning test is failing with JSDOM limitations.
```

**Coverage Gaps**
```
Based on .claude/CLAUDE-TESTING.md success metrics, analyze the current test coverage and suggest tests needed to reach 80% coverage for business logic.
```

## Code Review Prompts

### Pre-Commit Review

**Code Quality Check**
```
Using .claude/CLAUDE-REVIEW.md checklist, review this code change for compliance with Uncle Bob/Kent Beck principles and single responsibility patterns.
```

**Architecture Compliance**
```
Check .claude/CLAUDE-REVIEW.md architecture patterns, then verify this PR maintains proper separation between domain logic and React components.
```

**Performance Review**
```
Refer to .claude/CLAUDE-REVIEW.md performance section, then analyze this component for potential rendering performance issues and suggest optimizations.
```

### PR Review

**Component Review**
```
Using .claude/CLAUDE-REVIEW.md component standards, review this React component for proper hooks usage, props validation, and event handling patterns.
```

**Testing Review**
```
Based on .claude/CLAUDE-REVIEW.md testing requirements, evaluate whether this PR has adequate test coverage and follows TDD evidence patterns.
```

## Debugging Prompts

### Bug Investigation

**Timeline Positioning Issues**
```
Check .claude/CLAUDE-TESTING.md for known timeline positioning bugs, then help diagnose why timeline bars are [SPECIFIC_ISSUE] and suggest CSS-based testing approaches.
```

**Performance Issues**
```
Refer to .claude/CLAUDE-COMPONENTS.md performance optimizations, then analyze why the roadmap is slow when rendering [SCENARIO] and suggest React optimization patterns.
```

**Cross-Platform Issues**
```
Using .claude/CLAUDE-DEV.md cross-platform context, help debug why [FEATURE] works in web but fails in desktop Tauri mode.
```

### Error Resolution

**Build Issues**
```
Check .claude/CLAUDE-QUICKREF.md troubleshooting section, then help resolve this build error: [ERROR_MESSAGE]
```

**Test Failures**
```
Refer to .claude/CLAUDE-TESTING.md for test debugging patterns, then help fix this failing test that's testing [SCENARIO].
```

## Documentation Prompts

### Code Documentation

**Component Documentation**
```
Following .claude/CLAUDE-REVIEW.md documentation requirements, generate JSDoc comments for this component that explain its purpose, props, and usage patterns.
```

**API Documentation**
```
Based on .claude/CLAUDE-DOMAIN.md business rules, document this domain function with clear parameter descriptions and business rule explanations.
```

### User Documentation

**Feature Documentation**
```
Using .claude/CLAUDE-DEV.md features section, create user documentation for [FEATURE] that explains its purpose and usage in the roadmap planning context.
```

**Setup Instructions**
```
Refer to .claude/CLAUDE-QUICKREF.md development setup, then create step-by-step instructions for new developers to get the project running locally.
```

## Refactoring Prompts

### Code Cleanup

**Extract Domain Logic**
```
Check .claude/CLAUDE-REVIEW.md architecture patterns, then help extract business logic from this component into the appropriate domain module following DRY principles.
```

**Component Simplification**
```
Using .claude/CLAUDE-COMPONENTS.md patterns, refactor this component to follow single responsibility principle while maintaining the established data flow.
```

### Performance Optimization

**React Optimization**
```
Based on .claude/CLAUDE-COMPONENTS.md performance section, optimize this component using useMemo, useCallback, and React.memo patterns where appropriate.
```

**Bundle Optimization**
```
Refer to .claude/CLAUDE-REVIEW.md bundle size guidelines, then suggest improvements to reduce the build size while maintaining functionality.
```

## Feature Development Prompts

### New Feature Planning

**Feature Architecture**
```
Check .claude/CLAUDE-COMPONENTS.md for component patterns and .claude/CLAUDE-DOMAIN.md for business rules, then design the architecture for [FEATURE] that fits the existing patterns.
```

**Data Model Extension**
```
Using .claude/CLAUDE-DOMAIN.md data structures, design how to extend the markdown format and parsing logic to support [NEW_DATA_TYPE].
```

### Implementation Guidance

**Step-by-Step Implementation**
```
Refer to .claude/CLAUDE-DEV.md development patterns and .claude/CLAUDE-TESTING.md TDD workflow, then provide a step-by-step plan to implement [FEATURE] using test-first development.
```

**Integration Planning**
```
Based on .claude/CLAUDE-COMPONENTS.md data flow patterns, explain how to integrate [NEW_COMPONENT] with the existing RoadmapPlanner orchestration.
```

## Maintenance Prompts

### Code Health

**Technical Debt Review**
```
Using .claude/CLAUDE-REVIEW.md quality standards, analyze the codebase for technical debt and suggest refactoring priorities based on maintainability impact.
```

**Test Suite Health**
```
Check .claude/CLAUDE-TESTING.md success metrics, then evaluate the current test suite health and suggest improvements for reliability and coverage.
```

### Dependency Management

**Dependency Updates**
```
Refer to .claude/CLAUDE-DEV.md technology stack, then analyze these dependency updates for compatibility with React 18.3, Tauri 1.6, and Vitest patterns.
```

**Security Review**
```
Based on .claude/CLAUDE-REVIEW.md security considerations, review these dependencies and code changes for potential security implications in both web and desktop contexts.
```

## Quick Reference Prompts

### Development Shortcuts

**Command Reference**
```
Check .claude/CLAUDE-QUICKREF.md for the command to [TASK] (e.g., run tests, build desktop app, generate PDF).
```

**Configuration Quick Fix**
```
Refer to .claude/CLAUDE-QUICKREF.md configuration section, then help fix this [CONFIG_FILE] issue: [PROBLEM]
```

**Pattern Lookup**
```
Using .claude/CLAUDE-QUICKREF.md common patterns, show me the correct way to [PATTERN] (e.g., parse timeline, handle events, style components).
```

## Prompt Templates

### Generic Template
```
Check .claude/CLAUDE-[RELEVANT-FILE].md for [SPECIFIC_CONTEXT], then [YOUR_REQUEST] following the established [PATTERNS/PRINCIPLES].
```

### Multi-File Template
```
Review .claude/CLAUDE-[FILE1].md for [CONTEXT1] and .claude/CLAUDE-[FILE2].md for [CONTEXT2], then [YOUR_REQUEST] ensuring consistency with both aspects.
```

### Implementation Template
```
Based on .claude/CLAUDE-[DOMAIN/COMPONENTS/TESTING].md patterns, implement [FEATURE] that:
1. Follows the established architecture
2. Includes appropriate tests
3. Maintains performance standards
4. Follows code review guidelines
```

## Usage Tips

### Efficiency Guidelines
1. **Always start with cache reference** - Specify which cache file contains relevant context
2. **Be specific about sections** - Reference specific sections within cache files when possible
3. **Combine contexts** - Reference multiple cache files when the request spans different concerns
4. **Follow established patterns** - Ask Claude to follow the patterns documented in the cache

### Context Optimization
- Use `.claude/CLAUDE-QUICKREF.md` for quick lookups and common patterns
- Use `.claude/CLAUDE-DEV.md` for architecture and setup questions
- Use `.claude/CLAUDE-TESTING.md` for all testing-related prompts
- Use `.claude/CLAUDE-COMPONENTS.md` for component structure and data flow
- Use `.claude/CLAUDE-DOMAIN.md` for business logic and parsing questions
- Use `.claude/CLAUDE-REVIEW.md` for code quality and review guidance

### Example Usage
```
❌ Less Efficient:
"Help me add progress bars to timeline items"

✅ More Efficient:
"Check .claude/CLAUDE-COMPONENTS.md for TimelineBar patterns and .claude/CLAUDE-DOMAIN.md for property parsing, then guide me through adding progress bars to timeline items following the established component architecture."
```

This prompt library ensures Claude has immediate context from the cache, reducing analysis time and maintaining consistency with project standards.