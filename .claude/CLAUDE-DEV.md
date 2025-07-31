# Team Roadmap Capacity Planner - Development Guide

## Overview
Cross-platform interactive roadmap and capacity planning tool built with React + Tauri. Supports both web deployment and native desktop applications (Windows, macOS, Linux). A generic, open-source solution for product roadmap planning across various industries and team structures.

## Architecture

### Frontend (React + Vite)
- **React 18.3** with functional components and hooks
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **JSX** components (not TypeScript)

### Desktop (Rust + Tauri)
- **Tauri 1.6** for cross-platform desktop app
- **Rust** backend for file system operations
- Native installers for Windows (.msi), macOS (universal), Linux (.deb/.AppImage)

### Test Stack
- **Vitest** for unit/integration tests
- **Testing Library** for component testing
- **JSDOM** test environment
- **Puppeteer** for PDF generation and visual regression

## Project Structure
```
├── src/
│   ├── components/           # UI components
│   │   ├── RoadmapPlanner.jsx        # Main orchestrator
│   │   ├── StreamContainer.jsx       # Project streams management
│   │   ├── TimelineHeader.jsx        # Quarter/month/week navigation  
│   │   ├── TeamCapacity.jsx         # Resource availability
│   │   ├── NavigationControls.jsx   # Zoom/pan controls
│   │   ├── StreamComponents.jsx     # Individual project items
│   │   ├── MarkdownEditor.jsx       # Live markdown editor
│   │   └── IntegratedRoadmapEditor.jsx
│   ├── domain/               # Business logic
│   │   ├── timelineParser.js        # Parse roadmap markdown
│   │   └── adaptiveTimelineScaling.js # Dynamic granularity
│   ├── data/
│   │   └── roadmap.md              # Roadmap data source
│   ├── hooks/
│   │   └── useKeyboardNavigation.js # Keyboard shortcuts
│   ├── tests/                      # Test files
│   └── utils/                      # Utility functions
├── src-tauri/               # Tauri desktop backend
├── scripts/                 # Build and utility scripts
├── docs/                    # Documentation
└── dist/                    # Built application
```

## Data Format (Markdown)
```markdown
# Roadmap Title

## Team Capacity
- **Person Leave**: Date Range | color: #HexCode

## Streams

### Stream Name
- **Project**: Date Range | Team | properties | color: #HexCode
```

### Supported Properties
- **Timeline**: `Jul W1-Sep W2` (week ranges) or daily granularity
- **Teams**: Free text team assignments
- **Deadlines**: `hard-deadline` | `soft-deadline` with ISO dates
- **Risk Levels**: `risk-level: high|medium|low`
- **Custom Labels**: `deadline-label` for milestone context
- **Colors**: Hex codes for visual organisation

## Development Commands

### Web Development
```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm preview          # Preview production build
```

### Desktop Development
```bash
pnpm tauri:dev        # Start desktop app in dev mode
pnpm tauri:build      # Build desktop app for distribution
pnpm tauri:icon       # Generate app icons
```

### Testing
```bash
pnpm test             # Run all tests
pnpm test:watch       # Run tests in watch mode
pnpm test:ui          # Interactive test runner
pnpm test:coverage    # Coverage report
```

### Export & Utility
```bash
pnpm pdf              # Generate PDF export
pnpm pdf:landscape    # Landscape PDF
pnpm screenshot       # Generate documentation screenshot
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix linting issues
```

## Key Features
- **Live Markdown Editor**: Real-time visual preview
- **Interactive Timeline**: Pan/zoom with smooth performance
- **Team Capacity Planning**: Leave, holidays, resource constraints
- **Risk Management**: Visual risk indicators with severity levels
- **Milestone Tracking**: Hard/soft deadlines with labels
- **Adaptive Granularity**: Switches between weekly/daily views
- **PDF Generation**: Multiple formats (A4, A3, landscape)
- **Cross-platform**: Web + Desktop (Windows/macOS/Linux)

## Technology Stack Details

### Dependencies (package.json)
```json
{
  "dependencies": {
    "@tauri-apps/api": "^1.6.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^1.6.3",
    "@vitejs/plugin-react": "^4.7.0",
    "tailwindcss": "^3.4.17",
    "vitest": "^0.34.6",
    "puppeteer": "^22.15.0"
  }
}
```

### Configuration Files
- `tauri.conf.json.template` - Desktop app configuration
- `vite.config.js` - Build configuration  
- `vitest.config.js` - Test configuration
- `tailwind.config.js` - Styling configuration
- `eslint.config.js` - Code quality

## Development Patterns
- **Functional Components**: React hooks pattern throughout
- **Custom Hooks**: `useZoom`, `useKeyboardNavigation`
- **Ref-based DOM Access**: For canvas/timeline interactions
- **Conditional Rendering**: Based on granularity and features
- **File-First Development**: Markdown data drives UI

## Known Issues & Gotchas
- **Timeline Positioning**: JSDOM cannot test visual positioning, requires E2E tests
- **PDF Generation**: Requires Puppeteer setup for web builds
- **Cross-platform**: Different file system behaviours between web/desktop
- **Performance**: Large roadmaps (100+ items) need optimisation

## Deployment

### Web
```bash
pnpm build
# Deploy dist/ folder to static hosting
```

### Desktop
```bash
pnpm tauri:build
# Find installers in src-tauri/target/release/bundle/
```

## Example Usage Context
The tool is designed for product teams, engineering managers, and project coordinators who need to visualise:
- Product development streams (Frontend, Backend, Mobile, Infrastructure)
- Team member availability and capacity planning
- Project timelines across quarters and sprints
- Risk management and milestone tracking
- Resource allocation and dependency management

Common use cases include software product roadmaps, feature planning, release coordination, and team capacity optimisation across various industries including tech companies, agencies, and enterprise teams.