// Package extension for Firefox Add-ons store submission
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📦 Packaging extension for Firefox Add-ons store...\n');

// 1. Ensure we have a clean build
console.log('1. Running production build...');
execSync('npm run build', { stdio: 'inherit' });

// 2. Read version from manifest
const manifestPath = path.join(__dirname, 'dist', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const version = manifest.version;

// 3. Create packages directory if it doesn't exist
const packagesDir = path.join(__dirname, 'packages');
if (!fs.existsSync(packagesDir)) {
  fs.mkdirSync(packagesDir);
}

// 4. Create ZIP file
console.log('\n2. Creating ZIP archive...');
const zipName = `job-application-analyzer-v${version}.zip`;
const zipPath = path.join(packagesDir, zipName);

// Remove old ZIP if exists
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

// Create ZIP using system zip command
try {
  const distPath = path.join(__dirname, 'dist');
  execSync(`cd "${distPath}" && zip -r "${zipPath}" .`, { stdio: 'inherit' });
  console.log(`✅ Package created: ${zipName}`);
} catch (error) {
  console.error('❌ Failed to create ZIP. Make sure zip is installed.');
  console.error('   Install: sudo apt-get install zip');
  process.exit(1);
}

// 5. Verify ZIP contents
console.log('\n3. Verifying package contents...');
execSync(`unzip -l ${zipPath} | head -20`, { stdio: 'inherit' });

// 6. Get file size
const stats = fs.statSync(zipPath);
const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

console.log('\n✅ Extension packaged successfully!');
console.log(`\n📦 Package Details:`);
console.log(`   Name: ${zipName}`);
console.log(`   Location: packages/${zipName}`);
console.log(`   Size: ${sizeMB} MB`);
console.log(`   Version: ${version}`);
console.log('\n📤 Ready for submission to addons.mozilla.org');
console.log('   See PUBLISHING.md for submission instructions');
