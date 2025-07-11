#!/usr/bin/env node

// Simple script to create a basic PNG icon
const fs = require('fs');
const path = require('path');

// Create a simple SVG that can be converted to PNG
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#2563eb" rx="64"/>
  <path d="M128 160h256v32H128zM128 224h192v32H128zM128 288h128v32H128z" fill="white"/>
  <circle cx="384" cy="352" r="48" fill="white"/>
  <text x="256" y="440" font-family="Arial, sans-serif" font-size="48" fill="white" text-anchor="middle">RP</text>
</svg>`;

// Ensure icons directory exists
const iconsDir = path.join(process.cwd(), 'src-tauri', 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Write the SVG file
fs.writeFileSync(path.join(iconsDir, 'icon.svg'), iconSvg);

console.log('✅ Created basic SVG icon');
console.log('🎯 Now run: pnpm tauri icon src-tauri/icons/icon.svg');
console.log('   Or try: pnpm tauri:dev');
