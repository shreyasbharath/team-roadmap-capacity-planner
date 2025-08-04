# Release Process

## Automated Releases

The Team Roadmap Capacity Planner uses GitHub Actions for automated cross-platform releases.

### Triggering Releases

#### 1. Manual Release (Recommended)
Go to GitHub Actions → Release and Build Cross-Platform Apps → Run workflow
- Choose release type: `patch`, `minor`, or `major`
- Creates release with desktop apps for macOS, Windows, and Linux

#### 2. Automatic Release (Version Bump)
Push a commit that changes the version in `package.json`:
```bash
pnpm release:patch   # 1.0.0 → 1.0.1
pnpm release:minor   # 1.0.0 → 1.1.0  
pnpm release:major   # 1.0.0 → 2.0.0
```

### What Gets Built

Each release creates:
- **macOS**: Universal `.dmg` installer and `.app` bundle
- **Windows**: `.msi` installer and standalone `.exe`
- **Linux**: `.AppImage` portable app and `.deb` package
- **Web**: Deployed to GitHub Pages (optional)

### Release Assets Naming

Files follow this pattern:
```
team-roadmap-planner_v1.2.3_universal.dmg      # macOS
team-roadmap-planner_v1.2.3_x86_64.msi         # Windows
team-roadmap-planner_v1.2.3_x86_64.AppImage    # Linux
team-roadmap-planner_v1.2.3_x86_64.deb         # Linux
```

## Quality Gates

All releases must pass:
- ✅ ESLint code quality checks
- ✅ Timeline bar regression tests (critical visual bugs)
- ✅ Full Vitest test suite
- ✅ Web bundle build verification
- ✅ Cross-platform desktop compilation

## Manual Testing Checklist

Before releasing, verify:
- [ ] Timeline bars align correctly at all zoom levels
- [ ] Save/load file operations work properly
- [ ] PDF export generates correct output
- [ ] Markdown editor syncs with preview
- [ ] Team capacity visualization displays correctly
- [ ] Responsive design works on different screen sizes

## Rollback Process

If a release has issues:
1. Delete the GitHub release
2. Fix the issue in a new commit
3. Create a new patch release
4. Update documentation as needed

## Version Strategy

Follow semantic versioning:
- **Patch** (1.0.1): Bug fixes, minor improvements
- **Minor** (1.1.0): New features, non-breaking changes  
- **Major** (2.0.0): Breaking changes, major redesigns

## Distribution

Users can download from:
- GitHub Releases page (all platforms)
- Direct links in README
- GitHub Pages web version (optional)

## Troubleshooting

### Build Failures
- Check Rust toolchain compatibility
- Verify platform-specific dependencies
- Review Tauri configuration

### Missing Artifacts
- Confirm all platforms completed successfully
- Check artifact upload/download steps
- Verify file naming patterns

### Release Notes
Automatically generated from:
- Git commits since last release
- Manual changelog entries
- Installation instructions
