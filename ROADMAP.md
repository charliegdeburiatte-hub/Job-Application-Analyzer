# Job Application Analyser — Roadmap

**Current state: Public Beta (v0.9)**
*Last updated: 2026-02-17*

Web app is live on Vercel. Core features complete:
- CV upload (.docx, .pdf) + plain text paste
- Job description paste → match analysis
- Score circle, skill breakdown, strengths/gaps
- PDF + JSON export of results
- Multiple named CV profiles (localStorage)
- Analysis history (last 20, persistent)
- Dark mode, purple theme, British English

---

## Stage 1 — Beta Hardening (v0.9 → v1.0)

**Goal:** Make what exists trustworthy and polished enough to share publicly.

- [ ] **Skill editor** — After parsing, let the user add/remove skills manually. Parser misses things — this is the biggest accuracy gap.
- [ ] **CV parse preview** — Show extracted name, skills, experience years before analysing. Currently a black box.
- [ ] **Clearer score explanation** — Surface the "why" better. e.g. "You matched 6 of 8 required skills. The 2 missing are the main reason for 72%."
- [ ] **Error handling pass** — Scanned/image-only PDFs, corrupt DOCX files. Currently fails silently.
- [ ] **Mobile layout pass** — Works but not properly tested on phones.

---

## Stage 2 — Application Tracker (v1.1)

**Goal:** Turn it from a one-off tool into something used throughout a job search.

- [x] **Job pipeline** — History entries get a status: `Saved → Applied → Interview → Offer / Rejected`.
- [x] **Notes per job** — Free-text note on any history entry ("Applied 14 Feb", "Recruiter: Sarah").
- [x] **Filter/search history** — Search by company, filter by score range.
- [x] **Export history as CSV** — For people tracking applications in a spreadsheet.

---

## Stage 3 — CV Improvement Engine (v1.2)

**Goal:** Tell the user what to actually do, not just how they scored.

- [ ] **Gap analysis across history** — "Python, AWS, Docker appear as missing in 7 of your last 10 analyses."
- [ ] **Keyword suggestions** — "Add these exact phrases to your CV to improve your match for roles like this."
- [ ] **Role fit summary** — Short plain-English paragraph explaining the match. "Strong experience in support and Microsoft 365. Main gaps are cloud infrastructure and ITIL."

---

## Stage 4 — Reach & Distribution (v1.3)

**Goal:** Easier to get to and easier to share.

- [ ] **PWA** — Web app manifest so it installs on phone/desktop like an app. No app store needed.
- [ ] **Shareable results link** — URL with compressed result encoded. Infrastructure already exists (lz-string + decode page).
- [ ] **Bookmarklet** — One-click to copy a job description from any page and open the analyser with it pre-filled.
- [ ] **Firefox extension revival** — Reconnect extension to the shared analysis engine.

---

## Stage 5 — Intelligence (v2.0, longer term)

**Goal:** Stop being purely keyword-matching, start being actually smart.

- [ ] **Semantic skill matching** — "JavaScript" = "JS". "3 years Python" = "Python (advanced)". Currently exact-match only.
- [ ] **Job URL parsing** — Paste a LinkedIn/Indeed URL, fetch and parse the job automatically. Needs small backend or proxy.
- [ ] **Claude API integration** — Use Claude for the role fit summary and keyword suggestions. Proper NLP rather than regex.
- [ ] **Salary banding** — Extract salary from job description, flag relative to market rate.

---

## Deliberately NOT planned

- User accounts / cloud sync (localStorage is fine, avoids auth + privacy issues)
- Chrome extension (too much maintenance for two platforms)
- Job board partnerships (way too early)

---

## Version History

| Version | Status | Key Features |
|---------|--------|-------------|
| v1.4.2 | Released (Firefox ext) | LinkedIn fix, manual paste |
| v0.9 Beta | **Current (web)** | Full web app with profiles, history, PDF export |
| v1.0 | Planned | Beta hardening, skill editor, mobile polish |
| v1.1 | Planned | Application tracker |
| v1.2 | Planned | CV improvement engine |
| v1.3 | Planned | PWA, shareable links |
| v2.0 | Future | Semantic matching, AI integration |
