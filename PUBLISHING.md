# Publishing to Firefox Add-ons Store

This guide will walk you through publishing your Job Application Analyzer extension to the official Firefox Add-ons store (addons.mozilla.org).

## Prerequisites

✅ You already have:
- Extension built and packaged (`packages/job-application-analyzer-v1.0.0.zip`)
- All required files included
- Manifest V3 configuration
- Icons in SVG format

## Step 1: Create Mozilla Developer Account

1. **Go to Firefox Add-ons Developer Hub:**
   - Visit: https://addons.mozilla.org/developers/

2. **Sign in or Create Account:**
   - Click "Register" or "Log in"
   - Use your Firefox Account (or create one)
   - Accept the Firefox Add-on Distribution Agreement

3. **Set up your developer profile:**
   - Add your display name
   - Optionally add a profile picture
   - Complete email verification if needed

## Step 2: Submit Your Extension

1. **Navigate to submission page:**
   - Go to: https://addons.mozilla.org/developers/addon/submit/distribution
   - Or click "Submit a New Add-on" from your developer dashboard

2. **Choose distribution channel:**
   - Select **"On this site"** (for Firefox Add-ons store)
   - This makes it publicly available to all Firefox users

3. **Upload your extension:**
   - Click "Select a file"
   - Upload: `packages/job-application-analyzer-v1.0.0.zip`
   - Wait for automatic validation to complete

4. **Review validation results:**
   - Mozilla automatically scans for common issues
   - Fix any errors or warnings if they appear
   - Common issues are usually about permissions or manifest format

## Step 3: Fill in Extension Details

### Basic Information

**Name:**
```
Job Application Analyzer
```

**Summary** (250 characters max):
```
Analyzes job postings from LinkedIn, Indeed, and Reed against your CV. Get instant match scores, skill gap analysis, and smart recommendations (Apply/Maybe/Pass) to optimize your job search.
```

**Description** (Full description, HTML allowed):
```html
<h3>Supercharge Your Job Search with AI-Powered Analysis</h3>

<p>Job Application Analyzer helps you make smarter decisions about which jobs to apply for by comparing job postings against your CV and skills.</p>

<h4>Features:</h4>
<ul>
  <li><strong>Instant Match Scores:</strong> Get 0-100% compatibility scores for any job posting</li>
  <li><strong>Skill Analysis:</strong> See exactly which skills match and what's missing</li>
  <li><strong>Smart Recommendations:</strong> Apply, Maybe, or Pass - based on your profile</li>
  <li><strong>Application Tracking:</strong> Keep history of analyzed jobs and decisions</li>
  <li><strong>CV Upload:</strong> Upload your CV once (DOCX format), analyze unlimited jobs</li>
  <li><strong>Multi-Site Support:</strong> Works on LinkedIn, Indeed, and Reed</li>
</ul>

<h4>How It Works:</h4>
<ol>
  <li>Upload your CV (one-time setup)</li>
  <li>Browse jobs on LinkedIn, Indeed, or Reed</li>
  <li>Click the extension icon to analyze the current job</li>
  <li>Get instant match score and recommendations</li>
  <li>Track your applications in the History tab</li>
</ol>

<h4>Privacy-Focused:</h4>
<ul>
  <li>All analysis happens locally in your browser</li>
  <li>Your CV never leaves your device</li>
  <li>No external servers or tracking</li>
  <li>Your data is 100% private</li>
</ul>

<h4>Supported Job Sites:</h4>
<ul>
  <li>LinkedIn Jobs</li>
  <li>Indeed</li>
  <li>Reed.co.uk</li>
</ul>

<p>Stop guessing which jobs to apply for. Make data-driven decisions and focus on opportunities that truly match your skills!</p>
```

### Categories

Select appropriate categories:
- **Primary:** Productivity
- **Secondary:** Employment

### Tags (keywords)

Add relevant tags:
```
job-search, cv, resume, career, linkedin, indeed, recruitment, jobs, analysis, match-score
```

### Support Information

**Support Email:**
```
[Your email address - required for user support]
```

**Support Website (optional):**
```
https://github.com/[yourusername]/job-application-analyzer
```

### Privacy Policy (REQUIRED)

Mozilla requires a privacy policy. Create one that explains:

**Privacy Policy URL:**
You need to host a privacy policy. Here's a template:

```markdown
# Privacy Policy for Job Application Analyzer

Last updated: January 2026

## Data Collection and Usage

Job Application Analyzer is designed with privacy as a top priority.

### What We Collect:
- **Nothing.** We do not collect, store, or transmit any personal data to external servers.

### What Stays Local:
- Your uploaded CV (stored locally in browser storage)
- Job analysis results (stored locally in browser storage)
- Application history (stored locally in browser storage)
- Extension settings (stored locally in browser storage)

### How Your Data is Used:
- All CV analysis happens locally in your browser
- No data is sent to external servers
- No tracking, analytics, or telemetry
- Your job search activity is completely private

### Permissions Explained:
- **storage**: To save your CV and job history locally
- **activeTab**: To read job postings on supported sites (LinkedIn, Indeed, Reed)
- **scripting**: To inject content scripts for job detection
- **notifications**: To show match notifications (optional)

### Third-Party Services:
- **None.** This extension does not use any third-party services or APIs.

### Data Deletion:
- All data is stored locally in your browser
- You can delete all data anytime via the extension settings
- Uninstalling the extension removes all stored data

### Contact:
For privacy questions, contact: [your email]
```

**Where to host your privacy policy:**
- GitHub (create `PRIVACY.md` in your repo)
- Your personal website
- GitHub Pages (free static hosting)

### Screenshots (REQUIRED)

You need at least 1 screenshot, maximum 10. Recommended: 3-5 screenshots.

**Screenshot requirements:**
- Format: PNG or JPG
- Max size: 4MB per image
- Recommended size: 1280x800 or 1920x1080
- Show actual extension UI and features

**Suggested screenshots:**
1. Main popup showing match score and analysis
2. CV upload screen
3. History view with tracked applications
4. Settings panel with theme options
5. Extension working on a LinkedIn job page

**How to take screenshots:**
1. Load extension in Firefox
2. Navigate to a job page
3. Click extension icon
4. Press `Ctrl+Shift+S` (Firefox screenshot tool)
5. Capture the popup and surrounding context

### Version Information

**Version Notes** (what's new in this version):
```
Initial release (v1.0.0):
- CV upload and parsing (DOCX format)
- Job analysis with match scoring
- Support for LinkedIn, Indeed, and Reed
- Application tracking and history
- Dual purple themes with dark mode
- Local-only processing for privacy
```

## Step 4: Submit for Review

1. **Review all information:**
   - Double-check description, screenshots, and privacy policy
   - Ensure all fields are filled correctly

2. **Click "Submit Version"**
   - Your extension enters the review queue
   - You'll receive a confirmation email

3. **Wait for review:**
   - **Automated review:** Usually within minutes (for simple extensions)
   - **Manual review:** Can take 1-14 days for first submission
   - You'll get email updates on review status

## Step 5: Review Process

### What Mozilla Reviews:

1. **Security:**
   - No malicious code
   - Safe permissions usage
   - No data collection without disclosure

2. **Functionality:**
   - Extension works as described
   - No broken features
   - Proper error handling

3. **Policy Compliance:**
   - Follows Firefox Add-on policies
   - Privacy policy is accurate
   - No misleading descriptions

### Common Rejection Reasons:

1. **Missing privacy policy** - Always required
2. **Excessive permissions** - Only request what you need
3. **Minified code without source** - Our code is clear, so we're good
4. **Misleading descriptions** - Be accurate about features
5. **Missing screenshots** - At least 1 required

### If Rejected:

- Don't worry - it's common for first submissions
- Read the reviewer's feedback carefully
- Fix the issues they mention
- Submit updated version
- Usually approved faster the second time

## Step 6: After Approval

### Your Extension Goes Live:

1. **Listed on addons.mozilla.org:**
   - Gets a unique URL: `https://addons.mozilla.org/firefox/addon/job-application-analyzer/`
   - Users can search and find it
   - Shows up in Firefox Add-ons search

2. **Users can install it:**
   - One-click install from the store
   - Automatic updates when you release new versions
   - Ratings and reviews enabled

3. **You get a developer dashboard:**
   - View installation statistics
   - See user reviews
   - Monitor performance
   - Upload updates

### Installing on Your Main Browser:

Once approved, you can:
1. Go to your extension's page on addons.mozilla.org
2. Click "Add to Firefox"
3. Use it like any other extension
4. Get automatic updates

**OR** install it right now (before approval):
1. Open Firefox
2. Go to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select `packages/job-application-analyzer-v1.0.0.zip`
5. Extension loads in your main browser (temporary, until you restart Firefox)

For permanent install before approval:
1. Firefox Developer Edition allows permanent unsigned extension installs
2. Or wait for Mozilla approval (usually within a few days)

## Quick Reference

### Package Your Extension:
```bash
npm run package
```

### Files Created:
- `packages/job-application-analyzer-v1.0.0.zip` - Ready to upload

### Submission URL:
https://addons.mozilla.org/developers/addon/submit/

### Required Information Checklist:
- [ ] Extension name
- [ ] Summary (250 chars)
- [ ] Full description (HTML)
- [ ] Categories selected
- [ ] Tags added
- [ ] Support email
- [ ] Privacy policy URL
- [ ] At least 1 screenshot
- [ ] Version notes
- [ ] ZIP file uploaded

## Privacy Policy Setup

Since you need a privacy policy URL, here are quick options:

### Option 1: GitHub (Fastest)

1. Create `PRIVACY.md` in your repo root
2. Copy the privacy policy template above
3. Commit and push
4. Use URL: `https://github.com/[yourusername]/job-application-analyzer/blob/main/PRIVACY.md`

### Option 2: GitHub Pages (Prettier)

1. Enable GitHub Pages in repo settings
2. Create `privacy.html` in repo
3. Use URL: `https://[yourusername].github.io/job-application-analyzer/privacy.html`

### Option 3: Host Anywhere

Any public URL works - personal website, hosting service, etc.

## Timeline

**Realistic timeline from now to published:**

- **Now:** Extension packaged and ready ✅
- **+10 minutes:** Developer account created
- **+30 minutes:** All information filled in, extension submitted
- **+1-2 hours:** Automated review complete (if passes)
- **+1-14 days:** Manual review complete (first submission)
- **Live:** Extension available to all Firefox users!

## Need Help?

- **Mozilla Developer Hub:** https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons
- **Extension Workshop:** https://extensionworkshop.com/
- **Support Forum:** https://discourse.mozilla.org/c/add-ons/35

---

Good luck with your submission! 🚀

Your extension is well-built, follows best practices, and should pass review without issues.
