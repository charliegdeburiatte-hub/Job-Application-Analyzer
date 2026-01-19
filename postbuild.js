// Post-build script to finalize the extension
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📦 Running post-build tasks...\n');

// 1. Create icons
console.log('1. Creating icons...');
execSync('node create-icons.js', { stdio: 'inherit' });

// 2. Copy manifest
console.log('\n2. Copying manifest.json...');
const manifestSrc = path.join(__dirname, 'public', 'manifest.json');
const manifestDest = path.join(__dirname, 'dist', 'manifest.json');
fs.copyFileSync(manifestSrc, manifestDest);
console.log('✅ Manifest copied');

// 3. Update manifest paths for built files
console.log('\n3. Updating manifest paths...');
const manifest = JSON.parse(fs.readFileSync(manifestDest, 'utf8'));

// Check if the popup HTML exists in the expected location
const popupPath = path.join(__dirname, 'dist', 'src', 'popup', 'index.html');
if (fs.existsSync(popupPath)) {
  manifest.action.default_popup = 'src/popup/index.html';
} else {
  manifest.action.default_popup = 'popup.html';
}

// Update background scripts path
manifest.background.scripts = ['background.js'];

// Update content scripts path
manifest.content_scripts[0].js = ['content.js'];

// Update icon paths to use SVG
manifest.icons = {
  "16": "icons/icon16.svg",
  "48": "icons/icon48.svg",
  "128": "icons/icon128.svg"
};
manifest.action.default_icon = manifest.icons;

fs.writeFileSync(manifestDest, JSON.stringify(manifest, null, 2));
console.log('✅ Manifest paths updated');

console.log('\n✅ Post-build complete!');
console.log('\n📍 Extension ready in: dist/');
console.log('   Load in Firefox from: about:debugging#/runtime/this-firefox');
