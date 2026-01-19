# Firefox Extension Development - Job Application Analyzer

## Project Context
- **Type**: Firefox Browser Extension (WebExtension API)
- **Frontend**: React + TypeScript + Tailwind CSS
- **Build Tool**: Vite
- **State Management**: Zustand (lightweight, perfect for extensions)
- **Storage**: Firefox Storage API (local + sync)
- **Document Parsing**: mammoth.js (DOCX parsing)
- **AI Integration**: Claude API (future phase)

## Project Structure
```
job-analyzer-extension/
  src/
    background/           # Background scripts (service worker)
      index.ts
    content/              # Content scripts (injected into job pages)
      detector.ts         # Job page detection logic
      injector.tsx        # Popup injector component
    popup/                # Extension popup UI
      components/         # React components
      hooks/              # Custom hooks
      store/              # Zustand store
      App.tsx
      index.tsx
    options/              # Settings page
      OptionsPage.tsx
    shared/               # Shared utilities
      types/              # TypeScript interfaces
      utils/              # Helper functions
      constants.ts
    manifest.json         # Extension manifest
  public/
    icons/                # Extension icons (16, 48, 128px)
  dist/                   # Build output
```

## Code Standards

### TypeScript
- Strict mode enabled (`"strict": true` in tsconfig.json)
- No `any` types without explicit justification comment
- Prefer `interface` for object shapes, `type` for unions/intersections
- Use discriminated unions for state machines
- Define types in `src/shared/types/`

### React Patterns
- Functional components only
- Custom hooks for shared logic (prefix with `use`)
- Colocate related components
- Use React.memo sparingly, only for proven performance issues
- Keep components under 150 lines (extract if larger)

### Naming Conventions
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utilities: `camelCase.ts`
- Constants: `SCREAMING_SNAKE_CASE`
- CSS classes: `kebab-case` (Tailwind utilities)
- Files: Match the primary export name

### Firefox Extension Specifics
- Use `browser` namespace (not `chrome`) for WebExtension APIs
- All extension APIs are Promise-based in Firefox
- Content scripts must be registered in manifest.json
- Background scripts run as service workers (non-persistent)
- Use `web_accessible_resources` for injected UI assets

## Manifest Configuration

### manifest.json Structure
```json
{
  "manifest_version": 3,
  "name": "Job Application Analyzer",
  "version": "1.0.0",
  "description": "Analyzes job postings against your CV and provides application recommendations",
  
  "permissions": [
    "storage",
    "activeTab",
    "scripting"
  ],
  
  "host_permissions": [
    "https://www.linkedin.com/*",
    "https://www.indeed.com/*",
    "https://www.reed.co.uk/*"
  ],
  
  "background": {
    "service_worker": "background/index.js",
    "type": "module"
  },
  
  "content_scripts": [
    {
      "matches": [
        "https://www.linkedin.com/jobs/*",
        "https://www.indeed.com/viewjob/*",
        "https://www.reed.co.uk/jobs/*"
      ],
      "js": ["content/detector.js"],
      "run_at": "document_idle"
    }
  ],
  
  "action": {
    "default_popup": "popup/index.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  
  "web_accessible_resources": [
    {
      "resources": ["content/injector.js"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

## Storage Schema

### Local Storage (browser.storage.local)
```typescript
interface LocalStorage {
  cvDocument: {
    fileName: string;
    uploadDate: string;
    docxBase64: string;  // Original DOCX as base64
    extractedText: string;  // Parsed plain text
  } | null;
  
  analyzedJobs: {
    [jobId: string]: {
      url: string;
      title: string;
      company: string;
      analyzedDate: string;
      matchScore: number;
      status: 'analyzed' | 'applied' | 'rejected' | 'interviewing';
      matchDetails: {
        matchedSkills: string[];
        missingSkills: string[];
        matchedExperience: string[];
      };
      notes?: string;
    }
  };
}
```

### Sync Storage (browser.storage.sync)
```typescript
interface SyncStorage {
  cvProfile: {
    skills: string[];
    experience: Array<{
      title: string;
      company: string;
      duration: string;
      description: string;
    }>;
    education: Array<{
      degree: string;
      institution: string;
      year: string;
    }>;
  };
  
  settings: {
    autoDetect: boolean;
    minimumMatchPercentage: number;
    enabledJobSites: string[];
    popupBehavior: 'badge' | 'auto-popup' | 'icon-only';
    analysisDetail: 'quick' | 'detailed';
  };
}
```

## API Design

### Message Passing (Content ↔ Background)
```typescript
// Message types
type ExtensionMessage = 
  | { type: 'JOB_DETECTED'; payload: { url: string; title: string } }
  | { type: 'ANALYZE_JOB'; payload: { jobData: JobData } }
  | { type: 'UPDATE_STATUS'; payload: { jobId: string; status: string } };

// Send message from content script
browser.runtime.sendMessage({
  type: 'JOB_DETECTED',
  payload: { url: window.location.href, title: document.title }
});

// Listen in background script
browser.runtime.onMessage.addListener((message: ExtensionMessage) => {
  switch (message.type) {
    case 'JOB_DETECTED':
      handleJobDetection(message.payload);
      break;
    // ...
  }
});
```

## Job Detection Logic

### URL Pattern Matching
```typescript
const JOB_PATTERNS = {
  linkedin: /linkedin\.com\/jobs\/view\/\d+/,
  indeed: /indeed\.com\/viewjob/,
  reed: /reed\.co\.uk\/jobs\/[^\/]+\/\d+/
};

function isJobPage(url: string): { isJob: boolean; site?: string } {
  for (const [site, pattern] of Object.entries(JOB_PATTERNS)) {
    if (pattern.test(url)) {
      return { isJob: true, site };
    }
  }
  return { isJob: false };
}
```

### Content Analysis (Fallback)
```typescript
// Check for job-specific elements on page
function detectJobFromContent(): boolean {
  const indicators = [
    document.querySelector('[data-job-id]'),
    document.querySelector('.job-description'),
    document.querySelector('.job-title'),
    // Site-specific selectors
  ];
  return indicators.some(el => el !== null);
}
```

## Analysis Algorithm (Phase 1 - Basic)

### Skill Matching
```typescript
function analyzeJob(jobData: JobData, cvProfile: CVProfile): Analysis {
  const jobSkills = extractSkills(jobData.description);
  const cvSkills = cvProfile.skills.map(s => s.toLowerCase());
  
  const matchedSkills = jobSkills.filter(skill => 
    cvSkills.includes(skill.toLowerCase())
  );
  
  const missingSkills = jobSkills.filter(skill => 
    !cvSkills.includes(skill.toLowerCase())
  );
  
  const matchScore = Math.round(
    (matchedSkills.length / jobSkills.length) * 100
  );
  
  return {
    matchScore,
    matchedSkills,
    missingSkills,
    recommendation: getRecommendation(matchScore),
    matchDetails: {
      matchedSkills,
      missingSkills,
      matchedExperience: [], // Phase 2
    }
  };
}

function getRecommendation(score: number): 'apply' | 'maybe' | 'pass' {
  if (score >= 70) return 'apply';
  if (score >= 50) return 'maybe';
  return 'pass';
}
```

## DOCX Parsing

### Using mammoth.js
```typescript
import mammoth from 'mammoth';

async function parseDocx(file: File): Promise<{ text: string; html: string }> {
  const arrayBuffer = await file.arrayBuffer();
  
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const textResult = await mammoth.extractRawText({ arrayBuffer });
  
  return {
    text: textResult.value,
    html: result.value
  };
}

// Auto-parse structured data (basic regex approach for Phase 1)
function extractStructuredData(text: string): Partial<CVProfile> {
  const skillsSection = text.match(/Skills?:?\s*\n([\s\S]*?)(?=\n\n|\n[A-Z])/i);
  const skills = skillsSection 
    ? skillsSection[1].split(/[,\n]/).map(s => s.trim()).filter(Boolean)
    : [];
  
  return { skills };
  // Phase 2: More sophisticated parsing with AI
}
```

## Build Configuration

### Vite Config (vite.config.ts)
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        background: resolve(__dirname, 'src/background/index.ts'),
        content: resolve(__dirname, 'src/content/detector.ts'),
        options: resolve(__dirname, 'src/options/index.html'),
      },
      output: {
        entryFileNames: '[name]/index.js',
        chunkFileNames: 'chunks/[name].[hash].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
```

## Security & Privacy

### Data Handling
- **Never send CV data to external servers** without explicit user consent
- Store DOCX locally only (browser.storage.local)
- Sync only structured, non-sensitive profile data
- No analytics or tracking
- Clear data deletion option in settings

### Content Script Isolation
- Minimal DOM manipulation
- Validate all data from page before processing
- Use Content Security Policy in manifest

## Testing Approach

### Unit Tests
- Test analysis algorithm with sample job data
- Test skill extraction logic
- Test storage utilities

### Integration Tests
- Test message passing between scripts
- Test storage sync behavior
- Test DOCX parsing with sample files

### Manual Testing
- Test on actual job sites (LinkedIn, Indeed, Reed)
- Test with real CV
- Test popup UI responsiveness
- Test settings persistence

## Performance Guidelines

### Content Scripts
- Debounce URL change detection (avoid excessive checks)
- Lazy inject popup component (only when needed)
- Minimize DOM queries

### Popup
- Lazy load heavy components
- Cache analysis results
- Show loading states for async operations

### Storage
- Batch storage operations
- Use debounced saves for settings
- Clear old analyzed jobs periodically (configurable retention)

## Development Phases

### Phase 1: MVP (Basic Job Analysis)
- ✅ CV upload (DOCX)
- ✅ Manual structured data entry
- ✅ Job page detection (URL patterns)
- ✅ Basic skill matching analysis
- ✅ Match percentage + recommendation
- ✅ Simple popup UI
- ✅ Local storage

### Phase 2: Enhanced Features
- Advanced content-based job detection
- Experience matching
- Application tracking (status, notes)
- Settings page with preferences
- Auto-parse CV sections (skills, experience)
- Sync storage for structured data

### Phase 3: AI Integration
- Claude API for advanced analysis
- Keyword optimization suggestions
- Modified CV generation
- Context-aware recommendations

## When Generating Code

1. **Ask for clarification** if job site structure is unknown
2. **Start with TypeScript types** - define interfaces first
3. **Implement happy path** before edge cases
4. **Use browser.* API** not chrome.* (Firefox compatibility)
5. **Test storage quota** - check limits before large writes
6. **Handle permissions** - request only what's needed
7. **Add console.info** for debugging (remove in production)
8. **Include error boundaries** in React components

## Don't

- Use `chrome.*` APIs (use `browser.*` for Firefox)
- Store sensitive data in sync storage
- Make network requests without user consent
- Inject UI without checking if already injected
- Use localStorage (use browser.storage instead)
- Assume CV structure (provide fallbacks)
- Auto-submit applications (always user-triggered)
- Log user data to console in production

## Do

- Use TypeScript strict mode
- Validate all external data (page content, API responses)
- Provide loading and error states
- Make UI responsive (popup can be small)
- Test on multiple job sites
- Document storage schema changes
- Version the extension properly
- Provide clear user feedback for all actions
- Handle offline scenarios gracefully
- Make settings easily accessible
