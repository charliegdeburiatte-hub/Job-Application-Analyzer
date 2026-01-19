# Job Application Analyzer 🤘

A Firefox browser extension that analyzes job postings against your CV and provides intelligent match scores and recommendations.

## Features

- **Automatic Job Detection**: Automatically detects job postings on LinkedIn, Indeed, and Reed
- **CV Analysis**: Upload your CV (DOCX format) for automatic skill extraction
- **Match Scoring**: Get instant match percentages and recommendations (Apply/Maybe/Pass)
- **Skill Comparison**: See matched and missing skills at a glance
- **Application Tracking**: Track jobs you've analyzed with status updates
- **Dual Themes**: Choose between Black Sabbath Purple 🤘 or Professional Purple 💼
- **Dark Mode**: Full dark mode support

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS 4 with custom themes
- **State Management**: Zustand
- **Build Tool**: Vite
- **Document Parsing**: mammoth.js (DOCX)
- **Browser API**: WebExtension API (Firefox)

## Project Structure

```
Job-Application-Analyzer/
├── src/
│   ├── background/          # Background service worker
│   │   └── index.ts
│   ├── content/             # Content scripts
│   │   └── detector.ts
│   ├── popup/               # Extension popup UI
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── options/             # Options page
│   │   └── OptionsPage.tsx
│   └── shared/              # Shared utilities
│       ├── types/
│       ├── utils/
│       └── constants.ts
├── public/
│   ├── icons/              # Extension icons
│   └── manifest.json       # Extension manifest
├── dist/                   # Build output
├── HLD.md                  # High-level design document
├── DESIGN_PLAN.md          # Design specifications
└── clinerules.md           # Development guidelines
```

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Firefox Browser (for testing)

### Installation

1. Clone the repository:
```bash
cd Job-Application-Analyzer
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load the extension in Firefox:
   - Open Firefox
   - Navigate to `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on"
   - Select the `manifest.json` file from the `public/` directory
   - OR select any file from the `dist/` directory after building

### Development Mode

For development with auto-rebuild:

```bash
npm run dev
```

This will watch for changes and rebuild automatically.

### Build for Production

```bash
npm run build
```

The built extension will be in the `dist/` directory.

## Usage

### First Time Setup

1. Install the extension in Firefox
2. Click the extension icon in your toolbar
3. Navigate to the "CV" tab
4. Upload your CV (DOCX format)
5. The extension will automatically extract your skills

### Analyzing Jobs

1. Visit a job posting on:
   - LinkedIn (`linkedin.com/jobs/view/...`)
   - Indeed (`indeed.com/viewjob...`)
   - Reed (`reed.co.uk/jobs/...`)

2. The extension will:
   - Automatically detect the job page
   - Extract job details and requirements
   - Analyze against your CV
   - Show match score in the extension badge

3. Click the extension icon to see:
   - Match percentage (0-100%)
   - Recommendation (Apply/Maybe/Pass)
   - Matched skills
   - Missing skills
   - Your strengths for this role
   - Gaps to address

### Tracking Applications

- Mark jobs as "Applied" or "Rejected"
- View history of all analyzed jobs
- Search and filter by status or match score

### Settings

- Choose color theme (Black Sabbath 🤘 or Professional 💼)
- Toggle dark mode
- Configure auto-detection
- Set minimum match threshold
- Enable/disable job sites
- Manage data retention

## Color Themes

### Black Sabbath Purple 🤘
Deep, bold purple tones inspired by rock aesthetics:
- Primary: `#8B35D9` (Deep Purple)
- Dark: `#2E0854` (Almost Black Purple)

### Professional Purple 💼
Clean, modern purple for wider appeal:
- Primary: `#A855F7` (Purple 500)
- Dark: `#7C3AED` (Purple 700)

Both themes support light and dark modes!

## Architecture

### Components

1. **Content Script** (`detector.ts`): Runs on job site pages, detects jobs, extracts data
2. **Background Worker** (`background/index.ts`): Coordinates analysis, manages storage, updates badge
3. **Popup UI** (`popup/`): Main user interface with React components
4. **Storage**: Uses Firefox storage API (local for CV/jobs, sync for settings)

### Analysis Algorithm

Phase 1 (Current): Basic skill matching
- Extracts skills from job description
- Compares against CV skills
- Calculates match percentage
- Categorizes as Required/Preferred
- Generates recommendation

Phase 2 (Planned): Experience matching, AI-powered analysis

## Phase 1 MVP - Completed ✅

- [x] Project setup (Vite + React + TypeScript)
- [x] Extension manifest configuration
- [x] Basic popup UI with tabs
- [x] CV upload (DOCX parsing with mammoth.js)
- [x] Skill extraction from CV and job descriptions
- [x] Basic matching algorithm
- [x] Analysis result display with match score
- [x] Job detection (LinkedIn, Indeed, Reed)
- [x] Content script integration
- [x] Background service worker
- [x] Storage utilities
- [x] Dual purple themes + dark mode
- [x] Settings page
- [x] Job history tracking

## Roadmap

### Phase 2: Enhanced Features
- [ ] Advanced content-based job detection
- [ ] Experience matching against job requirements
- [ ] Full application tracking (interview dates, offers)
- [ ] Search and filter in history
- [ ] Auto-parse CV sections (experience, education)
- [ ] Export job data

### Phase 3: AI Integration
- [ ] Claude API for advanced analysis
- [ ] CV optimization suggestions
- [ ] Tailored CV generation per job
- [ ] Cover letter generation

## Browser Compatibility

Currently supports:
- ✅ Firefox (Manifest V3)

Planned:
- ⏳ Chrome/Edge (requires compatibility layer)

## Contributing

This is a personal portfolio project, but suggestions and bug reports are welcome!

## License

MIT License - see LICENSE file for details

## Author

Built by Charlie 🤘

## Acknowledgments

- Inspired by the need for data-driven job applications
- Black Sabbath for the color inspiration 🎸
- The job-seeking developer community

---

**Happy Job Hunting!** 🎯
