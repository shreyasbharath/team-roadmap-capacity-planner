#!/bin/bash

echo "🚀 Setting up Tauri for team-roadmap-capacity-planner"
echo "=================================================="

# First, let's install Tauri CLI
echo "📦 Installing Tauri CLI..."
cargo install tauri-cli

# Install Tauri dependencies for the frontend
echo "📦 Installing Tauri frontend dependencies..."
pnpm add -D @tauri-apps/cli @tauri-apps/api

# Initialize Tauri in the project
echo "🔧 Initializing Tauri..."
cargo tauri init

echo ""
echo "✅ Tauri setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Review the generated src-tauri/tauri.conf.json"
echo "2. Run 'cargo tauri dev' to start development mode"
echo "3. Run 'cargo tauri build' to create production builds"
echo ""
echo "📁 New files created:"
echo "- src-tauri/ directory with Rust backend"
echo "- src-tauri/tauri.conf.json (main configuration)"
echo "- src-tauri/build.rs (build script)"
echo "- src-tauri/Cargo.toml (Rust dependencies)"
echo "- src-tauri/src/main.rs (Rust main entry point)"
