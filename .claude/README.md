# Team Roadmap Capacity Planner - Cache Index

## Claude Cache Overview
This cache provides comprehensive information about the Team Roadmap Capacity Planner, an open-source cross-platform roadmap planning tool built with React + Tauri.

## Cache Files

### 📖 Core Documentation
- **[CLAUDE-DEV.md](./CLAUDE-DEV.md)** - Primary development guide covering architecture, commands, features, and deployment
- **[CLAUDE-QUICKREF.md](./CLAUDE-QUICKREF.md)** - Quick reference with commands, patterns, and troubleshooting

### 🏗️ Architecture & Design
- **[CLAUDE-COMPONENTS.md](./CLAUDE-COMPONENTS.md)** - Component hierarchy, data flow, state management, and performance patterns
- **[CLAUDE-DOMAIN.md](./CLAUDE-DOMAIN.md)** - Business logic, domain objects, parsing rules, and validation

### 🧪 Testing & Quality
- **[CLAUDE-TESTING.md](./CLAUDE-TESTING.md)** - TDD methodology, test strategy, known issues, and visual regression prevention
- **[CLAUDE-REVIEW.md](./CLAUDE-REVIEW.md)** - Code review standards, architecture patterns, and quality guidelines

### 💡 Productivity Tools
- **[CLAUDE-PROMPTS.md](./CLAUDE-PROMPTS.md)** - Library of ready-to-use prompts for efficient development assistance

## Project Context

### What It Is
- **Cross-platform roadmap planning tool** (React + Tauri)
- **Web + Desktop** support (Windows, macOS, Linux)
- **Markdown-driven** data format with live editing
- **Open-source** generic solution for product teams

### Key Features
- Interactive timeline with pan/zoom
- Team capacity planning
- Risk management and milestones
- Adaptive granularity (daily/weekly/quarterly)
- PDF export and file operations
- Live markdown editor with real-time preview

### Architecture Highlights
- **Domain-driven design** with business logic separation
- **TDD methodology** with comprehensive test coverage
- **Component composition** following single responsibility
- **Visual positioning challenges** requiring CSS-based testing

## Quick Start for Claude

### Understanding the Project
1. Read **CLAUDE-DEV.md** for overall architecture
2. Check **CLAUDE-COMPONENTS.md** for component structure
3. Review **CLAUDE-DOMAIN.md** for business logic

### Development Assistance
1. Use **CLAUDE-PROMPTS.md** for task-specific prompts
2. Follow **CLAUDE-TESTING.md** for TDD approach
3. Apply **CLAUDE-REVIEW.md** standards for quality

### Common Tasks
- **New Features**: Use TDD prompts + component design patterns
- **Bug Fixes**: Timeline positioning issues are well-documented
- **Testing**: Focus on CSS properties, not DOM measurements
- **Extensions**: Follow domain-driven architecture patterns

## Key Principles

### Development Philosophy
- **Test-First Development**: Fail → Implement → Pass cycle
- **Single Responsibility**: Components and functions do one thing well
- **Domain Separation**: Business logic in domain/ folder
- **Visual Testing Awareness**: JSDOM limitations require CSS property testing

### Code Quality Standards
- Uncle Bob/Kent Beck/Fowler principles
- Clean abstractions and self-explanatory code
- DRY principle (rule of three)
- Performance optimization for large datasets

### Testing Strategy
- 25% Unit tests (domain logic)
- 50% Integration tests (component interactions)  
- 25% E2E tests (visual regression)

## Known Challenges

### Timeline Positioning Bug (Recurring)
- **Issue**: Visual elements offset or clustered
- **Cause**: JSDOM cannot measure DOM geometry
- **Solution**: Test CSS properties directly, plan Playwright E2E tests

### Performance Considerations
- Large roadmaps (100+ items) need optimization
- React rendering optimization with useMemo/useCallback
- Timeline calculation efficiency

### Cross-Platform Complexity
- Web vs desktop feature differences
- File system access patterns
- Native vs web export functionality

## Usage Context

### Target Users
- Product teams and engineering managers
- Project coordinators and scrum masters
- Any team needing visual timeline planning

### Common Use Cases
- Product development roadmaps
- Sprint and release planning
- Team capacity management
- Risk and milestone tracking
- Resource allocation visualization

---

**Cache Created**: For efficient Claude assistance with the Team Roadmap Capacity Planner
**Last Updated**: Cache creation
**Version**: Comprehensive initial cache with prompt library