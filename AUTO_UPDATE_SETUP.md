# Auto-Update Setup for Self-Distributed Extension

This guide shows you how to set up automatic updates for your self-distributed extension using GitHub (free hosting).

## How Auto-Updates Work

1. You host the signed `.xpi` file on GitHub Releases
2. You host an `updates.json` file that tells Firefox where to find new versions
3. Firefox checks for updates automatically
4. When you release a new version, Firefox auto-downloads and installs it

## One-Time Setup

### Step 1: Create GitHub Repository

If you don't have one already:

1. **Go to GitHub:** https://github.com/new

2. **Create repository:**
   - **Name:** `Job-Application-Analyzer`
   - **Visibility:** Public (required for free hosting)
   - **Don't** initialize with README (we already have files)

3. **Push your code:**
   ```bash
   cd /home/charlie/Claude/Job-Application-Analyzer

   # Initialize git if not already done
   git init

   # Add remote (replace YOUR_USERNAME with your GitHub username)
   git remote add origin https://github.com/YOUR_USERNAME/Job-Application-Analyzer.git

   # Add files
   git add .
   git commit -m "Initial commit: Job Application Analyzer extension"

   # Push to GitHub
   git branch -M main
   git push -u origin main
   ```

### Step 2: Update Manifest with Your GitHub Info

1. **Open:** `public/manifest.json`

2. **Update these lines** (lines 8-9):
   ```json
   "id": "job-analyzer@yourdomain.com",
   "update_url": "https://raw.githubusercontent.com/YOUR_USERNAME/Job-Application-Analyzer/main/updates.json"
   ```

   Replace:
   - `YOUR_USERNAME` with your actual GitHub username
   - Optionally change the `id` to use your actual domain (or keep it as-is)

3. **Save the file**

### Step 3: Rebuild with Updated Manifest

```bash
npm run package
```

This creates: `packages/job-application-analyzer-v1.0.0.zip`

### Step 4: Get Extension Signed by Mozilla

1. **Go to:** https://addons.mozilla.org/developers/addon/submit/distribution

2. **Choose "On your own"** (self-distribution)

3. **Upload:** `packages/job-application-analyzer-v1.0.0.zip`

4. **Wait for signing** (~2-5 minutes)

5. **Download the signed `.xpi` file**
   - Mozilla will give you a signed version
   - Rename it to: `job-application-analyzer-v1.0.0-signed.xpi`
   - Save it in your `packages/` folder

### Step 5: Create GitHub Release

1. **Go to your GitHub repo:**
   - https://github.com/YOUR_USERNAME/Job-Application-Analyzer

2. **Click "Releases"** (right sidebar)

3. **Click "Create a new release"**

4. **Fill in release details:**
   - **Tag:** `v1.0.0`
   - **Release title:** `v1.0.0 - Initial Release`
   - **Description:**
     ```markdown
     ## Initial Release

     - CV upload and parsing
     - Job analysis with match scoring
     - Support for LinkedIn, Indeed, and Reed
     - Application tracking
     - Dual purple themes with dark mode
     ```

5. **Attach the signed XPI:**
   - Click "Attach binaries"
   - Upload: `job-application-analyzer-v1.0.0-signed.xpi`

6. **Click "Publish release"**

7. **Copy the download URL:**
   - Right-click the `.xpi` file in the release
   - Copy link address
   - It will look like: `https://github.com/YOUR_USERNAME/Job-Application-Analyzer/releases/download/v1.0.0/job-application-analyzer-v1.0.0-signed.xpi`

### Step 6: Update updates.json

1. **Open:** `updates.json`

2. **Update it with your info:**
   ```json
   {
     "addons": {
       "job-analyzer@yourdomain.com": {
         "updates": [
           {
             "version": "1.0.0",
             "update_link": "https://github.com/YOUR_USERNAME/Job-Application-Analyzer/releases/download/v1.0.0/job-application-analyzer-v1.0.0-signed.xpi"
           }
         ]
       }
     }
   }
   ```

3. **Replace:**
   - `job-analyzer@yourdomain.com` with the ID from your manifest (must match exactly!)
   - `YOUR_USERNAME` with your GitHub username
   - The full `update_link` URL with the one you copied from the release

4. **Save and push to GitHub:**
   ```bash
   git add updates.json public/manifest.json
   git commit -m "Add auto-update configuration"
   git push
   ```

### Step 7: Install Extension

Now install the signed `.xpi` on your Firefox:

1. **Drag and drop** `job-application-analyzer-v1.0.0-signed.xpi` into Firefox
2. Click "Add"
3. **Done!** Extension is installed with auto-update enabled

## Releasing Updates

When you make changes and want to release a new version:

### Step 1: Update Version Number

Edit `public/manifest.json`:
```json
"version": "1.0.1"  // increment from 1.0.0
```

### Step 2: Build and Package

```bash
npm run package
```

### Step 3: Get Signed by Mozilla

1. Go to: https://addons.mozilla.org/developers/
2. Find your extension
3. Click "Upload New Version"
4. Upload the new ZIP
5. Download the signed XPI
6. Rename to: `job-application-analyzer-v1.0.1-signed.xpi`

### Step 4: Create New GitHub Release

1. Go to your repo → Releases → "Create a new release"
2. **Tag:** `v1.0.1`
3. **Title:** `v1.0.1 - [What's new]`
4. **Attach** the signed XPI
5. Publish

### Step 5: Update updates.json

Add the new version to the updates array:

```json
{
  "addons": {
    "job-analyzer@yourdomain.com": {
      "updates": [
        {
          "version": "1.0.0",
          "update_link": "https://github.com/YOUR_USERNAME/Job-Application-Analyzer/releases/download/v1.0.0/job-application-analyzer-v1.0.0-signed.xpi"
        },
        {
          "version": "1.0.1",
          "update_link": "https://github.com/YOUR_USERNAME/Job-Application-Analyzer/releases/download/v1.0.1/job-application-analyzer-v1.0.1-signed.xpi"
        }
      ]
    }
  }
}
```

**Note:** Firefox uses the highest version number, so just add new versions to the array.

### Step 6: Push updates.json

```bash
git add updates.json
git commit -m "Release v1.0.1"
git push
```

### Step 7: Wait for Auto-Update

Firefox will:
- Check for updates automatically (usually within 24 hours)
- Download and install the new version automatically
- Or you can manually check: `about:addons` → Click gear icon → "Check for Updates"

## Quick Reference

**Update Workflow:**
```bash
# 1. Update version in public/manifest.json
# 2. Build
npm run package

# 3. Submit to Mozilla for signing
# 4. Download signed XPI
# 5. Create GitHub release with signed XPI
# 6. Update updates.json with new version
# 7. Push updates.json
git add updates.json
git commit -m "Release vX.X.X"
git push

# Firefox auto-updates within 24 hours
```

## Troubleshooting

**Updates not working:**
- Check that `updates.json` is accessible at the URL in manifest
- Verify the extension ID matches exactly in manifest and updates.json
- Make sure the XPI URL is correct and publicly accessible
- Check Firefox console for update errors

**GitHub raw URL not loading:**
- GitHub may take a minute to serve new files
- Try the URL in your browser to verify it works
- Use: `https://raw.githubusercontent.com/YOUR_USERNAME/Job-Application-Analyzer/main/updates.json`

**Extension ID mismatch:**
- The ID in manifest.json must exactly match the ID in updates.json
- Including the same format (e.g., `job-analyzer@yourdomain.com`)

## Why This is Better Than Manual Updates

✅ Firefox auto-checks for updates
✅ Users get new features automatically
✅ No need to reinstall manually
✅ Works even if you're the only user
✅ Free hosting on GitHub
✅ Professional update workflow

---

## Current Status

After one-time setup:
- ✅ Manifest has `update_url` configured
- ✅ `updates.json` template created
- ⏳ Needs: Your GitHub username added
- ⏳ Needs: Code pushed to GitHub
- ⏳ Needs: First signed XPI uploaded to GitHub Releases

Once you complete the setup, Firefox will auto-update your extension whenever you release a new version!
