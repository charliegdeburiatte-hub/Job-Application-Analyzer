# Job Application Analyzer

<div align="center">

![Version](https://img.shields.io/badge/version-1.4.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Firefox](https://img.shields.io/badge/Firefox-Manifest%20V3-orange.svg)
![Tests](https://img.shields.io/badge/tests-73%20passing-success.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)

**An intelligent Firefox extension that analyzes job postings against your CV using advanced weighted scoring algorithms.**

[Features](#features) • [Installation](#installation) • [Tech Stack](#tech-stack) • [Architecture](#architecture) • [Development](#development)

</div>

---

## 🎯 Overview

Job Application Analyzer is a production-ready browser extension that transforms the job application process through automated analysis and intelligent scoring. Built with modern web technologies and rigorous testing practices, it provides data-driven insights to help job seekers make informed decisions.

**Key Differentiators:**
- 🧠 **Weighted Scoring Algorithm**: Required skills weighted 3x more than preferred skills
- 📊 **Comprehensive Testing**: 73 unit tests with Vitest, E2E tests with Playwright
- 🎨 **Professional UI/UX**: Dark mode support, responsive design, accessibility-focused
- 💾 **Intelligent Caching**: Analysis results cached to minimize redundant computation
- 🔄 **Real-time Detection**: Content scripts detect job pages on LinkedIn, Indeed, and Reed
- 📈 **Export Functionality**: Export analysis history to JSON, CSV, or Markdown

---

## ✨ Features

### Core Functionality

#### 🤖 Automatic Job Detection
- Real-time detection of job postings on major platforms (LinkedIn, Indeed, Reed)
- Intelligent content extraction using site-specific selectors
- Handles single-page application navigation and dynamic content loading
- Debounced mutation observer to prevent redundant analysis

#### 📄 CV Analysis
- Upload CV in DOCX format with automatic skill extraction
- Parses experience, education, and certifications
- Filters self-employment periods for accurate experience calculation
- Supports 200+ technical and soft skills from comprehensive skill database

#### 🎯 Intelligent Scoring
```
Match Score = (Weighted Skill Score + Experience Bonus)
```
- **Weighted Skill Matching**: Required skills (3x weight) vs Preferred skills (1x weight)
- **Experience Bonus**: Up to +20 points based on years of experience
- **Precision Scoring**: Maintains decimal precision throughout calculation (v1.4.0 fix)
- **Smart Recommendations**: Apply (≥70%), Maybe (50-69%), Pass (<50%)

#### 📊 Analysis Results
- **Match Percentage**: 0-100% score with visual circular progress indicator
- **Skill Breakdown**:
  - Matched skills (categorized by Frontend, Backend, Tools, Soft Skills)
  - Missing required/preferred skills
  - Strength areas and skill gaps
- **Scoring Details**: Transparent breakdown of base score and bonuses
- **Quick vs Detailed Views**: Toggle between compact and comprehensive analysis

#### 📝 Application Tracking
- Full history of analyzed jobs with filtering and sorting
- Status tracking: Analyzed, Applied, Rejected, Interviewing, Offer, Accepted
- Click jobs in history to view saved analysis (no re-fetching)
- Export history to JSON, CSV, or Markdown for external tracking

#### ⚙️ Advanced Settings
- **Analysis Preferences**: Quick vs Detailed view modes
- **Job Site Controls**: Enable/disable specific platforms
- **Data Management**: Configurable retention period (30-365 days)
- **Storage Monitoring**: Real-time usage breakdown with visual indicators
- **Theme Support**: Full dark mode with WCAG-compliant contrast ratios

---

## 🛠️ Tech Stack

### Frontend
- **React 19.2.3** - Modern UI with hooks and context
- **TypeScript 5.9.3** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling with custom theme
- **Zustand 5.0.3** - Lightweight state management

### Build & Development
- **Vite 7.3.1** - Fast builds with HMR
- **PostCSS 8.4.49** - CSS processing pipeline
- **ESLint** - Code quality enforcement

### Testing
- **Vitest 4.0.18** - Unit testing framework (73 tests passing)
- **Playwright 1.58.0** - E2E testing for browser automation
- **@faker-js/faker 10.2.0** - Test data generation

### Browser APIs & Libraries
- **WebExtension API** - Firefox Manifest V3
- **mammoth.js** - DOCX document parsing
- **lucide-react** - Icon library

---

## 🏗️ Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser Extension                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐ │
│  │   Content    │      │  Background  │      │   Popup   │ │
│  │   Scripts    │─────▶│   Worker     │◀─────│    UI     │ │
│  └──────────────┘      └──────────────┘      └───────────┘ │
│        │                      │                      │       │
│        │                      ▼                      │       │
│        │              ┌──────────────┐               │       │
│        │              │   Storage    │               │       │
│        │              │  (Local +    │◀──────────────┘       │
│        │              │    Sync)     │                       │
│        │              └──────────────┘                       │
│        │                                                      │
│        ▼                                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            Job Sites (LinkedIn, Indeed, Reed)         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Core Modules

#### 1. Content Script (`src/content/detector.ts`)
**Responsibilities:**
- Detect job postings using URL pattern matching
- Extract job data (title, company, description, requirements)
- Handle site-specific DOM structures and "Show More" buttons
- Debounce rapid page changes to prevent duplicate analysis

**Key Features:**
- MutationObserver with 500ms debounce for SPA navigation
- Exponential backoff retry for dynamic content loading
- Site-specific extraction strategies for LinkedIn, Indeed, Reed

#### 2. Background Service Worker (`src/background/index.ts`)
**Responsibilities:**
- Coordinate analysis workflow between content scripts and popup
- Manage storage operations (CV, analyzed jobs, settings)
- Update extension badge with match scores
- Trigger browser notifications for new analyses

**Message Flow:**
```
Content Script → ANALYZE_JOB → Background → Analysis → Storage
                                    ↓
                              UPDATE_BADGE
                                    ↓
                            ANALYSIS_COMPLETE → Popup UI
```

#### 3. Popup UI (`src/popup/`)
**Component Hierarchy:**
```
App
├── TabNavigation
├── AnalysisView
│   ├── MatchScore
│   ├── SkillsList (with categorization)
│   └── ExportMenu
├── HistoryView
│   ├── FilterControls (status, date, sort)
│   └── JobCard[] (clickable)
├── CVView
│   └── FileUpload
└── SettingsView
    ├── ThemeToggle
    ├── StorageInfo
    └── ConfirmDialog
```

#### 4. Analysis Engine (`src/shared/utils/analysis.ts`)

**Weighted Scoring Algorithm:**
```typescript
// Phase 1: Extract skills from job description
requiredSkills = extractRequiredSkills(jobDescription)
preferredSkills = extractPreferredSkills(jobDescription)

// Phase 2: Match against CV skills
requiredMatched = cvSkills ∩ requiredSkills
preferredMatched = cvSkills ∩ preferredSkills

// Phase 3: Calculate weighted score
requiredScore = (requiredMatched / requiredTotal) × 3  // 3x weight
preferredScore = (preferredMatched / preferredTotal) × 1

baseScore = ((requiredScore + preferredScore) / (requiredTotal×3 + preferredTotal)) × 100

// Phase 4: Apply experience bonus
experienceBonus = min(20, yearsOfExperience × 2)

matchScore = min(100, round(baseScore + experienceBonus))
```

**Why This Algorithm:**
- **Weighted Required Skills**: Employers prioritize required skills 3:1 over preferred
- **Experience Matters**: Proven track record adds up to 20% boost
- **Prevents Gaming**: Capped at 100%, normalized against total possible weight
- **Decimal Precision**: v1.4.0 fix eliminates rounding errors throughout calculation

---

## 📦 Installation

### For Users

Install from [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/job-application-analyzer/) (auto-updates enabled)

### For Developers

#### Prerequisites
- Node.js 18+ and npm
- Firefox Browser 109+

#### Setup
```bash
# Clone repository
git clone https://github.com/charliegdeburiatte-hub/Job-Application-Analyzer.git
cd Job-Application-Analyzer

# Install dependencies
npm install

# Build for production
npm run build

# Load in Firefox
# 1. Open Firefox → about:debugging#/runtime/this-firefox
# 2. Click "Load Temporary Add-on"
# 3. Select any file from dist/ directory
```

#### Development Mode
```bash
# Watch mode with auto-rebuild
npm run dev

# Run unit tests
npm run test

# Run tests with UI
npm run test:ui

# Run E2E tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage
```

---

## 🧪 Testing

### Unit Tests (73 passing)

**Test Coverage:**
- ✅ Analysis algorithm (weighted scoring, rounding precision)
- ✅ CV parser (DOCX extraction, skill detection)
- ✅ Storage utilities (save, retrieve, delete)
- ✅ Bug regression tests (97% clustering bug, 8% scoring bug)
- ✅ Edge cases (empty CV, malformed job descriptions)

**Run Tests:**
```bash
npm run test        # Watch mode
npm run test:run    # Single run
npm run test:ui     # Visual UI
```

**Example Test:**
```typescript
describe('Weighted Scoring Algorithm', () => {
  it('should weight required skills 3x more than preferred', () => {
    const job = createJobWithSkills({
      required: ['Python', 'Linux'],
      preferred: ['Windows', 'Active Directory']
    });
    const cv = createCVWithSkills(['Windows', 'Active Directory']); // Only preferred

    const analysis = analyzeJob(job, cv);

    // Should score lower due to missing high-weight required skills
    expect(analysis.matchScore).toBeLessThan(50);
  });
});
```

### E2E Tests (Playwright)

**Test Scenarios:**
- Full user workflow (upload CV → analyze job → view history)
- Cross-browser compatibility checks
- Performance benchmarks

---

## 📁 Project Structure

```
Job-Application-Analyzer/
├── src/
│   ├── background/
│   │   └── index.ts              # Background service worker
│   ├── content/
│   │   └── detector.ts           # Job detection & extraction
│   ├── popup/
│   │   ├── components/
│   │   │   ├── AnalysisView.tsx  # Match score display
│   │   │   ├── HistoryView.tsx   # Job history with filters
│   │   │   ├── CVView.tsx        # CV upload interface
│   │   │   ├── SettingsView.tsx  # Settings & preferences
│   │   │   ├── ExportMenu.tsx    # Export to JSON/CSV/MD
│   │   │   ├── MatchScore.tsx    # Circular progress indicator
│   │   │   └── SkillsList.tsx    # Categorized skill display
│   │   ├── hooks/
│   │   │   ├── useTheme.ts       # Dark mode management
│   │   │   └── useMessaging.ts   # Extension messaging
│   │   ├── store/
│   │   │   └── index.ts          # Zustand state management
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── index.css             # Tailwind + custom styles
│   ├── shared/
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript definitions
│   │   ├── utils/
│   │   │   ├── analysis.ts       # Scoring algorithm
│   │   │   ├── cvParser.ts       # DOCX parsing
│   │   │   ├── storage.ts        # Browser storage wrapper
│   │   │   ├── exportAnalysis.ts # Export utilities
│   │   │   └── __tests__/        # Unit tests (73 tests)
│   │   ├── constants/
│   │   │   ├── skillCategories.ts
│   │   │   └── sectionPatterns.ts
│   │   └── constants.ts          # 200+ skill database
│   └── options/
│       └── OptionsPage.tsx       # Full-page settings
├── public/
│   ├── icons/                    # Extension icons (16/48/128)
│   └── manifest.json             # Firefox Manifest V3
├── packages/                     # Release artifacts
├── tests/                        # E2E tests (Playwright)
├── dist/                         # Build output
├── vite.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
└── package.json
```

---

## 🚀 Release History

### v1.4.0 (2026-01-27) - Critical Bug Fixes & UX Improvements
**Critical Fixes:**
- Fixed 97% score clustering bug caused by premature rounding
- Fixed dark mode contrast issues (Scoring Details, Settings, Export menu)
- Support Specialist 8% bug now scores correctly at 97%

**New Features:**
- History page: Click jobs to view saved analysis instead of opening URL
- Analysis persistence: Current analysis persists across popup opens/closes
- "New Job" button to clear current analysis and analyze new page

**Technical:**
- Removed premature Math.round() from base score calculations (lines 298, 311)
- Single final rounding at match score calculation (line 368)
- Added storage persistence for currentJob and currentAnalysis
- All 73 tests passing

### v1.3.1 (2026-01-25) - LinkedIn Extraction Fix
- Critical fix for LinkedIn job extraction failures
- Improved content script loading and initialization

### v1.3.0 (2026-01-24) - Export & Performance
- Export history to JSON/CSV/Markdown
- Analysis caching system
- Quick vs Detailed view modes
- Storage usage monitoring

### v1.2.1 (2026-01-23) - Bug Fixes
- Fixed pipe-separated CV parsing
- Self-employment filter improvements

### v1.2.0 (2026-01-22) - Weighted Scoring
- Implemented weighted scoring algorithm (required 3x, preferred 1x)
- Experience bonus system (+20 max)
- Enhanced CV parser with section detection

---

## 🔧 Development

### Code Quality

**TypeScript Strict Mode:**
```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true
}
```

**Testing Standards:**
- Minimum 70% code coverage
- All PRs must include tests
- E2E tests for critical user paths

**Git Workflow:**
```bash
# Feature development
git checkout -b feature/my-feature
# ... make changes ...
npm run test        # Ensure tests pass
npm run build       # Ensure builds successfully
git commit -m "feat: description"
git push origin feature/my-feature
```

### Build & Package

```bash
# Production build
npm run build

# Create extension package (XPI)
npm run package

# Create source code package (for Mozilla review)
npm run package:source
```

**Output:**
- `packages/job-application-analyzer-v1.4.0.zip` - Extension XPI
- `packages/job-application-analyzer-v1.4.0-source.zip` - Source code

---

## 🗺️ Roadmap

### v1.5.0 (Planned) - Multiple CV Profiles
- [ ] Store and manage multiple CV profiles
- [ ] Switch between CVs based on job type (Technical, Customer Service, Management)
- [ ] Track which CV was used for each analysis
- [ ] Default CV per job site settings

### v1.6.0 (Planned) - Advanced Analytics
- [ ] Match score trends over time
- [ ] Skill gap analysis dashboard
- [ ] Application success rate tracking
- [ ] Interview stage management

### v2.0.0 (Future) - AI Integration
- [ ] Claude API integration for natural language job analysis
- [ ] AI-powered CV optimization suggestions
- [ ] Personalized cover letter generation
- [ ] Interview preparation insights

---

## 🐛 Known Issues

- Chrome/Edge support pending (Manifest V3 compatibility layer needed)
- PDF CV parsing not yet supported (DOCX only)
- Large job descriptions (>10k chars) may cause slow extraction

**Report bugs:** [GitHub Issues](https://github.com/charliegdeburiatte-hub/Job-Application-Analyzer/issues)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Charlie de Buriatte**

- Portfolio: [GitHub](https://github.com/charliegdeburiatte-hub)
- Email: job-analyzer@charliegdeburiatte.com

---

## 🙏 Acknowledgments

- Built with modern web technologies and best practices
- Inspired by the need for data-driven job application strategies
- Thanks to the open-source community for excellent tooling

---

<div align="center">

**⭐ Star this repo if you find it useful!**

[Report Bug](https://github.com/charliegdeburiatte-hub/Job-Application-Analyzer/issues) • [Request Feature](https://github.com/charliegdeburiatte-hub/Job-Application-Analyzer/issues) • [View Demo](#)

</div>
