# High-Level Design: Job Application Analyzer Firefox Extension

## Executive Summary

A Firefox browser extension that analyzes job postings against your CV and provides intelligent recommendations on whether to apply. The extension detects job pages automatically, compares required skills and experience against your profile, and tracks your application history.

**Target User**: Job seekers who want data-driven insights on job fit before applying.

**Core Value Proposition**: Save time by focusing on jobs you're qualified for, increase application success rate, and maintain organized application tracking.

---

## Product Vision

### Problem Statement

Job seekers face several challenges:
- Applying to jobs they're underqualified for wastes time
- Manually comparing job requirements against CV is tedious
- Difficult to track which jobs have been analyzed or applied to
- Missing relevant keywords that could improve CV visibility

### Solution

A browser extension that:
1. Automatically detects when you're viewing a job posting
2. Analyzes the job against your stored CV profile
3. Provides a match score and clear recommendation
4. Tracks all analyzed jobs and application statuses
5. (Future) Suggests CV modifications to improve match

---

## User Personas

### Primary: Active Job Seeker (Charlie)
- **Demographics**: Tech professional, 2-5 years experience
- **Goals**: Find suitable roles quickly, avoid wasting time on poor fits
- **Pain Points**: Too many job postings, unclear if qualified
- **Tech Savvy**: High - comfortable with browser extensions
- **Usage**: Daily during job search phase

---

## System Architecture

### High-Level Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Firefox Browser                          │
│                                                              │
│  ┌────────────────┐      ┌──────────────────────────────┐  │
│  │  Job Site Page │      │     Extension Popup UI       │  │
│  │  (LinkedIn,    │      │   (React + TypeScript)       │  │
│  │   Indeed, etc) │      │                              │  │
│  └────────┬───────┘      │  ├─ Analysis Results         │  │
│           │              │  ├─ Match Score              │  │
│           │ Detects      │  ├─ Recommendations          │  │
│           │ Job Page     │  └─ Track Status             │  │
│           ▼              └──────────┬───────────────────┘  │
│  ┌────────────────┐                │                       │
│  │ Content Script │◄───────────────┘                       │
│  │  - Detector    │                                        │
│  │  - Injector    │         Messaging                      │
│  └────────┬───────┘         Protocol                       │
│           │                    │                            │
│           │                    ▼                            │
│  ┌────────┴───────────────────────────────────┐            │
│  │         Background Service Worker          │            │
│  │  - Message Router                          │            │
│  │  - Job Analysis Engine                     │            │
│  │  - Storage Manager                         │            │
│  └────────┬───────────────────────────────────┘            │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────────────────────────┐                   │
│  │     Browser Storage API             │                   │
│  │                                     │                   │
│  │  Local Storage:                    │                   │
│  │  ├─ CV DOCX file (base64)          │                   │
│  │  ├─ Extracted CV text              │                   │
│  │  └─ Analyzed jobs history          │                   │
│  │                                     │                   │
│  │  Sync Storage:                     │                   │
│  │  ├─ Structured CV profile          │                   │
│  │  └─ User settings/preferences      │                   │
│  └─────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### Component Details

#### 1. Content Script (Detector)
**Purpose**: Runs on job site pages to detect job postings

**Responsibilities**:
- Monitor URL changes
- Detect job pages using URL patterns
- Fallback: Analyze page content for job indicators
- Send detection events to background script
- Inject analysis popup when triggered

**Technology**: TypeScript, WebExtension Content Script API

**Key Functions**:
```typescript
- isJobPage(url: string): boolean
- detectJobFromContent(): boolean
- extractJobData(): JobData
- notifyBackgroundScript(jobData: JobData): void
```

#### 2. Background Service Worker
**Purpose**: Coordinates extension logic and storage

**Responsibilities**:
- Handle messages from content scripts and popup
- Run job analysis algorithm
- Manage storage operations
- Update extension badge/icon based on detection
- (Future) Make API calls to Claude

**Technology**: TypeScript, Service Worker

**Key Functions**:
```typescript
- analyzeJob(jobData: JobData, cvProfile: CVProfile): Analysis
- saveAnalysis(jobId: string, analysis: Analysis): void
- updateJobStatus(jobId: string, status: string): void
- getAnalyzedJobs(): AnalyzedJob[]
```

#### 3. Popup UI
**Purpose**: Main user interface for viewing results and managing CV

**Responsibilities**:
- Display analysis results (match score, recommendations)
- Show matched/missing skills
- Allow status updates (applied, rejected, etc.)
- CV upload and management
- Settings configuration

**Technology**: React, TypeScript, Tailwind CSS, Zustand

**Key Components**:
```
PopupApp/
├─ AnalysisView/
│  ├─ MatchScore
│  ├─ SkillsBreakdown
│  ├─ RecommendationCard
│  └─ ActionButtons
├─ CVManagement/
│  ├─ CVUpload
│  ├─ StructuredDataForm
│  └─ CVPreview
├─ JobHistory/
│  ├─ JobList
│  └─ JobCard
└─ Settings/
   ├─ PreferencesForm
   └─ SiteConfiguration
```

#### 4. Settings Page
**Purpose**: Configure extension behavior

**Features**:
- Auto-detection toggle
- Minimum match percentage threshold
- Enabled job sites selection
- Popup behavior preference
- Analysis detail level
- Data management (clear history, export)

---

## Data Models

### Core Entities

#### CV Document (Local Storage)
```typescript
interface CVDocument {
  fileName: string;           // "Charlie_Resume.docx"
  uploadDate: string;         // ISO timestamp
  docxBase64: string;         // Original file as base64
  extractedText: string;      // Parsed plain text content
  fileSize: number;           // In bytes
}
```

#### CV Profile (Sync Storage)
```typescript
interface CVProfile {
  personalInfo: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  
  skills: string[];           // ["JavaScript", "React", "TypeScript"]
  
  experience: Array<{
    title: string;            // "Software Engineer"
    company: string;          // "TechCorp"
    duration: string;         // "2021-2023"
    description: string;      // Role responsibilities
    technologies?: string[];  // Tech used in role
  }>;
  
  education: Array<{
    degree: string;           // "BSc Computer Science"
    institution: string;      // "University Name"
    year: string;             // "2020"
    grade?: string;
  }>;
  
  certifications?: string[];
  languages?: string[];
}
```

#### Job Data (Extracted from Page)
```typescript
interface JobData {
  url: string;                // Canonical job URL
  title: string;              // "Senior React Developer"
  company: string;            // "Company Name"
  location?: string;
  description: string;        // Full job description text
  requirements?: string;      // Extracted requirements section
  postedDate?: string;
  salary?: string;
  jobType?: string;           // "Full-time", "Contract", etc.
  source: string;             // "linkedin" | "indeed" | "reed"
}
```

#### Analysis Result
```typescript
interface Analysis {
  jobId: string;              // Hash of URL
  analyzedDate: string;       // ISO timestamp
  matchScore: number;         // 0-100
  recommendation: 'apply' | 'maybe' | 'pass';
  
  matchDetails: {
    matchedSkills: string[];
    missingSkills: string[];
    matchedExperience: string[];  // Relevant past roles
    strengthAreas: string[];      // What makes you strong fit
    weakAreas: string[];          // What you're missing
  };
  
  confidence: number;         // How confident the analysis is (0-1)
}
```

#### Analyzed Job (Stored Record)
```typescript
interface AnalyzedJob {
  jobId: string;
  url: string;
  title: string;
  company: string;
  analyzedDate: string;
  matchScore: number;
  status: 'analyzed' | 'applied' | 'rejected' | 'interviewing' | 'offer' | 'accepted';
  matchDetails: Analysis['matchDetails'];
  notes?: string;             // User's notes
  applicationDate?: string;   // When applied
  lastUpdated: string;
}
```

#### User Settings
```typescript
interface UserSettings {
  autoDetect: boolean;                    // Auto-detect job pages
  minimumMatchPercentage: number;         // Threshold for "apply" (default: 70)
  enabledJobSites: string[];              // ["linkedin", "indeed", "reed"]
  popupBehavior: 'badge' | 'auto-popup' | 'icon-only';
  analysisDetail: 'quick' | 'detailed';
  showNotifications: boolean;
  retentionDays: number;                  // Auto-delete old jobs (default: 90)
}
```

---

## User Flows

### Flow 1: Initial Setup

```
1. User installs extension
2. Extension shows onboarding popup
3. User uploads CV (DOCX file)
   ├─ Extension parses DOCX
   ├─ Extracts text content
   └─ Stores in local storage
4. Extension attempts auto-parse for structured data
   ├─ Extracts skills (basic regex)
   ├─ Shows parsed data for review
   └─ User confirms or manually edits
5. User configures basic settings (optional)
   ├─ Auto-detection preference
   ├─ Match threshold
   └─ Enabled sites
6. Setup complete - ready to analyze jobs
```

### Flow 2: Job Analysis (Auto-Detect Mode)

```
1. User navigates to LinkedIn job posting
2. Content script detects job page (URL pattern match)
3. Content script extracts job data from page
   ├─ Job title
   ├─ Company name
   ├─ Description/requirements
   └─ Additional metadata
4. Content script sends message to background worker
5. Background worker:
   ├─ Retrieves CV profile from storage
   ├─ Runs analysis algorithm
   ├─ Calculates match score
   ├─ Generates recommendation
   └─ Stores result
6. Extension icon updates with badge (match score)
7. User clicks extension icon
8. Popup displays:
   ├─ Match score: 85%
   ├─ Recommendation: "Strong fit - Apply!"
   ├─ Matched skills: [JavaScript, React, Node.js]
   ├─ Missing skills: [GraphQL, Kubernetes]
   └─ Action buttons: [Mark Applied] [Reject] [Save Notes]
9. User marks as "Applied"
10. Job saved to history with status
```

### Flow 3: Job Analysis (Manual Trigger)

```
1. User is on Indeed job page
2. Auto-detect is OFF or page not recognized
3. User clicks extension icon manually
4. Popup shows "Analyze Current Page" button
5. User clicks button
6. [Same as Flow 2, steps 3-10]
```

### Flow 4: Reviewing Job History

```
1. User opens extension popup
2. User clicks "History" tab
3. Popup displays list of analyzed jobs:
   ├─ Sorted by date (newest first)
   ├─ Filterable by status
   ├─ Searchable by title/company
   └─ Each job shows: title, company, match score, status
4. User clicks on a job
5. Popup shows full analysis details
6. User can:
   ├─ Update status
   ├─ Add/edit notes
   ├─ Re-analyze (if CV updated)
   └─ Delete from history
```

### Flow 5: Updating CV

```
1. User gets new certification/skill
2. User opens extension popup
3. User goes to "CV" tab
4. User either:
   A. Uploads new CV DOCX
      ├─ Previous CV archived
      ├─ New CV parsed
      └─ Structured data updated
   B. Manually edits structured fields
      ├─ Adds new skill
      └─ Saves changes to sync storage
5. User can click "Re-analyze All" to update old analyses
6. Background worker re-runs analysis on all saved jobs
7. Match scores updated with new CV data
```

---

## Job Detection Strategy

### Primary: URL Pattern Matching

**LinkedIn**:
```
Pattern: /linkedin\.com\/jobs\/(view|collections)\/\d+/
Example: https://www.linkedin.com/jobs/view/3845729101/
```

**Indeed**:
```
Pattern: /indeed\.com\/viewjob/
Example: https://www.indeed.com/viewjob?jk=abc123
```

**Reed**:
```
Pattern: /reed\.co\.uk\/jobs\/[^\/]+\/\d+/
Example: https://www.reed.co.uk/jobs/senior-developer/12345
```

**Other sites** (Phase 2):
- Monster, Glassdoor, CV-Library, Totaljobs
- Company career pages (configurable patterns)

### Fallback: Content Analysis

If URL doesn't match patterns, check page for:
```typescript
const jobIndicators = [
  '[data-job-id]',              // Common data attribute
  '.job-description',           // Class names
  '.job-title',
  'h1[class*="job"]',
  'div[class*="posting"]',
  // Meta tags
  'meta[property="og:type"][content="job"]',
  'script[type="application/ld+json"]'  // Structured data
];
```

### Confidence Scoring

```typescript
interface DetectionResult {
  isJob: boolean;
  confidence: number;  // 0-1
  method: 'url-pattern' | 'content-analysis' | 'user-triggered';
  site?: string;
}
```

---

## Analysis Algorithm

### Phase 1: Basic Skill Matching

```typescript
function analyzeJob(jobData: JobData, cvProfile: CVProfile): Analysis {
  // 1. Extract skills from job description
  const jobSkills = extractSkills(jobData.description);
  
  // 2. Normalize CV skills
  const cvSkills = cvProfile.skills.map(s => s.toLowerCase().trim());
  
  // 3. Find matches
  const matchedSkills = jobSkills.filter(skill => 
    cvSkills.some(cvSkill => 
      // Exact match or fuzzy match (e.g., "React.js" vs "React")
      cvSkill === skill.toLowerCase() || 
      fuzzyMatch(cvSkill, skill)
    )
  );
  
  const missingSkills = jobSkills.filter(skill => 
    !matchedSkills.includes(skill)
  );
  
  // 4. Calculate match score
  const matchScore = jobSkills.length > 0
    ? Math.round((matchedSkills.length / jobSkills.length) * 100)
    : 0;
  
  // 5. Categorize skills by importance
  const requiredSkills = extractRequiredSkills(jobData.description);
  const preferredSkills = extractPreferredSkills(jobData.description);
  
  const missingRequired = requiredSkills.filter(s => 
    !matchedSkills.includes(s)
  );
  
  // 6. Generate recommendation
  const recommendation = getRecommendation(
    matchScore,
    missingRequired.length,
    matchedSkills.length
  );
  
  return {
    jobId: generateJobId(jobData.url),
    analyzedDate: new Date().toISOString(),
    matchScore,
    recommendation,
    matchDetails: {
      matchedSkills,
      missingSkills,
      matchedExperience: [],  // Phase 2
      strengthAreas: generateStrengths(matchedSkills),
      weakAreas: generateWeaknesses(missingRequired)
    },
    confidence: calculateConfidence(jobData, cvProfile)
  };
}

function extractSkills(text: string): string[] {
  // Use skill keywords database + NLP extraction
  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
    'SQL', 'Docker', 'AWS', 'Git', 'REST API', 'GraphQL',
    // ... comprehensive list
  ];
  
  const found = commonSkills.filter(skill => 
    new RegExp(`\\b${skill}\\b`, 'i').test(text)
  );
  
  return [...new Set(found)];  // Remove duplicates
}

function getRecommendation(
  matchScore: number,
  missingRequired: number,
  matchedCount: number
): 'apply' | 'maybe' | 'pass' {
  if (missingRequired > 2) return 'pass';  // Missing too many required
  if (matchScore >= 70 && matchedCount >= 5) return 'apply';
  if (matchScore >= 50) return 'maybe';
  return 'pass';
}
```

### Phase 2: Experience Matching

```typescript
function matchExperience(
  jobData: JobData,
  cvProfile: CVProfile
): string[] {
  const jobRequirements = extractExperienceRequirements(jobData.description);
  // e.g., "3+ years React", "Senior level", "Led team of 5+"
  
  const matched = cvProfile.experience.filter(exp => 
    // Match technologies
    exp.technologies?.some(tech => jobSkills.includes(tech)) &&
    // Match seniority level
    matchesSeniority(exp.title, jobData.title)
  );
  
  return matched.map(exp => `${exp.title} at ${exp.company}`);
}
```

### Phase 3: AI-Powered Analysis (Future)

```typescript
async function analyzeWithAI(
  jobData: JobData,
  cvProfile: CVProfile
): Promise<AIAnalysis> {
  const prompt = `
    Analyze this job posting against the candidate's CV.
    
    Job: ${JSON.stringify(jobData)}
    CV: ${JSON.stringify(cvProfile)}
    
    Provide:
    1. Match score (0-100)
    2. Key strengths
    3. Key gaps
    4. Specific recommendations
    5. Suggested CV modifications for better match
  `;
  
  const response = await callClaudeAPI(prompt);
  
  return parseAIResponse(response);
}
```

---

## Storage Strategy

### Local Storage (No Size Limit)
**What**: Large, non-synced data
- CV DOCX file (base64 encoded)
- Extracted CV plain text
- Full job descriptions
- Analyzed jobs history (can grow large)

**Why local**: 
- DOCX files too large for sync (100KB+ vs 100KB sync limit)
- Privacy: CV stays on device
- Job descriptions are long text

### Sync Storage (100KB limit)
**What**: Small, important data to sync across devices
- Structured CV profile (skills, experience summary)
- User settings/preferences
- Job status updates (not full analysis)

**Why sync**:
- Skills list relatively small
- Settings should persist across devices
- Application status useful on mobile + desktop

### Storage Quota Management

```typescript
// Monitor storage usage
async function checkStorageQuota() {
  const local = await browser.storage.local.getBytesInUse();
  const sync = await browser.storage.sync.getBytesInUse();
  
  console.log(`Local: ${local} bytes, Sync: ${sync} bytes`);
  
  if (sync > 95000) {  // 95KB of 100KB limit
    warnUser("Sync storage nearly full");
  }
}

// Clean old data periodically
async function cleanOldJobs(retentionDays: number) {
  const jobs = await getAnalyzedJobs();
  const cutoff = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
  
  const toKeep = jobs.filter(job => 
    new Date(job.analyzedDate).getTime() > cutoff
  );
  
  await browser.storage.local.set({ analyzedJobs: toKeep });
}
```

---

## UI/UX Design

### Popup Interface

**Dimensions**: 400px wide × 600px tall (standard extension popup)

**Tabs**:
1. **Analysis** - Current job analysis (default view)
2. **History** - Past analyzed jobs
3. **CV** - Manage CV and profile
4. **Settings** - Preferences

### Analysis View (Tab 1)

```
┌────────────────────────────────────────┐
│  Job Application Analyzer       [⚙️]  │
├────────────────────────────────────────┤
│                                        │
│  📊 Match Score: 85%                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                        │
│  ✅ Strong Fit - Apply!                │
│                                        │
│  Senior React Developer                │
│  TechCorp Inc.                         │
│                                        │
│  ✓ Matched Skills (8)                  │
│  • JavaScript • React • TypeScript     │
│  • Node.js • REST API • Git            │
│  • Docker • AWS                        │
│                                        │
│  ✗ Missing Skills (2)                  │
│  • GraphQL • Kubernetes                │
│                                        │
│  💪 Your Strengths                     │
│  • 5+ years React experience           │
│  • Full-stack background               │
│                                        │
│  ⚠️ Gaps                               │
│  • No GraphQL experience               │
│                                        │
│  ┌────────────┐  ┌────────────┐       │
│  │ ✓ Applied  │  │ ✗ Reject   │       │
│  └────────────┘  └────────────┘       │
│                                        │
│  [View Full Analysis →]                │
└────────────────────────────────────────┘
```

### History View (Tab 2)

```
┌────────────────────────────────────────┐
│  Job History                 [Filter ▼]│
├────────────────────────────────────────┤
│  🔍 Search...                          │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ Senior React Dev  •  TechCorp    │ │
│  │ 85% match  •  Applied            │ │
│  │ 2 days ago                       │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ Full Stack Engineer  •  StartupX │ │
│  │ 62% match  •  Rejected           │ │
│  │ 1 week ago                       │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ Backend Developer  •  BigCo      │ │
│  │ 45% match  •  Analyzed           │ │
│  │ 2 weeks ago                      │ │
│  └──────────────────────────────────┘ │
│                                        │
│  [Show More]                           │
└────────────────────────────────────────┘
```

### CV Management (Tab 3)

```
┌────────────────────────────────────────┐
│  Your CV                               │
├────────────────────────────────────────┤
│                                        │
│  📄 Current CV                         │
│  Charlie_Resume.docx                   │
│  Uploaded: Jan 15, 2026                │
│                                        │
│  [Upload New CV]  [Download]           │
│                                        │
│  ─────────────────────────────────────│
│                                        │
│  ✏️ Quick Edit Profile                │
│                                        │
│  Skills (12)                           │
│  JavaScript, React, TypeScript...      │
│  [Edit]                                │
│                                        │
│  Experience (3 roles)                  │
│  [View/Edit]                           │
│                                        │
│  Education (1)                         │
│  [View/Edit]                           │
│                                        │
│  [Re-analyze All Jobs]                 │
│                                        │
└────────────────────────────────────────┘
```

### Settings (Tab 4)

```
┌────────────────────────────────────────┐
│  Settings                              │
├────────────────────────────────────────┤
│                                        │
│  🔍 Job Detection                      │
│  ☑ Auto-detect job pages               │
│  ☑ Show match score badge              │
│                                        │
│  Popup Behavior:                       │
│  ○ Badge only                          │
│  ● Auto-popup on job page              │
│  ○ Icon change only                    │
│                                        │
│  ─────────────────────────────────────│
│                                        │
│  📊 Analysis Settings                  │
│  Minimum match for "Apply": 70%        │
│  ▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭ 70              │
│                                        │
│  Detail Level:                         │
│  ○ Quick  ● Detailed                   │
│                                        │
│  ─────────────────────────────────────│
│                                        │
│  🌐 Enabled Job Sites                  │
│  ☑ LinkedIn                            │
│  ☑ Indeed                              │
│  ☑ Reed                                │
│                                        │
│  ─────────────────────────────────────│
│                                        │
│  🗑️ Data Management                   │
│  Auto-delete old jobs: 90 days         │
│  [Clear All History]                   │
│  [Export Data]                         │
│                                        │
└────────────────────────────────────────┘
```

### Injected Popup (On Job Page)

When auto-detect triggers, small popup appears in corner:

```
┌──────────────────────┐
│  📊 Job Analyzed     │
│  ───────────────────│
│  Match: 85%          │
│  ✅ Strong Fit       │
│                      │
│  [View Details]  [✕] │
└──────────────────────┘
```

---

## Technical Considerations

### Performance

**Content Script**:
- Debounce URL checks (avoid checking every DOM change)
- Use MutationObserver sparingly
- Lazy inject popup component only when needed

**Background Worker**:
- Cache CV profile in memory (avoid repeated storage reads)
- Batch storage writes
- Use Web Workers for heavy parsing (if needed in future)

**Popup**:
- Virtual scrolling for long job lists
- Pagination (20 jobs per page)
- Lazy load detailed analysis

### Security

**Content Security Policy**:
```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

**Data Protection**:
- Never send CV to external servers (except AI API with consent)
- Sanitize all page-extracted data before processing
- Validate storage data on read (could be corrupted)

**Permissions**: Request minimum necessary
- `storage` - For saving CV and jobs
- `activeTab` - For reading current page
- `scripting` - For injecting content scripts dynamically

### Cross-Browser Compatibility

**Target**: Firefox (primary), Chrome (future)

**Key Differences**:
- Firefox uses `browser.*` API (Promise-based)
- Chrome uses `chrome.*` API (callback-based)
- Manifest V3 differences

**Strategy**: 
- Build for Firefox first with `browser.*`
- Add Chrome compatibility layer later

### Error Handling

**Storage Errors**:
```typescript
try {
  await browser.storage.local.set({ cv: largeData });
} catch (error) {
  if (error.message.includes('QUOTA_BYTES')) {
    // Handle storage full
    notifyUser("Storage full. Please delete old jobs.");
  }
}
```

**Parsing Errors**:
```typescript
try {
  const parsed = await parseDocx(file);
} catch (error) {
  // Fallback to manual entry
  showError("Could not parse CV. Please enter data manually.");
}
```

**Network Errors** (Future AI features):
```typescript
try {
  const analysis = await callAI(jobData);
} catch (error) {
  // Fallback to basic algorithm
  return basicAnalysis(jobData);
}
```

---

## Implementation Roadmap

### Phase 1: MVP (Weeks 1-3)

**Week 1: Foundation**
- [ ] Project setup (Vite + React + TypeScript)
- [ ] Extension manifest configuration
- [ ] Basic popup UI shell
- [ ] Storage utilities

**Week 2: Core Features**
- [ ] CV upload (DOCX parsing with mammoth.js)
- [ ] Manual structured data entry form
- [ ] Basic skill extraction from job pages
- [ ] Simple matching algorithm
- [ ] Analysis result display

**Week 3: Job Detection**
- [ ] URL pattern detection for LinkedIn, Indeed, Reed
- [ ] Content script integration
- [ ] Badge/icon updates
- [ ] Manual analyze button

**Deliverable**: Working extension that can analyze jobs on major sites

---

### Phase 2: Enhanced Features (Weeks 4-6)

**Week 4: Application Tracking**
- [ ] Job history storage
- [ ] Status tracking (applied/rejected/etc.)
- [ ] History view UI
- [ ] Search and filter

**Week 5: Advanced Analysis**
- [ ] Experience matching
- [ ] Requirements vs preferences detection
- [ ] Confidence scoring
- [ ] Detailed strength/weakness breakdown

**Week 6: Settings & Polish**
- [ ] Settings page
- [ ] Configurable thresholds
- [ ] Site enable/disable
- [ ] Auto-parse CV improvements
- [ ] Data export

**Deliverable**: Feature-complete extension with tracking

---

### Phase 3: AI Integration (Weeks 7-8)

**Week 7: AI Analysis**
- [ ] Claude API integration
- [ ] Advanced job analysis prompt
- [ ] Fallback to basic algorithm

**Week 8: CV Optimization**
- [ ] Keyword suggestion
- [ ] CV modification generation
- [ ] Download modified CV
- [ ] A/B comparison view

**Deliverable**: AI-powered recommendations and CV customization

---

## Testing Strategy

### Unit Tests
- Skill extraction algorithm
- Match score calculation
- Storage utilities
- Data parsing functions

### Integration Tests
- Content script ↔ Background messaging
- Storage read/write operations
- DOCX parsing end-to-end

### Manual Testing Checklist

**Job Detection**:
- [ ] LinkedIn job page detected
- [ ] Indeed job page detected
- [ ] Reed job page detected
- [ ] Non-job pages ignored
- [ ] Multiple tabs don't conflict

**Analysis**:
- [ ] Correct match score calculated
- [ ] Skills properly extracted
- [ ] Recommendations make sense
- [ ] Missing skills identified

**CV Management**:
- [ ] DOCX upload works
- [ ] Text extraction accurate
- [ ] Manual edits save correctly
- [ ] Profile syncs across sessions

**Tracking**:
- [ ] Jobs saved to history
- [ ] Status updates persist
- [ ] Search works
- [ ] Filter works
- [ ] Pagination works

**Edge Cases**:
- [ ] No CV uploaded (graceful handling)
- [ ] Invalid DOCX file
- [ ] Job page with unusual structure
- [ ] Storage quota exceeded
- [ ] Offline mode

---

## Future Enhancements

### Post-Launch Features

1. **Mobile Support**
   - Firefox Android extension
   - Responsive popup UI

2. **Additional Job Sites**
   - Monster, Glassdoor, CV-Library
   - Company career pages (configurable)

3. **Enhanced Tracking**
   - Interview schedules
   - Offer tracking
   - Salary comparison

4. **Analytics Dashboard**
   - Application success rate
   - Most common missing skills
   - Industry trends from analyzed jobs

5. **Cover Letter Generation**
   - AI-generated cover letters
   - Customized per job

6. **Browser Sync**
   - Cloud backup (optional)
   - Multi-device sync beyond Firefox Sync

7. **Integrations**
   - Export to job tracking apps (Huntr, JobHero)
   - Calendar integration for deadlines

---

## Success Metrics

### Key Performance Indicators (KPIs)

**User Engagement**:
- Daily active users
- Jobs analyzed per user per week
- CV update frequency

**Feature Usage**:
- % of jobs marked with status
- Auto-detect vs manual trigger ratio
- Settings customization rate

**Quality**:
- Match score accuracy (user feedback)
- Time to analyze a job (< 2 seconds)
- Storage usage (stay under quotas)

**Portfolio Impact** (for Charlie):
- Demonstrates: Browser extensions, React, TypeScript
- Shows: Problem-solving, product thinking, API integration
- Proves: Can ship complete, polished projects

---

## Risks & Mitigations

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Job sites change HTML structure | High | Medium | Use multiple selectors, fallback detection |
| Storage quota exceeded | Medium | Low | Auto-cleanup, warn user, compression |
| DOCX parsing fails | Medium | Low | Fallback to manual entry |
| API rate limits (future) | Medium | Medium | Cache results, batch requests |

### Product Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Low match score accuracy | High | Medium | Iterative algorithm improvement, user feedback |
| Users don't trust recommendations | Medium | Medium | Show reasoning, allow override |
| Too many false positives on detection | Low | Low | Strict URL patterns, confidence threshold |

---

## Open Questions

1. **Skill Database**: Use predefined list or dynamic extraction?
   - **Decision**: Start with predefined, add dynamic in Phase 2

2. **Job ID Generation**: Use URL hash or site-specific ID?
   - **Decision**: Hash of canonical URL for consistency

3. **Multi-language Support**: English only or i18n?
   - **Decision**: English only for MVP

4. **Privacy Policy**: Required for extension store?
   - **Decision**: Yes - draft before publishing

5. **Freemium Model**: Free basic, paid AI features?
   - **Decision**: Fully free for MVP, revisit later

---

## Appendix

### Technology Stack Summary

| Layer | Technology | Justification |
|-------|-----------|---------------|
| Frontend | React 18 | Charlie's existing skill, component reusability |
| Language | TypeScript | Type safety, better tooling, professional standard |
| Styling | Tailwind CSS | Rapid UI development, consistency with other projects |
| State | Zustand | Lightweight, simpler than Redux for extension scope |
| Build | Vite | Fast builds, modern tooling, React support |
| Parsing | mammoth.js | Mature DOCX parser, good documentation |
| API (future) | Claude API | Advanced analysis, CV generation |

### Browser API Usage

**Critical APIs**:
- `browser.storage.local` - CV and job storage
- `browser.storage.sync` - Settings sync
- `browser.tabs` - Current tab URL detection
- `browser.runtime` - Messaging between scripts
- `browser.action` - Popup and badge management

**Optional APIs** (future):
- `browser.alarms` - Periodic cleanup
- `browser.notifications` - Job detection alerts

### References

- [WebExtensions API Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Mammoth.js Documentation](https://github.com/mwilliamson/mammoth.js)
- [Zustand State Management](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Document Version**: 1.0  
**Last Updated**: January 18, 2026  
**Author**: Charlie (with Claude assistance)  
**Status**: Ready for Implementation
