# Screenshots Guide for Firefox Add-ons Submission

Mozilla requires at least **1 screenshot** for your extension listing (maximum 10).

## Quick Screenshot Capture

### Method 1: Firefox Built-in Screenshot Tool

1. **Load your extension:**
   ```bash
   npm run dev
   ```

2. **Open a job page:**
   - Go to LinkedIn, Indeed, or Reed
   - Find a job posting

3. **Open the extension popup:**
   - Click the extension icon in toolbar
   - Wait for it to load fully

4. **Capture screenshot:**
   - Press `Ctrl+Shift+S` (or `Cmd+Shift+S` on Mac)
   - Select "Save full page" or draw selection
   - Click "Download" to save

### Method 2: Manual Screenshot

1. **Load extension and open popup**
2. **Press Print Screen (PrtSc)**
3. **Paste into image editor (GIMP, Photoshop, Paint)**
4. **Crop to show extension UI clearly**
5. **Save as PNG or JPG**

## Recommended Screenshots (5 total)

### Screenshot 1: Main Analysis View (REQUIRED)
**Shows:** Extension popup with match score and analysis

**How to capture:**
1. Load extension in Firefox
2. Navigate to any LinkedIn job
3. Click extension icon
4. Wait for analysis to complete
5. Capture popup showing:
   - Match score (e.g., 85%)
   - Recommendation badge (Apply/Maybe/Pass)
   - Matched skills list
   - Missing skills list

**Tip:** Use a job that gives a high match score (70%+) - looks better in screenshots

---

### Screenshot 2: CV Upload Screen
**Shows:** Empty state with CV upload interface

**How to capture:**
1. Clear extension data (or use fresh profile)
2. Open extension popup
3. Should show CV tab with upload prompt
4. Capture the "Upload your CV" screen

---

### Screenshot 3: History View
**Shows:** Application tracking with multiple jobs

**How to capture:**
1. Analyze 3-5 different jobs first
2. Click "History" tab
3. Capture list showing:
   - Multiple analyzed jobs
   - Match scores for each
   - Application statuses
   - Job titles and companies

---

### Screenshot 4: Settings Panel
**Shows:** Theme options and settings

**How to capture:**
1. Click "Settings" tab
2. Capture showing:
   - Theme selection (Black Sabbath Purple / Professional)
   - Dark mode toggle
   - Other settings options

---

### Screenshot 5: Extension in Context (Optional but Recommended)
**Shows:** Extension working on actual job page

**How to capture:**
1. Open LinkedIn/Indeed/Reed job page
2. Open extension popup
3. Use Firefox screenshot tool to capture:
   - Part of the job page
   - Extension popup overlaying it
   - Shows context of how it's used

## Screenshot Requirements

### Technical Requirements:
- **Format:** PNG or JPG (PNG recommended for better quality)
- **Max size:** 4MB per image
- **Recommended dimensions:** 1280x800 or 1920x1080
- **Aspect ratio:** 16:9 or 4:3 (widescreen preferred)

### Content Requirements:
- Show actual extension UI (not mockups)
- Clear, readable text
- Good lighting/contrast
- No personal information visible
- Professional appearance

## Editing Screenshots

### Recommended Tools:

**Linux:**
- GIMP (free, powerful)
- Krita (free, good for annotations)
- Pinta (free, simple)

**Online:**
- Photopea.com (free, Photoshop-like)
- Pixlr.com (free, simple editor)

### What to Edit:

1. **Crop** - Remove unnecessary browser chrome, focus on extension
2. **Resize** - Ensure 1280x800 or 1920x1080
3. **Annotate** (optional) - Add arrows or highlights for key features
4. **Remove** - Any personal data (names, emails, etc.)

## Quick Screenshot Checklist

Before uploading to Mozilla:
- [ ] At least 1 screenshot (5 recommended)
- [ ] All screenshots are PNG or JPG
- [ ] Each file under 4MB
- [ ] Images are 1280x800 or larger
- [ ] Extension UI is clearly visible
- [ ] Text is readable
- [ ] No personal information visible
- [ ] Screenshots show key features:
  - [ ] Match score display
  - [ ] CV upload
  - [ ] Job history
  - [ ] Settings/themes
  - [ ] Extension in context (on job site)

## Example Screenshot Descriptions

When uploading, Mozilla asks for captions. Here are suggestions:

**Screenshot 1:**
```
Instant job match analysis with detailed skill breakdown
```

**Screenshot 2:**
```
Simple CV upload - supports DOCX format
```

**Screenshot 3:**
```
Track all your analyzed jobs in one place
```

**Screenshot 4:**
```
Dual purple themes with dark mode support
```

**Screenshot 5:**
```
Seamlessly analyzes jobs on LinkedIn, Indeed, and Reed
```

## Tips for Great Screenshots

1. **Use real data** - Makes screenshots more convincing
2. **High match scores** - 70%+ looks better than 20%
3. **Multiple colors** - Show "Apply" (green), "Maybe" (orange), "Pass" (red)
4. **Good job examples** - Use well-known companies if possible
5. **Clean UI** - Make sure nothing is loading/broken
6. **Consistent theme** - Use same theme (sabbath/professional) across all screenshots

## Quick Command to Capture All Screenshots

```bash
# 1. Start extension
npm run dev

# 2. Create screenshots folder
mkdir -p screenshots

# 3. Capture screenshots using Firefox:
#    - Use Ctrl+Shift+S for each screenshot
#    - Save to screenshots/ folder
#    - Name them clearly:
#      - 1-main-analysis.png
#      - 2-cv-upload.png
#      - 3-history.png
#      - 4-settings.png
#      - 5-in-context.png
```

## After Capturing

1. **Review all screenshots**
   - Check for personal data
   - Ensure they're clear and professional
   - Verify file sizes

2. **Upload to Mozilla:**
   - Go to extension submission page
   - Click "Upload Screenshot"
   - Add all 5 screenshots
   - Add captions for each
   - Set the first one as primary

3. **Done!**
   - Screenshots are now part of your extension listing
   - They appear on your add-ons page
   - Users see them before installing

---

Need help? The screenshots don't need to be perfect - they just need to show what your extension does clearly!
