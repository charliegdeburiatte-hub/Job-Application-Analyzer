# Installation Guide - Job Application Analyzer 🤘

## Quick Start

### 1. Build the Extension

```bash
npm install
npm run build
```

This will:
- Compile TypeScript
- Bundle with Vite
- Create icons
- Generate the `dist/` folder ready for Firefox

### 2. Load in Firefox

**Option A: Temporary Installation (for development/testing)**

1. Open Firefox
2. Navigate to `about:debugging#/runtime/this-firefox`
3. Click **"Load Temporary Add-on..."**
4. Navigate to the `dist/` folder
5. Select the `manifest.json` file
6. Click **"Open"**

✅ The extension is now loaded!

**Option B: Permanent Installation (requires signing)**

For permanent installation, you'll need to:
1. Create an account at [addons.mozilla.org](https://addons.mozilla.org)
2. Submit the extension for review
3. Get it signed by Mozilla

## First Time Setup

After installing the extension:

1. **Click the extension icon** in your Firefox toolbar (look for the purple "JA" icon)
2. **Go to the "CV" tab**
3. **Upload your CV** (.docx format)
4. The extension will automatically extract your skills
5. **Review the extracted skills** and adjust if needed

## Using the Extension

### Analyzing Jobs

1. Visit a job posting on:
   - **LinkedIn**: `linkedin.com/jobs/view/...`
   - **Indeed**: `indeed.com/viewjob...`
   - **Reed**: `reed.co.uk/jobs/...`

2. The extension will:
   - ✅ Automatically detect the job page
   - 📊 Analyze against your CV
   - 🏷️ Show match score in the extension badge

3. **Click the extension icon** to see:
   - Match percentage
   - Recommendation (Apply/Maybe/Pass)
   - Matched skills
   - Missing skills
   - Your strengths and gaps

### Tracking Applications

- Mark jobs as **"Applied"** or **"Rejected"**
- View all analyzed jobs in the **"History"** tab
- Search and filter by status

### Customizing

Go to the **"Settings"** tab to:
- 🎨 Choose theme: **Black Sabbath Purple** 🤘 or **Professional Purple** 💼
- 🌗 Toggle dark mode
- ⚙️ Configure auto-detection
- 📊 Set match threshold
- 🌐 Enable/disable specific job sites

## Troubleshooting

### Extension not detecting jobs?

1. Check that the job site is enabled in **Settings**
2. Make sure you're on a job detail page (not search results)
3. Try refreshing the page

### No skills extracted from CV?

1. Make sure your CV is in **.docx format** (not PDF)
2. Check that your CV has a clear skills section
3. You can manually add skills in the CV tab

### Extension not loading?

1. Check the browser console for errors (`F12`)
2. Make sure manifest.json is in the dist folder
3. Try reloading the extension from `about:debugging`

## Development

### Hot Reload (Development Mode)

```bash
npm run dev
```

This watches for changes and rebuilds automatically. You'll need to reload the extension in Firefox after changes.

### Debugging

- **Background Script**: Check logs in `about:debugging`
- **Content Script**: Check logs in the page's console (`F12`)
- **Popup**: Right-click the extension icon → Inspect

## File Structure

```
dist/
├── manifest.json          # Extension manifest
├── icons/                 # Extension icons (SVG)
├── src/
│   └── popup/
│       └── index.html     # Popup UI
├── background/
│   └── index.js           # Background service worker
├── content/
│   └── index.js           # Content script (job detector)
├── assets/
│   └── index.css          # Bundled CSS with themes
└── chunks/                # JavaScript bundles
```

## Supported Job Sites

- ✅ LinkedIn
- ✅ Indeed
- ✅ Reed

More sites coming in Phase 2!

## System Requirements

- **Browser**: Firefox 109+
- **Node.js**: 18+ (for building)
- **CV Format**: .docx (Microsoft Word)

## Privacy

- ✅ Your CV stays on your device (stored locally in Firefox)
- ✅ No data sent to external servers
- ✅ No analytics or tracking
- ✅ Open source code

## Support

Having issues? Check:
- README.md for general info
- HLD.md for technical architecture
- GitHub Issues (if available)

---

**Happy Job Hunting!** 🎯

Built with 🤘 by Charlie
