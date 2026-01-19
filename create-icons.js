// Simple script to create placeholder SVG icons and convert them to PNG
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SVG icon template with purple theme
const createSVG = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8B35D9;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2E0854;stop-opacity:1" />
    </linearGradient>
  </defs>
  <!-- Background circle -->
  <circle cx="64" cy="64" r="58" fill="url(#grad)"/>
  <!-- Checkmark and document icon -->
  <g transform="translate(64, 64)">
    <!-- Document -->
    <rect x="-20" y="-25" width="30" height="40" rx="2" fill="white" opacity="0.9"/>
    <line x1="-15" y1="-18" x2="-5" y2="-18" stroke="#8B35D9" stroke-width="2" stroke-linecap="round"/>
    <line x1="-15" y1="-12" x2="-5" y2="-12" stroke="#8B35D9" stroke-width="2" stroke-linecap="round"/>
    <line x1="-15" y1="-6" x2="-5" y2="-6" stroke="#8B35D9" stroke-width="2" stroke-linecap="round"/>
    <!-- Checkmark -->
    <path d="M 5 -8 L 12 -1 L 25 -18" stroke="#10B981" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <!-- Small "JA" text -->
  <text x="64" y="105" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white" text-anchor="middle">JA</text>
</svg>`;

// Create icons directory
const iconsDir = path.join(__dirname, 'dist', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create SVG files
const sizes = [16, 48, 128];
for (const size of sizes) {
  const svg = createSVG(size);
  fs.writeFileSync(path.join(iconsDir, `icon${size}.svg`), svg);
  console.log(`Created icon${size}.svg`);
}

console.log('\n✅ Icon files created!');
console.log('Note: Firefox supports SVG icons directly.');
console.log('If you need PNG icons, use an SVG to PNG converter.');
