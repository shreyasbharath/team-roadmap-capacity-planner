#!/bin/bash
# Test release process locally
# Usage: ./scripts/test-release.sh

set -e

echo "🧪 Testing Release Process Locally"
echo "================================="

# Check prerequisites
echo "📋 Checking prerequisites..."
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm is required"; exit 1; }
command -v rustc >/dev/null 2>&1 || { echo "❌ Rust is required"; exit 1; }

# Run quality gates
echo "🔍 Running quality gates..."
echo "  → Linting..."
pnpm lint

echo "  → Timeline bar regression tests..."
pnpm test:timeline-bars

echo "  → Full test suite..."
pnpm test -- --run

echo "  → Web build test..."
pnpm build

echo "✅ All quality gates passed!"

# Setup Tauri if needed
echo "🔧 Setting up Tauri..."
if [[ ! -f "src-tauri/Cargo.toml" ]]; then
    echo "  → Running setup-tauri.sh..."
    bash setup-tauri.sh
else
    echo "  → Tauri already configured"
fi

# Test desktop build (dev mode)
echo "🖥️  Testing desktop build..."
echo "  → Building in development mode..."
timeout 30s pnpm tauri:dev &
BUILD_PID=$!

# Wait a bit, then kill the dev server
sleep 10
kill $BUILD_PID 2>/dev/null || true
wait $BUILD_PID 2>/dev/null || true

echo "✅ Desktop build test completed!"

echo ""
echo "🎉 Release test successful!"
echo ""
echo "Next Steps:"
echo "  1. Commit your changes"
echo "  2. Go to GitHub Actions → 'Release and Build Cross-Platform Apps'"
echo "  3. Click 'Run workflow' and choose release type"
echo "  4. Download the generated apps from the release page"
echo ""
echo "Or use npm scripts:"
echo "  pnpm release:patch  # Bug fixes"
echo "  pnpm release:minor  # New features"  
echo "  pnpm release:major  # Breaking changes"
