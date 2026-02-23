# Job Application Analyser — Development Progress

**Project:** Web app that matches a CV against a job description and scores the fit.
**Stack:** React + TypeScript + Tailwind CSS + Vite, deployed on Vercel.
**All analysis runs locally in the browser — no server, no data sent anywhere.**

---

## What Was Already Built (Before This Session)

- CV upload (.docx and .pdf) + plain text paste
- Job description paste → keyword match analysis
- Score circle, skill breakdown, strengths/gaps
- PDF + JSON export of results
- Multiple named CV profiles (localStorage)
- Analysis history (last 20, persistent)
- Dark mode, purple theme, British English

---

## Stage 1 — Beta Hardening (v0.9 → v1.0) ✅

**Goal:** Make what existed trustworthy and polished enough to share publicly.

### Skill Editor
- Collapsible "Review & Edit Skills" panel after CV loads
- All parsed skills shown as removable chips (click × to remove)
- Add-skill input with Enter key support
- Changes affect the match score in real time

### CV Parse Preview
- Shows extracted name, job titles, and years of experience before analysing
- Previously a black box — users had no idea what the parser picked up

### Clearer Score Explanation
- Plain-English sentence in the recommendation card
- e.g. "You matched 6 of 8 required skills — the 2 missing skills are the main reason for your score."

### Error Handling
- Scanned/image-only PDFs now surface a clear message instead of failing silently
- Parser errors shown to the user rather than replaced with a generic fallback

### Mobile Layout
- Responsive header (smaller text on mobile, subtitle hidden)
- Touch targets properly sized (min 44px)
- Cards use tighter padding on small screens

### Bug Fixes
- Fixed experience years displaying incorrectly in results
- Fixed critical threshold bug where a 100% match showed "Maybe" instead of "Apply"

---

## Stage 2 — Application Tracker (v1.1) ✅

**Goal:** Turn it from a one-off tool into something useful throughout a job search.

### Job Pipeline Status
- Each history entry has a status: **Saved → Applied → Interview → Offer / Rejected**
- Colour-coded pill (grey / blue / amber / green / red)
- Changed via dropdown directly in the history card
- Persists to localStorage automatically

### Notes Per Job
- "+ Add note" button on every history entry
- Textarea appears on click, saves when you click away
- Existing notes shown as "📝 note text" and remain editable

### Search & Filter History
- Search box filters by job title or company (live, case-insensitive)
- Status dropdown to filter to a single pipeline stage
- "No analyses match" empty state when filters return nothing

### Export History as CSV
- "📥 Export CSV" button always visible in the history card header
- Downloads all entries (unfiltered) with columns:
  Date, Job Title, Company, Score, Recommendation, Status, Notes, Matched Skills, Missing Skills

---

## Stage 3 — CV Improvement Engine (v1.2) ✅

**Goal:** Give actionable insight from the data — no AI, all logic-driven.

### Recurring Skill Gaps
- Card on the home page (shown when 3+ analyses exist)
- Aggregates missing skills across all history entries
- Bar chart showing top 6 most frequently missing skills and how many roles they appeared in
- e.g. "Docker — 8 roles, Kubernetes — 5 roles"

### Role Fit Summary
- Replaced the single-sentence score explanation with a proper 2-sentence paragraph
- Names the actual missing skills, not just counts
- Three variants: all required matched / partial match / preferred-only match

### Keyword Suggestions
- "Copy for CV" button in the Missing Skills section
- Copies a bullet-point list of missing skills to the clipboard
- One click to get exactly what to add to your CV

---

## Stage 4 — Reach & Distribution (v1.3) ✅

**Goal:** Easier to get to and easier to share.

### PWA (Progressive Web App)
- Web app manifest with name, description, purple theme colour
- Custom purple icon (SVG, scales to any size)
- Service worker for offline shell caching
- "Add to Home Screen" works on Android Chrome and iOS Safari
- Opens full-screen with no browser chrome, like a native app

### Shareable Results Link
- "🔗 Share" button on the results page
- Copies a full URL to the clipboard: `yoursite.com/decode?data=<compressed>`
- Anyone opening that link sees the full decoded results immediately
- Uses existing lz-string compression — no new infrastructure needed
- Debug block collapsed by default (tiny "debug" toggle at the bottom)

### Bookmarklet
- Drag-to-bookmark button on the home page
- Click it on any job listing page to open the analyser with the job description pre-filled
- Uses selected text on the page, or prompts you to paste if nothing is selected
- React blocks `javascript:` URLs in props — fixed by setting `href` directly on the DOM via `useRef` after mount

---

## UI Refresh ✅

**Goal:** Cleaner, less AI-looking. Less card-heavy, more like a real tool.

### What Changed
- **"How It Works"** — removed card border, now a plain 3-column grid
- **Bookmarklet section** — removed card, sits under a single thin separator line
- **Privacy notice** — removed purple card, now a single line of small grey text
- **Results page — score + recommendation + job info** — merged into one clean left-border-accent section (border only, no filled background)
- **Matched/Missing skills** — removed card boxes, replaced with open sections using thin hairline dividers and small uppercase labels
- **Strengths** — removed green filled card, now an open section with green label and ✓ checkmarks
- **Gaps** — removed yellow filled card, now an open section with amber label and → arrows
- **Profile summary** — removed card, just inline stats with a top divider
- **Debug block** — shrunk to a near-invisible "debug" text toggle at the very bottom

### Net Result
Went from ~16 stacked card boxes across both pages to ~5. The pages now read like a well-designed form and a clean report rather than a collection of AI chatbot output cards.

---

## Deferred / Future Work

### Firefox Extension Revival
Deferred until back in England with more control over the dev environment.

### Stage 5 — Intelligence (longer term)
- **Semantic skill matching** — "JS" = "JavaScript", "3 years Python" = "Python (advanced)"
- **Job URL parsing** — paste a LinkedIn/Indeed URL, fetch and parse the job automatically (needs a small backend)
- **Claude API integration** — use Claude Haiku for cover letter generation and CV tailoring suggestions
  - Estimated cost: ~$0.005 per job, ~$0.50/month for 100 jobs
  - Main blocker is architecture (needs a backend to hold the API key safely), not cost
- **Salary banding** — extract salary from job description, flag relative to market rate

---

## Technical Notes

- **Remote:** SSH (switched from HTTPS after VM credential issues with `gh auth git-credential`)
- **Deployment:** Vercel (auto-deploys on push to `main`)
- **localStorage keys:** `analysisHistory`, `cvProfile`, `savedProfiles`, `darkMode`
- **No user accounts, no cloud sync** — deliberate, avoids auth complexity and privacy issues
