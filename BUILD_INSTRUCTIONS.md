# Build Instructions for Mozilla Reviewers

This document explains how to build the Job Application Analyzer Firefox extension from source code.

## Prerequisites

- **Node.js**: v18 or higher (tested with v18.x)
- **npm**: v9 or higher
- **Operating System**: Linux, macOS, or Windows

## Build Steps

### 1. Install Dependencies

```bash
npm install
```

This installs all required dependencies listed in `package.json`, including:
- React 19.2.3
- TypeScript 5.9.3
- Vite 7.3.1
- Tailwind CSS 4.1.18
- And all devDependencies

### 2. Build the Extension

```bash
npm run build
```

This command:
1. Runs TypeScript compiler (`tsc`) to check types
2. Runs Vite build process which:
   - Compiles TypeScript to JavaScript
   - Transforms React JSX to JavaScript
   - Processes Tailwind CSS
   - Bundles all modules using Rollup
   - Minifies code for production
   - Outputs to `dist/` folder
3. Runs `postbuild.js` which:
   - Creates SVG icons
   - Copies and updates manifest.json
   - Fixes file paths for Firefox

### 3. Verify Build Output

The built extension will be in the `dist/` folder with this structure:

```
dist/
├── manifest.json          # Extension manifest
├── background.js          # Background service worker
├── content.js            # Content script for job pages
├── popup.js              # Popup UI (React app)
├── options.js            # Options page
├── index.css             # Tailwind CSS output
├── icons/                # SVG icons
│   ├── icon16.svg
│   ├── icon48.svg
│   └── icon128.svg
└── src/
    ├── popup/
    │   └── index.html    # Popup HTML
    └── options/
        └── index.html    # Options HTML
```

### 4. Load Extension in Firefox

To test the built extension:

1. Open Firefox
2. Go to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Navigate to `dist/` folder
5. Select `manifest.json`

## Build Process Details

### TypeScript Compilation

TypeScript files in `src/` are compiled according to `tsconfig.json` settings:
- Target: ES2020
- Strict mode enabled
- Module: ESNext
- Types: React, Node, Firefox WebExtensions

### Vite Build Configuration

See `vite.config.ts` for build configuration:

```typescript
{
  plugins: [react(), postbuildPlugin()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: 'src/popup/index.html',
        background: 'src/background/index.ts',
        content: 'src/content/detector.ts',
        options: 'src/options/index.html',
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].[hash].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
  base: './',
}
```

### Tailwind CSS Processing

CSS is processed using:
- `@tailwindcss/postcss` plugin (Tailwind CSS 4.x)
- Configuration in `src/popup/index.css` using `@theme` directive
- PostCSS config in `postcss.config.js`

### Post-Build Script

The `postbuild.js` script runs automatically after Vite build:
1. Creates SVG icons using Node.js fs module
2. Copies `public/manifest.json` to `dist/manifest.json`
3. Updates manifest paths to match Vite output structure

## Reproducible Build

To ensure a reproducible build:

1. **Clean build:**
   ```bash
   rm -rf node_modules dist
   npm install
   npm run build
   ```

2. **Verify output:**
   - All JavaScript files should be in `dist/` root
   - Manifest should reference correct file paths
   - Icons should be in `dist/icons/`

3. **Compare with submitted extension:**
   - Unzip the submitted `.xpi` or `.zip` file
   - Compare file structure with `dist/` folder
   - File contents should match exactly

## Expected Build Time

- `npm install`: ~30-60 seconds (depends on internet speed)
- `npm run build`: ~5-10 seconds

## Troubleshooting

### Build fails with TypeScript errors

Make sure Node.js version is 18 or higher:
```bash
node --version
```

### Missing dependencies

Delete `node_modules` and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Output differs from submitted version

Make sure you're using the same Node.js and npm versions:
- Node.js: v18.x or higher
- npm: v9.x or higher

## Source Code Structure

```
src/
├── background/
│   └── index.ts           # Background service worker
├── content/
│   └── detector.ts        # Job page detection and extraction
├── popup/
│   ├── index.html         # Popup entry point
│   ├── index.css          # Tailwind CSS styles
│   ├── App.tsx            # Main React app
│   ├── components/        # React components
│   ├── hooks/             # React hooks
│   └── store/             # Zustand state management
├── options/
│   └── index.html         # Options page
└── shared/
    ├── types/             # TypeScript type definitions
    ├── utils/             # Utility functions
    └── constants.ts       # App constants

public/
└── manifest.json          # Source manifest (copied to dist)
```

## Dependencies Explanation

### Production Dependencies
- **mammoth**: Parse DOCX CV files
- **react**: UI library
- **react-dom**: React DOM renderer
- **zustand**: State management

### Development Dependencies
- **@vitejs/plugin-react**: Vite React support
- **vite**: Build tool
- **typescript**: TypeScript compiler
- **tailwindcss**: CSS framework
- **@tailwindcss/postcss**: Tailwind CSS 4 PostCSS plugin
- **@types/***: TypeScript type definitions

## No External Services

This extension:
- Does NOT make external API calls
- Does NOT transmit data to any servers
- Processes everything locally in the browser
- Only reads job pages on LinkedIn, Indeed, and Reed

## License

MIT License - See LICENSE file

## Contact

For build questions, please contact the developer via the support email provided in the extension listing.
