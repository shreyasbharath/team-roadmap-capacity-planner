# Team Roadmap Capacity Planner - Prompt Library

## Quick Start Prompts

### 🚀 Development Setup
```
I need to set up the Team Roadmap Capacity Planner for development. Walk me through the complete setup process including prerequisites, installation, and first run.
```

### 🔧 Add New Feature
```
I want to add a new feature to the roadmap planner: [DESCRIBE FEATURE]. Following the TDD approach and project architecture, help me:
1. Write failing tests first
2. Implement the feature
3. Ensure it integrates with the existing timeline/parsing system
```

### 🐛 Debug Timeline Issue
```
I'm experiencing timeline positioning issues where [DESCRIBE PROBLEM]. Help me debug this using the project's established patterns for handling visual positioning bugs. Focus on CSS property validation rather than DOM measurements.
```

### 📝 Markdown Parser Extension
```
I need to extend the markdown parser to support a new property: [PROPERTY NAME] with syntax [SYNTAX]. Help me:
1. Update the parsing logic in timelineParser.js
2. Add validation rules
3. Write tests for the new property
4. Update component rendering
```

## Testing & Quality Prompts

### 🧪 Write Tests (TDD Style)
```
Following the project's TDD philosophy, help me write comprehensive tests for [COMPONENT/FUNCTION]. Include:
1. Failing tests that define the behaviour
2. Edge cases and error conditions
3. Integration with timeline positioning logic
4. Visual regression considerations
```

### 🔍 Code Review
```
Review this code following the project's standards:
[PASTE CODE]

Check for:
- Single responsibility principle
- Domain-driven architecture adherence
- Proper React patterns
- Timeline positioning anti-patterns
- Test coverage requirements
```

### 🎯 Performance Analysis
```
Analyze the performance of [COMPONENT/FUNCTION] for large roadmaps (100+ items). Suggest optimizations following the project's patterns for:
- React rendering optimization
- Timeline calculation efficiency
- Memory usage
- DOM manipulation reduction
```

## Architecture & Design Prompts

### 🏗️ Component Design
```
I need to create a new component for [PURPOSE]. Following the project's component architecture:
1. Design the component hierarchy
2. Define props interface
3. Determine styling approach (Tailwind classes vs CSS-in-JS)
4. Plan integration with timeline system
5. Consider mobile responsiveness
```

### 📊 Domain Logic Design
```
I need to implement business logic for [BUSINESS REQUIREMENT]. Help me design this following the domain-driven architecture:
1. Where should this logic live (domain/ folder)
2. How to integrate with existing parsing
3. What validation rules are needed
4. How to make it testable
```

### 🎨 Visual Feature
```
I want to add a visual feature: [DESCRIBE VISUAL ELEMENT]. Help me implement this knowing the project's history of timeline positioning bugs:
1. How to handle positioning calculations
2. CSS strategy for cross-browser compatibility
3. Testing approach for visual elements
4. Mobile responsiveness considerations
```

## Data & Configuration Prompts

### 📄 Markdown Format Extension
```
I need to extend the roadmap markdown format to support [NEW REQUIREMENT]. Help me:
1. Design the markdown syntax
2. Update the grammar specification
3. Implement parsing logic
4. Add validation and error handling
5. Create example usage
```

### ⚙️ Configuration Enhancement
```
I want to add configuration for [FEATURE]. Following the project's patterns:
1. Where should config be defined
2. How to make it user-customizable
3. Default values and validation
4. Integration with existing config system
```

### 📈 Timeline Granularity
```
I need to add support for [NEW TIME GRANULARITY] (e.g., monthly, quarterly). Help me extend the adaptive timeline scaling system:
1. Update granularity detection logic
2. Add parsing support
3. Create header components
4. Update positioning calculations
```

## Deployment & Distribution Prompts

### 🌐 Web Deployment
```
Help me deploy the roadmap planner to [PLATFORM] (Netlify/Vercel/etc). Include:
1. Build optimization
2. Static file handling
3. PDF generation setup
4. Performance considerations
```

### 🖥️ Desktop Distribution
```
I need to build and distribute the desktop app for [PLATFORM]. Help me:
1. Configure Tauri for target platform
2. Set up signing/notarization (if needed)
3. Create installer packages
4. Test cross-platform compatibility
```

### 📦 CI/CD Pipeline
```
Help me set up CI/CD for this project with:
1. Automated testing (unit + visual regression)
2. Build validation for both web and desktop
3. Automated deployment
4. Performance regression detection
```

## Troubleshooting Prompts

### 🔴 Timeline Positioning Bug
```
Timeline bars are [DESCRIBE ISSUE: offset/clustered/misaligned]. This is the recurring positioning bug. Help me:
1. Identify the root cause
2. Fix the CSS calculations
3. Update tests to prevent regression
4. Verify across different zoom levels
```

### ⚡ Performance Issues
```
The app is slow when [DESCRIBE SCENARIO]. Help me optimize following the project's performance patterns:
1. Identify bottlenecks
2. Apply React optimization techniques
3. Optimize timeline calculations
4. Test with large datasets
```

### 🔧 Build Problems
```
I'm getting build errors: [PASTE ERROR]. Help me resolve this considering:
1. The React + Tauri setup
2. Cross-platform compatibility
3. Dependency conflicts
4. Configuration issues
```

### 📱 Mobile/Responsive Issues
```
The roadmap doesn't work properly on [DEVICE/SCREEN SIZE]. Help me fix the responsive design:
1. Identify CSS issues
2. Update Tailwind classes
3. Test touch interactions
4. Optimize for mobile timeline navigation
```

## Feature Development Prompts

### 📊 Progress Tracking
```
Implement progress tracking bars as described in the project docs. Help me:
1. Add progress parsing to markdown
2. Update component rendering
3. Design visual progress indicators
4. Add tests for progress calculation
```

### 🎨 Dark Mode
```
Add dark mode support to the roadmap planner. Following the project's Tailwind approach:
1. Set up theme switching
2. Update color schemes
3. Maintain visual hierarchy
4. Test across all components
```

### 🔄 Real-time Collaboration
```
I want to add real-time collaboration features. Help me design this considering:
1. The markdown-based data format
2. Conflict resolution strategies
3. WebSocket/Socket.io integration
4. State synchronization patterns
```

### 📤 Export Enhancements
```
Enhance the export functionality to support [FORMAT/FEATURE]. Help me:
1. Extend the export pipeline
2. Add new format support
3. Maintain PDF quality
4. Test across platforms
```

## Learning & Documentation Prompts

### 📚 Understanding Architecture
```
Explain the architecture of [SPECIFIC PART] in the roadmap planner. Help me understand:
1. How the components interact
2. Data flow patterns
3. Why certain design decisions were made
4. How to extend it properly
```

### 🎓 Best Practices
```
What are the best practices for [SPECIFIC ASPECT] in this project? Include:
1. Code organization patterns
2. Testing approaches
3. Common pitfalls to avoid
4. Performance considerations
```

### 📖 Create Documentation
```
Help me document [FEATURE/COMPONENT] following the project's documentation standards:
1. Usage examples
2. API reference
3. Architecture explanation
4. Troubleshooting guide
```

## Custom Usage Prompts

### 🏢 Enterprise Customization
```
I need to customize the roadmap planner for enterprise use with [SPECIFIC REQUIREMENTS]. Help me:
1. Identify customization points
2. Maintain upgrade compatibility
3. Add enterprise-specific features
4. Configure for organizational needs
```

### 🔌 Integration Development
```
I want to integrate with [EXTERNAL SYSTEM] (Jira/GitHub/etc). Help me:
1. Design the integration architecture
2. Handle data synchronization
3. Maintain the markdown format
4. Add authentication if needed
```

### 🎯 Industry-Specific Adaptation
```
Adapt the roadmap planner for [INDUSTRY/USE CASE]. Help me:
1. Customize terminology and concepts
2. Add domain-specific features
3. Update example templates
4. Configure appropriate defaults
```

## Usage Tips

### 🎯 Effective Prompting
- **Be Specific**: Include exact error messages, file names, or requirements
- **Provide Context**: Mention which part of the system you're working on
- **Reference Architecture**: The prompts assume knowledge of the project's domain-driven design
- **Include Code**: Paste relevant code snippets for better assistance

### 🔄 Follow-up Patterns
- "Continue with the next step"
- "Now help me test this implementation"
- "How do I integrate this with the existing [COMPONENT]?"
- "What are the performance implications of this approach?"

### 📋 Prompt Chaining
Many complex tasks benefit from chaining prompts:
1. Start with architecture/design prompt
2. Follow with implementation prompt
3. Add testing prompt
4. Finish with integration/documentation prompt