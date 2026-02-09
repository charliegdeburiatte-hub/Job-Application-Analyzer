# Job Application Analyzer

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-19.2.3-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)
![Deployed](https://img.shields.io/badge/deployed-Vercel-black.svg)

**A web application that analyzes job postings against your CV using advanced weighted scoring algorithms.**

[Live Demo](https://your-vercel-url.vercel.app) • [Features](#features) • [How It Works](#how-it-works) • [Tech Stack](#tech-stack) • [Development](#development)

</div>

---

## 🎯 Overview

Job Application Analyzer is a privacy-first web application that helps job seekers make data-driven decisions. Upload your CV once, paste any job description, and get an instant match score with detailed skill analysis.

**Why This Tool?**
- 🎯 **Objective Decision Making**: Stop guessing if you're qualified - get a data-driven match score
- 🔒 **100% Private**: All processing happens in your browser - no data sent to servers
- ⚡ **Instant Results**: Upload CV once, analyze unlimited jobs
- 📊 **Transparent Scoring**: See exactly how your score is calculated
- 💾 **Persistent Storage**: CV saved in browser - analyze jobs anytime

**Key Features:**
- 🧠 **Weighted Scoring Algorithm**: Required skills weighted 3x more than preferred skills
- 📈 **Experience Bonus**: Up to +20 points based on years of experience
- 🎨 **Professional UI/UX**: Dark mode support, responsive design
- 🔬 **Testing Tools**: Compressed debug strings for validation and testing
- 🔓 **Decoder Tool**: View full analysis data from compressed strings

---

## 🚀 How It Works

### 1. Upload Your CV
- Upload your CV in `.docx` format
- Automatically extracts skills, experience, and qualifications
- CV is saved in your browser - no re-uploading needed

### 2. Paste Job Description
- Copy any job description from LinkedIn, Indeed, etc.
- Paste into the text area
- Optionally add job title and company name

### 3. Get Instant Analysis
- **Match Score**: 0-100% compatibility score
- **Matched Skills**: Skills you have that match the job
- **Missing Skills**: Skills the job requires that you don't have
- **Recommendation**: Apply (≥70%), Maybe (50-69%), or Pass (<50%)
- **Scoring Breakdown**: Transparent calculation details

### 4. Track Your Tests (Optional)
- Copy compressed debug string for each analysis
- Use the decoder tool to view full data including job description
- Perfect for validating scoring accuracy across multiple jobs

---

## ✨ Features

### Core Functionality

#### 📄 CV Parsing
- **DOCX Support**: Upload your CV in `.docx` format
- **Automatic Extraction**: Parses skills, experience, education
- **Persistent Storage**: CV saved in browser localStorage
- **Skill Database**: Recognizes 200+ technical and soft skills
- **Experience Calculation**: Filters self-employment, calculates total years

#### 🎯 Intelligent Scoring Algorithm

```typescript
Match Score = (Weighted Skill Score + Experience Bonus)

// Weighted Skill Matching
Required Skills: 3x weight
Preferred Skills: 1x weight

// Experience Bonus
Up to +20 points (2 points per year, capped at 10 years)

// Final Score
Capped at 100%, decimal precision maintained
```

**Why Weighted Scoring?**
- Required skills are 3x more important than preferred (realistic job market)
- Experience bonus rewards proven track record
- Prevents gaming the system (can't hit 100% on preferred skills alone)

#### 📊 Detailed Analysis

- **Match Percentage**: Visual circular progress indicator
- **Skill Categorization**: Frontend, Backend, Tools, Soft Skills
- **Strength Areas**: What you excel at
- **Skill Gaps**: Where you could improve
- **Scoring Details**: Required vs Preferred matches, experience bonus

#### 🔬 Testing & Validation Tools

- **Compressed Debug Strings**: Uses LZ-String compression (60-80% size reduction)
- **Includes Full Data**: Job description, all skills, scoring breakdown
- **Decoder Tool**: `/decode` page to view compressed data
- **Perfect for QA**: Track 20+ job analyses, validate scoring accuracy

#### 🎨 User Experience

- **Dark Mode**: Full dark theme with WCAG-compliant contrast
- **Responsive Design**: Works on desktop, tablet, mobile
- **Instant Feedback**: No loading screens, instant analysis
- **Privacy First**: All processing in-browser, no tracking
- **Clean UI**: Modern design with Tailwind CSS

---

## 🛠️ Tech Stack

### Frontend
- **React 19.2.3** - Modern UI with hooks
- **TypeScript 5.9.3** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **React Router DOM** - Client-side routing

### Build & Development
- **Vite 7.3.1** - Lightning-fast builds with HMR
- **PostCSS** - CSS processing
- **ESLint** - Code quality

### Libraries
- **mammoth.js** - DOCX parsing
- **lz-string** - Compression/decompression for debug strings
- **lucide-react** - Icon library

### Deployment
- **Vercel** - Serverless deployment
- **GitHub Actions** - CI/CD (optional)

---

## 🏗️ Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────┐
│                     Web Application                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐      ┌──────────────┐      ┌────────┐ │
│  │   HomePage   │      │ ResultsPage  │      │ Decode │ │
│  │              │─────▶│              │      │  Page  │ │
│  │ - CV Upload  │      │ - Analysis   │      │        │ │
│  │ - Job Paste  │      │ - Scoring    │      └────────┘ │
│  └──────────────┘      │ - Debug Str  │                 │
│         │              └──────────────┘                 │
│         ▼                                                │
│  ┌──────────────────────────────────────────┐           │
│  │         Analysis Engine                   │           │
│  │  - CV Parser (mammoth.js)                │           │
│  │  - Skill Extractor                       │           │
│  │  - Weighted Scoring Algorithm            │           │
│  │  - Compression (lz-string)               │           │
│  └──────────────────────────────────────────┘           │
│         │                                                │
│         ▼                                                │
│  ┌──────────────────────────────────────────┐           │
│  │         localStorage                      │           │
│  │  - CV Profile (persisted)                │           │
│  │  - Dark Mode Preference                  │           │
│  └──────────────────────────────────────────┘           │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Scoring Algorithm Details

**Phase 1: Skill Extraction**
```typescript
requiredSkills = extractRequiredSkills(jobDescription)
preferredSkills = extractPreferredSkills(jobDescription)
```

**Phase 2: Matching**
```typescript
requiredMatched = cvSkills ∩ requiredSkills
preferredMatched = cvSkills ∩ preferredSkills
```

**Phase 3: Weighted Score**
```typescript
requiredScore = (requiredMatched / requiredTotal) × 3  // 3x weight
preferredScore = (preferredMatched / preferredTotal) × 1

baseScore = ((requiredScore + preferredScore) / totalWeight) × 100
```

**Phase 4: Experience Bonus**
```typescript
experienceBonus = min(20, yearsOfExperience × 2)
```

**Phase 5: Final Score**
```typescript
matchScore = min(100, Math.round(baseScore + experienceBonus))
```

---

## 📦 Installation & Development

### Prerequisites
- Node.js 18+ and npm
- Modern web browser

### Local Setup

```bash
# Clone repository
git clone https://github.com/charliegdeburiatte-hub/Job-Application-Analyzer.git
cd Job-Application-Analyzer/web

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

### Project Structure

```
web/
├── src/
│   ├── pages/
│   │   ├── HomePage.tsx          # CV upload & job paste
│   │   ├── ResultsPage.tsx       # Analysis display
│   │   └── DecodePage.tsx        # Debug string decoder
│   ├── components/
│   │   ├── MatchScore.tsx        # Circular progress indicator
│   │   └── SkillsList.tsx        # Categorized skill display
│   ├── shared/
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript definitions
│   │   └── utils/
│   │       ├── analysis.ts       # Scoring algorithm
│   │       ├── cvParser.ts       # DOCX parsing
│   │       └── skillExtractor.ts # Skill detection
│   ├── App.tsx                   # Root component, routing
│   └── index.css                 # Tailwind styles
├── public/
│   └── logo.jpeg                 # Branding
├── dist/                         # Build output
├── package.json
├── vite.config.ts
└── vercel.json                   # Vercel deployment config
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set root directory to `web`
   - Deploy!

3. **Automatic Deployments**
   - Every push to `main` triggers a new deployment
   - Preview deployments for pull requests

### Environment Configuration

No environment variables needed - everything runs client-side!

---

## 🔬 Testing Tools

### Compressed Debug Strings

Each analysis generates a compressed string containing:
- Full job description
- All matched/missing skills
- Scoring breakdown
- Recommendation

**Usage:**
1. Analyze a job
2. Click "📋 Copy" in the debug section
3. Paste to file for tracking or share with others
4. Use `/decode` page to view full data

**Example:**
```
N4IgdghgtgpiBcIDKBXAlgYwPYwJYBc0A7XAEzwGcsAnAGhEQHsBlCAOQEk...
```
(Decompresses to full JSON with job description and all analysis data)

---

## 📝 Version History

### v2.0.0 (2026-02-09) - Web Application Pivot
**Major Changes:**
- ✅ Complete pivot from Firefox extension to web application
- ✅ Deployed on Vercel for universal access
- ✅ CV persistence with localStorage (survives page refreshes)
- ✅ Compressed debug strings with decoder tool
- ✅ Dark mode preference persistence
- ✅ Routing with React Router DOM

### v1.4.0 (2026-01-27) - Firefox Extension (Legacy)
- Fixed 97% score clustering bug
- Added weighted scoring algorithm
- Improved dark mode contrast
- 73 unit tests passing

---

## 🎯 Roadmap

### Short Term
- [ ] PDF CV support (in addition to DOCX)
- [ ] Export analysis to PDF
- [ ] Multiple CV profiles (Technical, Management, etc.)
- [ ] Browser extension for auto-analysis on job sites

### Medium Term
- [ ] Analysis history with IndexedDB
- [ ] Batch job analysis (paste 10 jobs, analyze all)
- [ ] Skill gap learning recommendations
- [ ] Cover letter suggestions based on gaps

### Long Term
- [ ] AI-powered job description parsing (Claude API)
- [ ] Salary range estimation based on skills
- [ ] Interview preparation based on missing skills
- [ ] Chrome/Safari support

---

## 🐛 Known Issues

- Large CV files (>5MB) may be slow to parse
- Some specialized skills may not be in the 200+ skill database
- Job descriptions without clear "required" sections may not weight correctly

**Report bugs:** [GitHub Issues](https://github.com/charliegdeburiatte-hub/Job-Application-Analyzer/issues)

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Charlie de Buriatte**

- GitHub: [@charliegdeburiatte-hub](https://github.com/charliegdeburiatte-hub)
- Project: [Job Application Analyzer](https://github.com/charliegdeburiatte-hub/Job-Application-Analyzer)

---

## 🙏 Acknowledgments

- Built with modern web technologies and best practices
- Inspired by the need for objective, data-driven job application decisions
- Thanks to the open-source community for excellent tooling

---

<div align="center">

**⭐ Star this repo if you find it useful!**

[Try Live Demo](https://your-vercel-url.vercel.app) • [Report Bug](https://github.com/charliegdeburiatte-hub/Job-Application-Analyzer/issues) • [Request Feature](https://github.com/charliegdeburiatte-hub/Job-Application-Analyzer/issues)

---

**Privacy First** • **No Data Collection** • **Open Source**

</div>
