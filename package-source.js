// Package source code for Mozilla review
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📦 Packaging source code for Mozilla review...\n');

// 1. Create packages directory if it doesn't exist
const packagesDir = path.join(__dirname, 'packages');
if (!fs.existsSync(packagesDir)) {
  fs.mkdirSync(packagesDir);
}

// 2. Read version from package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
const version = packageJson.version;

// 3. Create source ZIP file
console.log('1. Creating source code archive...');
const sourceZipName = `job-application-analyzer-v${version}-source.zip`;
const sourceZipPath = path.join(packagesDir, sourceZipName);

// Remove old source ZIP if exists
if (fs.existsSync(sourceZipPath)) {
  fs.unlinkSync(sourceZipPath);
}

// Files and folders to include
const filesToInclude = [
  'src/',
  'public/',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'vite.config.ts',
  'postcss.config.js',
  'postbuild.js',
  'create-icons.js',
  'BUILD_INSTRUCTIONS.md',
  'README.md',
  'LICENSE',
  '.gitignore'
];

// Create ZIP with specific files (exclude node_modules, dist, etc.)
try {
  const fileList = filesToInclude.join(' ');
  execSync(`zip -r "${sourceZipPath}" ${fileList} -x "*.git*" "node_modules/*" "dist/*" "packages/*" ".DS_Store"`, {
    stdio: 'inherit',
    cwd: __dirname
  });
  console.log(`✅ Source archive created: ${sourceZipName}`);
} catch (error) {
  console.error('❌ Failed to create source ZIP.');
  console.error('   Make sure zip is installed: sudo apt-get install zip');
  process.exit(1);
}

// 4. Verify ZIP contents
console.log('\n2. Verifying source archive contents...');
execSync(`unzip -l "${sourceZipPath}" | head -30`, { stdio: 'inherit' });

// 5. Get file size
const stats = fs.statSync(sourceZipPath);
const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

console.log('\n✅ Source code packaged successfully!');
console.log(`\n📦 Package Details:`);
console.log(`   Name: ${sourceZipName}`);
console.log(`   Location: packages/${sourceZipName}`);
console.log(`   Size: ${sizeMB} MB`);
console.log(`   Version: ${version}`);
console.log('\n📤 Upload this file to Mozilla when asked for source code');
console.log('   Also include BUILD_INSTRUCTIONS.md (already in the ZIP)');
