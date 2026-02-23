# Job Application Analyser

Match your CV against a job description and find out how well you fit — instantly, in your browser.

**[job-application-analyzer.vercel.app](https://job-application-analyzer.vercel.app)**

No account. No server. No data leaves your device.

---

## What it does

Paste a job description, upload your CV (`.docx` or `.pdf`), and get:

- **A match score** — how well your skills align with what the role asks for
- **Apply / Maybe / Pass recommendation** — based on required vs preferred skills
- **Matched and missing skills** — exactly what you have and what you're short on
- **Role fit summary** — plain-English explanation of your score
- **Keyword copy** — one click to copy missing skills as bullet points ready to add to your CV

---

## Features

### CV Analysis
- Upload `.docx` or `.pdf`, or paste text directly
- Skill editor — review, remove, or add extracted skills before analysing
- CV parse preview — see what the parser picked up (name, titles, experience) before committing
- Weighted scoring: required skills count 3× more than preferred

### Application Tracker
- Pipeline status per job: **Saved → Applied → Interview → Offer / Rejected**
- Notes on every entry, saved automatically
- Search and filter history by title, company, or status
- Export full history as CSV

### CV Improvement
- **Recurring skill gaps** — bar chart of skills missing across your recent applications
- **Keyword suggestions** — one-click copy of missing skills as bullet points for your CV

### Reach
- **PWA** — installable on Android and iOS, opens full-screen like a native app, works offline
- **Shareable results links** — compressed URL you can send to anyone; they see the full results immediately
- **Bookmarklet** — drag to your bookmarks bar, then click it on any job listing to pre-fill the analyser

### UX
- Dark mode
- Fully responsive (mobile-friendly, 44px touch targets)
- Clean minimal layout — not AI chatbot output, a proper report

---

## Privacy

Everything runs locally in your browser.
Your CV and job descriptions are never uploaded, stored externally, or transmitted anywhere.
Analysis history lives in your browser's `localStorage` and stays on your device.

---

## Tech stack

| Layer | Tech |
|---|---|
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Build | Vite |
| Hosting | Vercel (auto-deploys on push to `main`) |
| DOCX parsing | mammoth.js |
| PDF parsing | pdf.js |
| Compression | lz-string (shareable links) |
| State | Zustand + localStorage |

---

## Running locally

```bash
git clone https://github.com/charliegdeburiatte-hub/Job-Application-Analyzer.git
cd Job-Application-Analyzer
npm install
npm run dev
```

App runs at `http://localhost:5173`.

```bash
npm run build    # production build → dist/
npm run preview  # preview production build locally
```

---

## Project structure

```
src/
├── pages/
│   ├── HomePage.tsx       # CV upload, job paste, history, skill gaps
│   ├── ResultsPage.tsx    # Score, recommendation, matched/missing skills
│   └── DecodePage.tsx     # Shareable link decoder
├── components/            # Shared UI components
├── utils/
│   ├── analysis.ts        # Scoring algorithm
│   ├── cvParser.ts        # DOCX/PDF parsing
│   └── skillExtractor.ts  # Skill detection from job descriptions
├── App.tsx
└── index.css
public/
├── manifest.json          # PWA manifest
├── sw.js                  # Service worker
└── icons/                 # PWA icons
```

---

## Roadmap

- [ ] Semantic skill matching — "JS" = "JavaScript", "3 years Python" = "Python (advanced)"
- [ ] Job URL parsing — paste a LinkedIn/Indeed URL and fetch the JD automatically (needs a small backend)
- [ ] Claude API integration — cover letter generation and CV tailoring suggestions
- [ ] Salary banding — extract salary from JD, flag relative to market rate

---

## Version history

| Version | Date | Notes |
|---|---|---|
| v2.0.0 | Feb 2026 | Initial public release — full feature set stable |
| v1.4.x | Jan 2026 | Application tracker, CV improvement engine, PWA, bookmarklet, UI refresh |
| v1.0.x | Jan 2026 | Core CV analysis, scoring algorithm, history |

---

## Licence

MIT — see [LICENSE](LICENSE) for details.

---

**[Try it →](https://job-application-analyzer.vercel.app)** • [Report a bug](https://github.com/charliegdeburiatte-hub/Job-Application-Analyzer/issues)
