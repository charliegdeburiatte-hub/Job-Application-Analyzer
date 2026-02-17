# Job Application Analyser - Web Application

This is the web application version of the Job Application Analyser.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── pages/
│   ├── HomePage.tsx          # CV upload & job description input
│   ├── ResultsPage.tsx       # Analysis results display
│   └── DecodePage.tsx        # Debug string decoder tool
├── components/
│   ├── MatchScore.tsx        # Circular progress indicator
│   └── SkillsList.tsx        # Categorized skill display
├── shared/
│   ├── types/                # TypeScript definitions
│   ├── utils/                # Core logic (analysis, CV parsing)
│   └── constants/            # Skill database, patterns
├── App.tsx                   # Root component with routing
└── index.css                 # Tailwind CSS styles
```

## 🛠️ Tech Stack

- **React 19.2.3** - UI framework
- **TypeScript 5.9.3** - Type safety
- **Tailwind CSS 4** - Styling
- **Vite 7.3.1** - Build tool
- **React Router DOM** - Client-side routing
- **mammoth.js** - DOCX parsing
- **lz-string** - Compression for debug strings

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Key Features

1. **CV Parsing**: Extracts skills, experience from .docx files
2. **Weighted Scoring**: Required skills 3x weight, preferred 1x weight
3. **localStorage Persistence**: CV and dark mode preferences saved
4. **Compressed Debug Strings**: LZ-String compression for testing
5. **Decoder Tool**: View full analysis data at `/decode`

## 📦 Deployment

This app is configured for **Vercel** deployment:

1. Push to GitHub
2. Import repository to Vercel
3. Set root directory to `web`
4. Deploy!

See `vercel.json` for configuration.

## 📖 Documentation

See the [main README](../README.md) for full documentation.

## 🔒 Privacy

All processing happens client-side. No data is sent to servers.
