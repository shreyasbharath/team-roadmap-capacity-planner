# Roadmap Examples Guide

This directory contains comprehensive examples showcasing all features of the Team Roadmap Capacity Planner.

## Available Examples

### 1. Quarterly Roadmap (`roadmap-quarterly.md`)
**Use Case:** Long-term planning across multiple quarters
- **Timeline:** Q2/Q3/Q4 2025 (weekly granularity)
- **Teams:** Alice, Bob, Carol, David, Eva
- **Streams:** 6 major product streams including Platform Modernization, Analytics, etc.
- **Features Showcased:**
  - ✅ Team capacity planning with leave periods
  - ✅ Multiple product streams with realistic tech company context
  - ✅ Hard and soft milestones with deadline labels
  - ✅ Comprehensive risk management (7 risks across high/medium/low levels)
  - ✅ Deadline tracking with business context
  - ✅ Color-coded visual organisation

### 2. Daily Sprint Roadmap (`roadmap-daily.md`) 
**Use Case:** Sprint planning with daily granularity
- **Timeline:** July 15-29, 2025 (daily granularity, weekdays only)
- **Teams:** Alex, Jordan, Taylor, Morgan, Casey, Design Team, QA Team, DevOps
- **Streams:** 4 focused sprint streams for mobile app release
- **Features Showcased:**
  - ✅ Daily timeline view with weekday focus
  - ✅ Sprint-specific team capacity management
  - ✅ Detailed milestone tracking within sprint boundaries
  - ✅ Intensive risk management (7 risks with daily precision)
  - ✅ Short-term deadline pressure simulation
  - ✅ End-to-end development workflow (Dev → QA → Release)

## Risk Examples by Category

### High Risk (🔴)
- **Quarterly:** Legacy system compatibility, Platform deadline pressure, Authentication system complexity
- **Daily:** Database migration data corruption, Integration testing failures

### Medium Risk (🟡)  
- **Quarterly:** Third-party API rate limiting, Team capacity during leave, Security compliance
- **Daily:** API performance under load, Third-party push service downtime, Team capacity during Alex leave

### Low Risk (🟠)
- **Quarterly:** Infrastructure scaling costs  
- **Daily:** App Store review delays

## Milestone Examples

### Hard Milestones (🚩)
- Critical deadlines that cannot move
- Examples: Feature freeze dates, platform launch dates, security compliance deadlines

### Soft Milestones (🏁)
- Target dates with some flexibility
- Examples: Demo days, beta releases, planning sessions

## Team Capacity Examples

### Quarterly Planning
- Extended leave periods (Jul W2-Jul W3)
- Conference attendance (Aug W1)
- Training periods (Sep W2-Sep W3)
- On-call rotations (Aug W3)

### Sprint Planning  
- Short-term leave (2-3 days)
- Single-day commitments (meetings, training)
- Code review focused days
- Client meetings

## How to Switch Examples

### In the Application
1. Run `npm run dev`
2. Use the example switcher buttons at the top
3. Toggle between "Quarterly Roadmap" and "Daily Sprint Roadmap"

### For Development/Testing
```javascript
// Import specific example data
import quarterlyData from '../data/roadmap-quarterly.md?raw';
import dailyData from '../data/roadmap-daily.md?raw';

// Use in RoadmapPlanner component
<RoadmapPlanner markdownData={quarterlyData} />
<RoadmapPlanner markdownData={dailyData} />
```

## Testing All Features

Both examples are designed to exercise every component of the system:

1. **Timeline Parsing:** Both weekly and daily granularity
2. **Team Capacity:** Various leave patterns and constraints  
3. **Risk Management:** All risk levels with realistic scenarios
4. **Milestone Tracking:** Hard and soft deadlines with business context
5. **Stream Management:** Multiple parallel workstreams
6. **Visual Design:** Color coding, tooltips, and clean icon display

## Real-World Context

### Tech Company Quarterly Roadmap
- Reflects typical tech company product streams (Platform, Analytics, Infrastructure, etc.)
- Uses generic team member names (Alice, Bob, Carol, David, Eva)
- Includes common engineering work (API migration, database optimization, security updates)
- Addresses typical business deadlines (platform launches, compliance requirements)

### Mobile App Sprint
- Simulates realistic sprint planning scenario
- Includes full development lifecycle (dev → QA → release)
- Models common sprint challenges (API performance, testing bottlenecks)
- Demonstrates capacity planning during team member absence

## Performance Testing

Both examples can be used for performance testing:
- **Quarterly:** ~30 timeline items across 16 weeks (480 timeline cells)
- **Daily:** ~20 timeline items across 11 days (220 timeline cells)
- **Risk Icons:** 7 risks per example testing icon rendering performance
- **Milestone Icons:** 6+ milestones per example testing tooltip performance

Run `npm run test risk-parsing` to validate data parsing accuracy.
