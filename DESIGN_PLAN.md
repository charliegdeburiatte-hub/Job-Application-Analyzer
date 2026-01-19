# Design & Planning Document
## Job Application Analyzer - Visual Identity & UI Design

---

## 🎨 Color Palette

### Primary Colors
**To be decided together:**

#### Option 1: Professional Blue (Trustworthy, Career-focused)
```
Primary:     #2563EB (Blue-600)    - Main actions, links
Primary-Dark: #1E40AF (Blue-700)   - Hover states
Primary-Light: #DBEAFE (Blue-50)   - Backgrounds, highlights

Secondary:   #10B981 (Green-500)   - Success, "Apply" recommendations
Accent:      #F59E0B (Amber-500)   - "Maybe" recommendations
Danger:      #EF4444 (Red-500)     - "Pass" recommendations, errors
```

#### Option 2: Modern Purple (Creative, Tech-forward)
```
Primary:     #7C3AED (Purple-600)  - Main actions, links
Primary-Dark: #6D28D9 (Purple-700) - Hover states
Primary-Light: #EDE9FE (Purple-50) - Backgrounds, highlights

Secondary:   #10B981 (Green-500)   - Success, "Apply" recommendations
Accent:      #F59E0B (Amber-500)   - "Maybe" recommendations
Danger:      #EF4444 (Red-500)     - "Pass" recommendations, errors
```

#### Option 3: Teal/Cyan (Fresh, Modern, Approachable)
```
Primary:     #0891B2 (Cyan-600)    - Main actions, links
Primary-Dark: #0E7490 (Cyan-700)   - Hover states
Primary-Light: #CFFAFE (Cyan-50)   - Backgrounds, highlights

Secondary:   #10B981 (Green-500)   - Success, "Apply" recommendations
Accent:      #F59E0B (Amber-500)   - "Maybe" recommendations
Danger:      #EF4444 (Red-500)     - "Pass" recommendations, errors
```

### Neutral Colors (Universal across all options)
```
Background:  #FFFFFF (White)       - Main background
Surface:     #F9FAFB (Gray-50)     - Cards, panels
Border:      #E5E7EB (Gray-200)    - Dividers, borders
Text-Dark:   #111827 (Gray-900)    - Primary text
Text-Medium: #6B7280 (Gray-500)    - Secondary text
Text-Light:  #9CA3AF (Gray-400)    - Placeholder text
```

### Semantic Colors (Consistent across options)
```
Success:     #10B981 (Green-500)   - Applied status, positive actions
Warning:     #F59E0B (Amber-500)   - Maybe status, warnings
Error:       #EF4444 (Red-500)     - Errors, rejected status
Info:        #3B82F6 (Blue-500)    - Informational messages
```

---

## **👉 YOUR CHOICE:**

**Which color option do you prefer?**
- [ ] Option 1: Professional Blue
- [ ] Option 2: Modern Purple  
- [ ] Option 3: Teal/Cyan
- [ ] Other: _______________

**Why?** (helps me understand your preference)

---

## 📐 Typography

### Font Stack
```css
Font Family: 
  -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
  'Helvetica Neue', Arial, sans-serif

Why: System fonts for fast loading and native feel
```

### Font Sizes (Tailwind classes)
```
Heading 1:   text-2xl (24px)  - Page titles
Heading 2:   text-xl (20px)   - Section headers
Heading 3:   text-lg (18px)   - Subsection headers
Body:        text-base (16px) - Main text
Small:       text-sm (14px)   - Secondary info
Tiny:        text-xs (12px)   - Labels, metadata
```

### Font Weights
```
Bold:        font-bold (700)    - Headings, emphasis
Semibold:    font-semibold (600) - Subheadings
Medium:      font-medium (500)  - Buttons, labels
Regular:     font-normal (400)  - Body text
```

---

## 🎯 Brand Identity

### Extension Name
**Final Name:** Job Application Analyzer

**Short Name (for icon):** JAA or Job Analyzer

**Tagline Options:**
- [ ] "Apply Smarter, Not Harder"
- [ ] "Find Your Perfect Fit"
- [ ] "Data-Driven Job Applications"
- [ ] "Your CV's Best Friend"
- [ ] Other: _______________

### Logo/Icon Concept

**Icon Style:**
- [ ] Minimalist geometric
- [ ] Illustrative/playful
- [ ] Professional/corporate
- [ ] Tech/modern

**Icon Elements (choose 1-2):**
- [ ] Checkmark (approval/matching)
- [ ] Magnifying glass (analysis/search)
- [ ] Document/CV icon
- [ ] Chart/graph (analytics)
- [ ] Target/bullseye (job fit)
- [ ] Briefcase (career)
- [ ] Other: _______________

**Icon Color:**
- [ ] Use primary brand color
- [ ] Multi-color gradient
- [ ] Monochrome (black/gray)
- [ ] Other: _______________

---

## 🖼️ UI Component Design

### Buttons

#### Primary Button (Main actions)
```
Background: [Primary Color]
Text: White
Hover: [Primary-Dark]
Padding: px-4 py-2 (16px horizontal, 8px vertical)
Border-radius: rounded-lg (8px)
Font: font-medium
```

#### Secondary Button (Less emphasis)
```
Background: White
Text: [Primary Color]
Border: 1px solid [Primary Color]
Hover: [Primary-Light] background
Padding: px-4 py-2
Border-radius: rounded-lg
Font: font-medium
```

#### Danger Button (Destructive actions)
```
Background: #EF4444 (Red)
Text: White
Hover: #DC2626 (Red-600)
Padding: px-4 py-2
Border-radius: rounded-lg
Font: font-medium
```

### Cards
```
Background: White
Border: 1px solid [Border color]
Border-radius: rounded-xl (12px)
Shadow: shadow-sm (subtle)
Padding: p-4 (16px)
Hover: shadow-md (elevated)
```

### Badges

#### Match Score Badge
```
High (70-100%):   bg-green-100 text-green-800
Medium (50-69%):  bg-amber-100 text-amber-800
Low (0-49%):      bg-red-100 text-red-800
Padding: px-3 py-1
Border-radius: rounded-full
Font: text-sm font-semibold
```

#### Status Badges
```
Applied:      bg-blue-100 text-blue-800
Analyzing:    bg-gray-100 text-gray-800
Rejected:     bg-red-100 text-red-800
Interviewing: bg-purple-100 text-purple-800
```

### Input Fields
```
Background: White
Border: 1px solid [Border color]
Focus Border: [Primary Color]
Border-radius: rounded-lg (8px)
Padding: px-3 py-2
Font: text-base
Placeholder: text-[Text-Light]
```

---

## 📱 Layout & Spacing

### Popup Dimensions
```
Width: 400px (fixed)
Height: 600px (fixed, scrollable content)
```

### Spacing Scale (Tailwind)
```
Extra Small: space-1 (4px)
Small:       space-2 (8px)
Medium:      space-4 (16px)
Large:       space-6 (24px)
Extra Large: space-8 (32px)
```

### Component Spacing
```
Between sections:     mb-6 (24px)
Between elements:     mb-4 (16px)
Between form fields:  mb-3 (12px)
Between list items:   mb-2 (8px)
```

---

## 🎨 Visual Design Patterns

### Match Score Display

**Large Circular Progress:**
```
Size: 120px diameter
Stroke width: 12px
Color: Based on score
  - 70-100%: Green
  - 50-69%: Amber
  - 0-49%: Red
Center text: {score}%
Font: text-4xl font-bold
```

**Linear Progress Bar:**
```
Height: 8px
Background: Gray-200
Fill: Based on score (Green/Amber/Red)
Border-radius: rounded-full
Animated fill transition
```

### Recommendation Cards

**"Apply" Card:**
```
Border-left: 4px solid Green-500
Background: Green-50
Icon: ✅ or thumbs up
```

**"Maybe" Card:**
```
Border-left: 4px solid Amber-500
Background: Amber-50
Icon: ⚠️ or question mark
```

**"Pass" Card:**
```
Border-left: 4px solid Red-500
Background: Red-50
Icon: ✗ or thumbs down
```

### Skill Tags

**Matched Skills:**
```
Background: Green-100
Text: Green-800
Border: 1px solid Green-300
Icon: ✓ prefix
```

**Missing Skills:**
```
Background: Red-100
Text: Red-800
Border: 1px solid Red-300
Icon: ✗ prefix
```

---

## 🌗 Dark Mode (Future Feature)

**Do you want dark mode support?**
- [ ] Yes, plan for it from the start
- [ ] No, light mode only for MVP
- [ ] Maybe later

If yes, here's the dark palette:
```
Background:  #111827 (Gray-900)
Surface:     #1F2937 (Gray-800)
Border:      #374151 (Gray-700)
Text-Light:  #F9FAFB (Gray-50)
Text-Medium: #D1D5DB (Gray-300)
```

---

## 🔤 Copy & Microcopy

### Button Labels
```
Primary Actions:
- "Analyze Job"
- "Mark as Applied"
- "Upload CV"
- "Save Changes"

Secondary Actions:
- "View Details"
- "Edit Profile"
- "Cancel"

Destructive:
- "Delete"
- "Clear History"
- "Reject"
```

### Empty States
```
No CV uploaded:
"Upload your CV to start analyzing jobs"

No analyzed jobs:
"Visit a job posting to see your first analysis"

No search results:
"No jobs match your search"
```

### Error Messages
```
CV upload failed:
"Couldn't upload your CV. Please try again or use manual entry."

Analysis failed:
"Unable to analyze this job. Try refreshing the page."

Storage full:
"Storage is full. Please delete old jobs to continue."
```

### Success Messages
```
CV uploaded:
"CV uploaded successfully!"

Job analyzed:
"Job analyzed - 85% match!"

Status updated:
"Marked as Applied"
```

---

## 📊 Data Visualization

### Match Score Presentation Styles

**Option A: Circular Progress Ring**
```
[  85%  ]
  ━━━━━━━
Large circle, animated fill, score in center
```

**Option B: Horizontal Bar**
```
━━━━━━━━━━━━━━━━━━━━ 85%
Filled bar with percentage on right
```

**Option C: Gauge/Speedometer**
```
    85%
   ╱━━━╲
  ╱     ╲
Semicircle gauge with needle
```

**👉 Your preference:**
- [ ] Option A: Circular
- [ ] Option B: Horizontal bar
- [ ] Option C: Gauge
- [ ] Other: _______________

---

## 🎭 Animation & Transitions

### Subtle Animations
```
Button hover:     0.2s ease
Card hover:       0.3s ease
Page transitions: 0.15s ease
Progress fill:    0.5s ease-out
Badge pulse:      1s infinite (on new analysis)
```

### Loading States
```
Spinner: Rotating circle (Primary color)
Skeleton: Gray-200 pulse animation for content loading
Progress: Indeterminate bar for long operations
```

---

## ♿ Accessibility

### Color Contrast
```
Ensure WCAG AA compliance:
- Text on background: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum
```

### Focus States
```
Focus ring: 2px solid [Primary Color]
Offset: 2px
Border-radius: matches element
```

### Screen Reader Support
```
All buttons: aria-label
All inputs: associated labels
Icons: aria-hidden="true" with descriptive text nearby
Status changes: aria-live regions
```

---

## 🎬 Onboarding Flow Design

### Welcome Screen (First Install)
```
┌────────────────────────────────────┐
│  👋 Welcome to Job Analyzer!       │
│                                    │
│  Analyze jobs against your CV      │
│  and apply smarter.                │
│                                    │
│  Let's get started in 2 steps:     │
│                                    │
│  1️⃣  Upload your CV                │
│  2️⃣  Start analyzing jobs          │
│                                    │
│  [Get Started →]                   │
└────────────────────────────────────┘
```

---

## 📋 Design Checklist

Before finalizing, confirm:
- [ ] Color palette chosen
- [ ] Typography scale defined
- [ ] Button styles specified
- [ ] Card design finalized
- [ ] Badge styles determined
- [ ] Match score visualization picked
- [ ] Icon concept decided
- [ ] Tagline selected
- [ ] Dark mode decision made
- [ ] Animation speeds chosen

---

## 🎨 Design Tokens (For Tailwind Config)

Once you decide on colors, I'll create this:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#...',
          // ... your chosen primary color scale
          900: '#...',
        },
        // ... other custom colors
      },
      // ... other customizations
    },
  },
}
```

---

## **NEXT STEPS:**

**Please tell me:**

1. **Which color palette?** (Option 1, 2, 3, or custom)
2. **Which icon elements?** (What should represent the brand?)
3. **Which tagline?** (Or suggest your own)
4. **Match score style?** (Circular, bar, or gauge)
5. **Dark mode?** (Yes/No/Later)
6. **Any other preferences or ideas?**

Once you decide, I'll:
- Finalize this document with your choices
- Create the Tailwind config file
- Design the icon mockups
- Update the KICKSTART_PROMPT with design specifications

**Take your time - good design is worth planning properly!** 🎨
