# Development Guide

## Live Development Workflow

Your extension is now set up for live development with automatic reloading!

### Quick Start

1. **Run the development server:**
   ```bash
   npm run dev
   ```

   This will:
   - Start Vite in watch mode (rebuilds on file changes)
   - Launch Firefox with the extension loaded
   - Auto-reload the extension when files change

2. **Make changes to your code:**
   - Edit any file in `src/`
   - Vite will detect changes and rebuild automatically
   - Firefox will reload the extension automatically
   - See your changes instantly!

3. **View console logs:**
   - Background script console: Check the terminal where you ran `npm run dev`
   - Popup console: Right-click extension icon → Inspect
   - Content script console: F12 on job pages

### Development Scripts

- `npm run dev` - Full development mode with auto-reload
- `npm run dev:watch` - Just watch and rebuild (no Firefox)
- `npm run dev:firefox` - Just run Firefox with extension
- `npm run build` - Production build

### How It Works

**When you run `npm run dev`:**

1. **Vite Watch Mode** (`dev:watch`):
   - Watches all files in `src/`
   - Rebuilds TypeScript + React on changes
   - Runs `postbuild.js` automatically after each build
   - Updates files in `dist/`

2. **Web-ext** (`dev:firefox`):
   - Launches Firefox with extension loaded from `dist/`
   - Watches `dist/` folder for changes
   - Auto-reloads extension when files change
   - Opens browser console for debugging

3. **Concurrently**:
   - Runs both processes simultaneously
   - Shows output from both in a single terminal

### Making Changes

#### Edit React Components
```bash
# Edit any component
src/popup/components/AnalysisView.tsx
# Vite rebuilds → Extension reloads → See changes in popup
```

#### Edit Background Script
```bash
# Edit background logic
src/background/index.ts
# Vite rebuilds → Extension reloads → New background script loaded
```

#### Edit Content Scripts
```bash
# Edit job detection
src/content/detector.ts
# Vite rebuilds → Extension reloads → Refresh job page to see changes
```

#### Edit Styles
```bash
# Edit Tailwind styles
src/popup/index.css
# Vite rebuilds → Extension reloads → New styles applied
```

### Tips

- **Keep the terminal open** - You'll see build output and errors
- **Watch for build errors** - They appear in the terminal
- **Check both consoles** - Background scripts log to terminal, popup/content to browser console
- **Refresh job pages** - After content script changes, refresh the page
- **Use React DevTools** - Install React DevTools extension for debugging

### Debugging

**Background Script Errors:**
```bash
# Check terminal output where you ran npm run dev
# Or click "Inspect" in about:debugging
```

**Popup Errors:**
```bash
# Right-click extension icon → Inspect
# Check Console tab
```

**Content Script Errors:**
```bash
# Open job page (LinkedIn, Indeed, Reed)
# Press F12 → Console tab
# Look for [Job Analyzer] logs
```

### Production Build

When ready to test the production version:
```bash
npm run build
```

Then load `dist/` in Firefox from `about:debugging#/runtime/this-firefox`

### Troubleshooting

**Extension not reloading?**
- Check terminal for build errors
- Manually reload in about:debugging if needed
- Make sure both processes are running

**Changes not appearing?**
- Wait for "build complete" in terminal
- Check for TypeScript errors
- For content scripts, refresh the page

**Port conflicts?**
- web-ext uses port 6000 by default
- Kill other processes if needed: `pkill -f web-ext`

---

Happy coding! 🎉
