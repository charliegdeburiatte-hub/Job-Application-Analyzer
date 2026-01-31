# Job Application Analyzer - Project Context Document

**Last Updated:** 2026-01-27 (v1.4.0 in development)
**Current Version (Live):** v1.4.0
**Current Version (Dev):** v1.4.1-dev (LinkedIn extraction fix)

---

## 🎯 Project Overview

**Purpose:** Firefox extension that analyzes job postings against user's CV using weighted scoring algorithms to provide data-driven application recommendations.

**Target Users:** Job seekers who want objective, quantifiable insights into job-CV compatibility.

**Key Differentiator:** Weighted scoring (required skills 3x > preferred skills) with transparent breakdown.

---

## 📚 Tech Stack

### Frontend
- **React 19.2.3** - UI framework
- **TypeScript 5.9.3** - Type safety
- **Tailwind CSS 4** - Styling
- **Zustand 5.0.3** - State management

### Build & Testing
- **Vite 7.3.1** - Build tool
- **Vitest 4.0.18** - Unit testing (73 tests)
- **Playwright 1.58.0** - E2E testing
- **@faker-js/faker 10.2.0** - Test data generation

### Browser & Libraries
- **WebExtension API** - Firefox Manifest V3
- **mammoth.js** - DOCX parsing
- **lucide-react** - Icons

---

## 🏗️ Architecture

### Component Structure
```
Extension Components:
├── Content Script (detector.ts)
│   ├── Detects job pages (LinkedIn, Indeed, Reed)
│   ├── Extracts job data (title, company, description)
│   └── Handles "Show More" button expansion
│
├── Background Worker (background/index.ts)
│   ├── Coordinates analysis workflow
│   ├── Manages storage operations
│   └── Updates badge with match scores
│
├── Popup UI (popup/)
│   ├── AnalysisView - Shows match scores and recommendations
│   ├── HistoryView - Job history with filtering/sorting/export
│   ├── CVView - CV upload and skill extraction
│   └── SettingsView - User preferences
│
└── Shared Utils (shared/utils/)
    ├── analysis.ts - Weighted scoring algorithm
    ├── cvParser.ts - DOCX CV extraction
    ├── storage.ts - Browser storage wrapper
    └── exportAnalysis.ts - JSON/CSV/Markdown export
```

### Data Flow
```
Job Page → Content Script → Background Worker → Analysis Engine
                                    ↓
                            Storage (Local + Sync)
                                    ↓
                            Popup UI (displays results)
```

---

## 🔢 Scoring Algorithm

### Weighted Scoring Formula
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

// Phase 5: Final score (v1.4.0 - SINGLE rounding at the end)
matchScore = min(100, round(baseScore + experienceBonus))
```

### Recommendation Thresholds
- **Apply**: ≥70% match + ≥5 skills matched + ≤1 missing required
- **Maybe**: ≥50% match + ≥3 skills matched
- **Pass**: <50% match OR >3 missing required skills

---

## 📦 Release History

### v1.4.2 (2026-01-31) - IN REVIEW
**Critical Fixes:**
- ✅ Fixed ManualJobPaste dark mode contrast (horrid contrast → readable)
- ✅ Simplified ManualJobPaste - only description required (no more data loss on window switch)
- ✅ Improved LinkedIn extraction with more selectors and innerText fallback

**ManualJobPaste UX Improvements:**
- Only job description is required (50 char minimum)
- Title defaults to "Manual Job Entry" if empty
- Company defaults to "Unknown Company" if empty
- All other fields optional (location, URL)
- Better dark mode: gray-900 bg, white labels, gray-800 inputs
- Explicit placeholder colors for visibility
- Labels show "(optional)" for non-required fields

**LinkedIn Extraction Improvements:**
- Added more selectors: `#job-details`, `.jobs-description-content__text`, `article.jobs-description`
- Try both `textContent` and `innerText` (innerText respects CSS/line breaks better)
- More detailed console logging to debug extraction
- Increased "Show more" wait time: 1000ms → 1500ms
- Added `button[aria-expanded="false"]` selector for collapsed content

**User Feedback Addressed:**
- "Modal closes when you switch windows to copy/paste" → FIXED (only description required)
- "Dark mode horrid contrast" → FIXED (gray-900, white text)
- "LinkedIn can only parse certain number of lines" → IMPROVED (innerText + more selectors)

### v1.4.1 (2026-01-27)
**Critical Fixes:**
- ✅ Fixed LinkedIn async extraction bug (8% scores on qualified jobs)
- ✅ Fixed match score centering (percentage now properly centered in circle)
- ✅ Fixed Settings dark mode contrast (white/gray-100 text on dark backgrounds)
- ✅ Fixed blue banner contrast (Analysis saved message)
- ✅ Updated debug string from v1.3.2 to v1.4.0

**New Features:**
- ✅ Manual job paste functionality (📋 button for when auto-detection fails)
- ✅ ManualJobPaste component with form validation
- ✅ Fallback for LinkedIn extraction failures

**Technical:**
- Made `extractLinkedInJob()` properly async with await
- Changed setTimeout callback to `await new Promise(resolve => setTimeout(resolve, 1000))`
- Made `extractJobData()` and `extractManualJobData()` async
- Fixed MatchScore centering with flexbox (`inset-0 flex items-center justify-center`)
- Global contrast fixes in SettingsView (dark:text-white, dark:text-gray-100)
- Added ManualJobPaste.tsx (180 lines) - modal form for manual job entry

**Root Cause - LinkedIn 8% Bug:**
The setTimeout callback in extractLinkedInJob() was executing AFTER the function returned, so the description variable was never updated with expanded content. The function returned immediately with 132-character summary instead of waiting for the 1,500+ character full description. This caused 0 skills found → 0% base + 8% experience = 8% total.

### v1.4.0 (2026-01-27)
**Critical Fixes:**
- ✅ Fixed 97% clustering bug (premature rounding in lines 298, 311)
- ✅ Fixed dark mode contrast (Scoring Details, Settings, Export menu)
- ✅ Fixed Support Specialist 8% bug (actually 97% after rounding fix)

**New Features:**
- ✅ History click to view saved analysis (no URL opening)
- ✅ Analysis persistence across popup opens/closes
- ✅ "🔄 New Job" button to clear current analysis

**Technical:**
- Removed `Math.round()` from base score calculation (line 298)
- Removed `Math.round()` from experience bonus (line 311)
- Added single final rounding at line 368
- Added storage persistence for currentJob/currentAnalysis
- Updated store to auto-save on setCurrentJob/setCurrentAnalysis

**Files Modified:**
- `src/shared/utils/analysis.ts` - Rounding fix
- `src/popup/components/AnalysisView.tsx` - Contrast + New Job button
- `src/popup/components/HistoryView.tsx` - Click behavior
- `src/popup/components/SettingsView.tsx` - Contrast fixes
- `src/popup/index.css` - Export menu contrast
- `src/popup/store/index.ts` - Persistence logic
- `src/shared/types/index.ts` - Added currentJob/currentAnalysis
- `src/shared/constants.ts` - Added CURRENT_JOB/CURRENT_ANALYSIS keys
- `src/shared/utils/storage.ts` - saveCurrentAnalysis(), clearCurrentAnalysis()

**Tests:** 73 passing

### v1.3.1 (2026-01-25)
- Critical LinkedIn extraction fix
- Improved content script loading

### v1.3.0 (2026-01-24)
- Export to JSON/CSV/Markdown
- Analysis caching system
- Quick vs Detailed view modes
- Storage usage monitoring

### v1.2.1 (2026-01-23)
- Pipe-separated CV parsing fix
- Self-employment filter

### v1.2.0 (2026-01-22)
- Weighted scoring algorithm (3x required, 1x preferred)
- Experience bonus system (+20 max)

---

## 🐛 Known Issues & Solutions

### Issue 1: LinkedIn 8% Scores (v1.4.1 - FIXED ✅)
**Problem:** Job descriptions scoring 8% when user is qualified.

**Root Cause:**
- LinkedIn "Show more" button wasn't being properly awaited
- Content script was returning 132-character summary instead of full 1,500+ char description
- Algorithm found 0 skills → 0% base score + 8% experience = 8% total

**Solution (v1.4.1):**
```typescript
// Made extractLinkedInJob() properly async
async function extractLinkedInJob(): Promise<Partial<JobData>> {
  // ... extract description ...

  if (description.length < 500) {
    const showMoreButton = document.querySelector('.jobs-description__footer-button');
    if (showMoreButton) {
      showMoreButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000)); // WAIT!
      // Re-extract expanded content
    }
  }
}
```

**Files Modified:**
- `src/content/detector.ts` - Made async: extractLinkedInJob(), extractJobData(), extractManualJobData()
- Message listener wrapped in async IIFE to handle await

**Status:** ✅ Fixed in v1.4.1 + Added manual paste fallback

### Issue 2: Match Score Not Centered (v1.4.1 - FIXED ✅)
**Problem:** Percentage text "8%" floating outside/below circle instead of centered.

**Solution:**
```typescript
// Changed from absolute mt-10 to flexbox centering
<div className="absolute inset-0 flex items-center justify-center">
  <div className="text-center">
    <div className="text-4xl font-bold">{animatedScore}%</div>
  </div>
</div>
```

**File:** `src/popup/components/MatchScore.tsx`

### Issue 3: Dark Mode Settings Invisible Text (v1.4.1 - FIXED ✅)
**Problem:** Black text on black background in Settings dark mode.

**Solution:**
- Section headers: `dark:text-gray-100` → `dark:text-white`
- Labels: `dark:text-gray-300` → `dark:text-gray-100`
- Small text: `dark:text-gray-300` → `dark:text-gray-200`

**File:** `src/popup/components/SettingsView.tsx`

### Issue 4: Blue Banner Text Unreadable (v1.4.1 - FIXED ✅)
**Problem:** "✓ Analysis saved to History tab" hard to read in dark mode.

**Solution:** Changed from `dark:text-blue-200` to `dark:text-blue-100`

**File:** `src/popup/components/AnalysisView.tsx` line 127

---

## 📁 Critical Files Reference

### Content Script
**File:** `src/content/detector.ts` (464 lines)
- `detectJobPage()` - URL pattern matching for LinkedIn/Indeed/Reed
- `extractLinkedInJob()` - **ASYNC** - Handles "Show more" expansion
- `extractIndeedJob()` - Extracts Indeed job data
- `extractReedJob()` - Extracts Reed job data
- `extractJobData()` - **ASYNC** - Main extraction coordinator
- `analyzeCurrentPage()` - Auto-analysis on page load/navigation
- MutationObserver - Watches for SPA navigation (500ms debounce)

**LinkedIn Extraction Selectors:**
```typescript
const descriptionSelectors = [
  '.jobs-description__content',
  '.jobs-description',
  '.jobs-box__html-content',
  '.job-view-layout .jobs-description',
  '[class*="jobs-description"]',
];
```

### Analysis Engine
**File:** `src/shared/utils/analysis.ts` (400+ lines)
- `analyzeJob(jobData, cvProfile)` - Main entry point
- `extractSkills(text)` - Finds skills from COMMON_SKILLS (200+ skills)
- `extractRequiredSkills(text)` - Uses REQUIREMENT_KEYWORDS patterns
- `extractPreferredSkills(text)` - Uses "nice to have" patterns
- `calculateWeightedScore()` - **CRITICAL: NO ROUNDING** (returns decimal)
- `calculateExperienceBonus()` - **CRITICAL: NO ROUNDING** (returns decimal)
- `getRecommendation()` - Apply/Maybe/Pass logic

**Debug Output:** Line 333 - `console.log('=== ANALYSIS DEBUG (v1.4.0 - Rounding Fixed) ===')`

### Storage
**File:** `src/shared/utils/storage.ts` (200+ lines)
- `getLocalStorage()` - Returns { cvDocument, analyzedJobs, currentJob, currentAnalysis }
- `getSyncStorage()` - Returns { cvProfile, settings }
- `saveCurrentAnalysis()` - Persists current job/analysis (v1.4.0)
- `clearCurrentAnalysis()` - Clears persisted analysis (v1.4.0)
- `saveAnalyzedJob()` - Adds job to history
- `getAnalyzedJobs()` - Returns all analyzed jobs

**Storage Keys:** (src/shared/constants.ts)
```typescript
STORAGE_KEYS = {
  CV_DOCUMENT: 'cvDocument',
  CV_PROFILE: 'cvProfile',
  ANALYZED_JOBS: 'analyzedJobs',
  SETTINGS: 'settings',
  CURRENT_JOB: 'currentJob',        // v1.4.0
  CURRENT_ANALYSIS: 'currentAnalysis', // v1.4.0
}
```

### Popup Components
**AnalysisView.tsx** (320 lines)
- Shows match score, recommendation, skills breakdown
- Has "🔄 New Job" button (v1.4.0)
- Handles quick vs detailed view modes
- Lines 127-129: Blue banner with saved notice

**HistoryView.tsx** (245 lines)
- Displays analyzed job history
- Filtering by status, date range, sorting
- Export functionality
- **Lines 194-232:** onClick now shows saved analysis instead of opening URL (v1.4.0)

**MatchScore.tsx** (72 lines)
- Circular progress indicator
- **Lines 123-135:** Centering fix using flexbox (v1.4.1-dev)

**SettingsView.tsx** (240 lines)
- Dark mode toggle, analysis preferences, job site controls
- **Dark mode contrast fixes** (v1.4.1-dev)

### Store
**File:** `src/popup/store/index.ts` (260 lines)
- Zustand state management
- `setCurrentJob()` - Auto-saves to storage (v1.4.0)
- `setCurrentAnalysis()` - Auto-saves to storage (v1.4.0)
- `clearCurrentAnalysis()` - Clears from storage (v1.4.0)
- `init()` - Loads persisted currentJob/currentAnalysis (v1.4.0)

---

## 🧪 Testing

### Unit Tests (73 passing)
**Location:** `src/shared/utils/__tests__/`

**Test Files:**
- `analysis.test.ts` - Weighted scoring algorithm
- `cvParser.test.ts` - DOCX parsing and skill extraction
- `rounding-bug.test.ts` - Documents 97% clustering bug
- `rounding-fix-verification.test.ts` - Verifies v1.4.0 fix
- `8-percent-bug.test.ts` - Documents 8% scoring issue (NOW SCORES 97%)
- `generated.test.ts` - Faker-generated edge cases

**Run Tests:**
```bash
npm run test        # Watch mode
npm run test:run    # Single run
npm run test:ui     # Visual UI
```

**Important:** Tests showed 8% bug was "fixed" (scoring 97%) but user still experienced 8% in production. Tests were misleading - the real issue was LinkedIn extraction, not scoring algorithm.

### E2E Tests (Playwright)
**Location:** `tests/`
**Run:** `npm run test:e2e`

---

## 🔧 Development Workflow

### Standard Release Process
1. User downloads signed XPI from Mozilla → `/home/charlie/Downloads/468717bb950d4b0a8ffd-{version}.xpi`
2. Copy XPI to packages: `cp /home/charlie/Downloads/*.xpi packages/`
3. Update `updates.json` with new version entry
4. Upload XPI to GitHub release: `gh release upload v{version} packages/{xpi}`
5. Commit and push: `git add updates.json packages/ && git commit && git push`
6. User tests with "Check for Updates" in Firefox

### Build Commands
```bash
npm run build              # Production build → dist/
npm run dev               # Watch mode with auto-reload
npm run package           # Create XPI for Mozilla submission
npm run package:source    # Create source ZIP for Mozilla review
npm run test              # Run unit tests
npm run test:e2e         # Run Playwright E2E tests
```

### Git Workflow
- Main branch: `main`
- Release tags: `v1.4.0`, `v1.4.1`, etc.
- Commit messages: Conventional commits format
- Always include "Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

---

## 📊 User Feedback & Issues

### Common User Reports
1. **"8% on jobs I'm qualified for"** - LinkedIn extraction issue (v1.4.1-dev fix in progress)
2. **"Percentage moves when scrolling"** - Match score positioning (v1.4.1-dev fixed)
3. **"Dark mode looks terrible"** - Contrast issues (v1.4.1-dev fixed)
4. **"97% on everything"** - Rounding clustering bug (v1.4.0 fixed)

### User Testing Workflow
- User tests live extension (current version on Firefox Add-ons)
- Reports issues with screenshots → `/home/charlie/Downloads/VM/`
- Console output → `/home/charlie/Downloads/message.txt` or screenshots
- We debug, fix, build, test in `dist/`
- When stable, release next version

---

## 🚀 Roadmap

### v1.4.1 (2026-01-27) - RELEASED ✅
**Status:** Live and deployed

**Fixes:**
- ✅ LinkedIn 8% extraction issue (async await fix)
- ✅ Match score centering (flexbox layout)
- ✅ Dark mode Settings contrast (lighter text colors)
- ✅ Blue banner contrast (lighter blue text)
- ✅ Debug version string (v1.3.2 → v1.4.0)

**New Features:**
- ✅ **Manual Job Description Paste** - Backup when auto-extraction fails
  - Modal dialog (ManualJobPaste.tsx) with form validation
  - Fields: Job title, company, location, URL, description
  - "📋 Paste Job Manually" button in empty state
  - Works for ANY job posting (email, PDF, screenshot, etc.)
  - Form validation: 50 char minimum for description
  - Auto-fills URL from current tab if not provided

### v1.4.1 or v1.5.0 - Manual Job Description Paste

### v1.5.0 (Planned) - Multiple CV Profiles
**User Request:** "I wanted to float the options of having a second CV option as some look for customer service and something else etc"

**Features:**
- Store multiple CV profiles (Technical, Customer Service, Management, etc.)
- Switch active CV before analyzing jobs
- Track which CV was used for each analysis
- Default CV per job site (optional)

**Technical Approach:**
```typescript
// Storage schema change
interface LocalStorage {
  cvProfiles: {
    [profileId: string]: {
      name: string;
      cvDocument: CVDocument;
      cvProfile: CVProfile;
      isDefault: boolean;
    }
  };
  activeProfileId: string;
  // ... existing fields
}
```

**UI Changes:**
- CVView: Dropdown to select active profile, "Add New Profile" button
- AnalysisView: Show which profile was used
- HistoryView: Filter by CV profile used

---

## 🎨 Design Decisions

### Color Scheme
- **Light Mode:** White background, black text, blue accents
- **Dark Mode:** #1a1a1a background, white text, blue accents
- **Contrast Standards:** WCAG AA compliant

### Dark Mode Text Colors (v1.4.1-dev fixes)
```css
Headers: dark:text-white (not gray-100)
Labels: dark:text-gray-100 (not gray-300)
Small text: dark:text-gray-200 (not gray-300)
Blue banner: dark:text-blue-100 (not blue-200)
```

### Button Styles
- **Primary:** Black bg (light), white bg (dark), white/black text
- **Secondary:** White bg with border (light), #2a2a2a with border (dark)
- **Danger:** Gray-500 bg (grayscale design)

### Layout
- **Popup Size:** 500px width, 600-700px height
- **Cards:** Rounded corners (0.75rem), subtle shadow
- **Match Score:** Circular progress, 128px size, centered with flexbox

---

## 🔍 Debugging

### Console Debug Output
**Location:** Background worker console + Content script console

**Analysis Debug (src/shared/utils/analysis.ts:333):**
```
=== ANALYSIS DEBUG (v1.4.0 - Rounding Fixed) ===
Job description length: 1635
Job skills found: 10 - [skills array]
Required skills: 5 - [skills]
Preferred skills: 5 - [skills]
CV skills: 35 - [user skills]
Matched required: 4 / 5
Matched preferred: 3 / 5
Weighted base score: 78.26 (78 when rounded)
Experience bonus: 8.00 (8 when rounded)
Final match score: 86 (calculated from 86.26)
=== END DEBUG ===
```

**LinkedIn Extraction Debug:**
```
[Job Analyzer] Clicking "Show more" button to expand description
[Job Analyzer] Expanded description length: 1635
[Job Analyzer] LinkedIn description length: 1635
```

### Common Debug Checks
1. **8% scores:** Check `Job description length` - should be >500 chars
2. **0 skills found:** Check if description was truncated
3. **97% clustering:** Verify rounding only happens once at the end
4. **UI contrast:** Check dark mode class application

---

## 📝 Important Notes

### User Preferences
- User does NOT want "Black Sabbath Purple" theme - removed/unused
- User wants clean, professional design
- User wants high contrast in dark mode
- User prioritizes functionality over fancy animations

### Development Philosophy
- **User feedback trumps tests** - Tests said 8% was fixed, user still saw 8%
- **Build often, test in production** - Load from `dist/` frequently
- **Console output is critical** - Always check debug logs
- **Don't rush releases** - User explicitly said "don't do 1.4.1 yet im still testing"

### Release Strategy
- Collect multiple bugs before releasing (v1.4.0 approach)
- Test thoroughly before submitting to Mozilla
- Use Firefox auto-update via updates.json on GitHub
- Keep signed XPIs in packages/ directory

---

## 🚨 Critical Reminders

1. **LinkedIn Extraction:** MUST use async/await for "Show more" button
2. **Rounding:** ONLY round at the FINAL score calculation (line 368)
3. **Dark Mode:** Use `dark:text-white` or `dark:text-gray-100` for headers
4. **Match Score:** Use flexbox centering, not absolute positioning
5. **Storage:** currentJob and currentAnalysis are persisted (v1.4.0+)
6. **Tests:** Don't blindly trust tests - verify with real user scenarios

---

## 📞 Communication with User

### What User Expects
- Clear explanations of what was fixed
- Console output to verify fixes
- Builds in `dist/` to test immediately
- No premature releases

### What User Doesn't Want
- Being asked "should I release X?" - they'll tell you when ready
- Time estimates
- Over-engineering or unnecessary features
- Tests that don't reflect reality

---

**END OF CONTEXT DOCUMENT**

This document should be updated after every significant change, bug fix, or release.
Next update: When v1.4.1 LinkedIn fix is verified working by user.
