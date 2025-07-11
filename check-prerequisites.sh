#!/bin/bash

echo "🔍 Checking Tauri prerequisites..."

# Check if Rust is installed
if command -v rustc &> /dev/null; then
    echo "✅ Rust is installed: $(rustc --version)"
else
    echo "❌ Rust is not installed"
    echo "   Install from: https://rustup.rs/"
    echo "   Or run: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
fi

# Check if Cargo is installed
if command -v cargo &> /dev/null; then
    echo "✅ Cargo is installed: $(cargo --version)"
else
    echo "❌ Cargo is not installed (should come with Rust)"
fi

# Check Node.js version
if command -v node &> /dev/null; then
    echo "✅ Node.js is installed: $(node --version)"
else
    echo "❌ Node.js is not installed"
fi

# Check pnpm
if command -v pnpm &> /dev/null; then
    echo "✅ pnpm is installed: $(pnpm --version)"
else
    echo "❌ pnpm is not installed"
fi

echo ""
echo "🎯 Ready to install Tauri CLI and initialize your project!"
