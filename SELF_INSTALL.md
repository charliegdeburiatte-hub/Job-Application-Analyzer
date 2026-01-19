# Install Extension for Personal Use Only (Not on Store)

This guide shows you how to get your extension **signed by Mozilla** so it works permanently on your main Firefox, **without** publishing it to the public store.

## Why Self-Distribution?

- ✅ Works on your main Firefox browser permanently
- ✅ Survives Firefox restarts
- ✅ Automatically signed by Mozilla (required for regular Firefox)
- ✅ NOT listed on the public store
- ✅ Just for you (or anyone you share the file with)
- ✅ Takes about 10 minutes

## Step-by-Step Guide

### Step 1: Create Mozilla Developer Account

1. Go to: https://addons.mozilla.org/developers/
2. Click "Register" or "Log in"
3. Use your Firefox Account (or create one)
4. Accept the agreement

*This is required even for self-distribution - it's just for signing.*

### Step 2: Submit for Self-Distribution

1. **Go to submission page:**
   - https://addons.mozilla.org/developers/addon/submit/distribution

2. **Choose "On your own":**
   - Select **"On your own"** (NOT "On this site")
   - This means: Mozilla signs it, but doesn't list it

3. **Upload your extension:**
   ```bash
   # First, make sure you have the package
   npm run package
   ```
   - Click "Select a file"
   - Upload: `packages/job-application-analyzer-v1.0.0.zip`
   - Click "Continue"

4. **Fill in basic info:**
   - **Name:** Job Application Analyzer
   - **Version:** 1.0.0 (already in manifest)
   - **Add-on GUID:** (leave blank, Mozilla generates it)
   - Click "Submit Version"

5. **Wait for automatic validation:**
   - Usually takes **1-5 minutes**
   - Mozilla scans for security issues
   - No manual review needed for self-distribution!

6. **Download your signed extension:**
   - Once validation passes, click **"Download Signed Add-on"**
   - You'll get a `.xpi` file
   - Save it somewhere safe (e.g., `~/Downloads/`)

### Step 3: Install on Your Firefox

1. **Open your main Firefox browser**

2. **Install the signed extension:**
   - Drag and drop the `.xpi` file into Firefox
   - Or: File → Open File → select the `.xpi`
   - Click "Add" when prompted

3. **Done!**
   - Extension is now permanently installed
   - Works across Firefox restarts
   - Just for you, not on public store

## Updating Your Extension

When you make changes:

1. **Build new version:**
   ```bash
   # Update version in public/manifest.json (e.g., 1.0.0 → 1.0.1)
   npm run package
   ```

2. **Submit updated version:**
   - Go to: https://addons.mozilla.org/developers/
   - Find your extension
   - Click "Upload New Version"
   - Upload new ZIP
   - Download new signed XPI

3. **Install update:**
   - Just install the new XPI over the old one
   - Firefox updates it automatically

## Sharing with Friends/Family

You can share the signed `.xpi` file:
- Email it to them
- Put it on Dropbox/Google Drive
- They can install it the same way
- It's signed, so it works on any Firefox

## Comparison: Self-Distribution vs Public Store

| Feature | Self-Distribution | Public Store |
|---------|-------------------|--------------|
| Signing time | 1-5 minutes | 1-14 days |
| Manual review | No | Yes |
| Listed publicly | No | Yes |
| Works on main Firefox | Yes | Yes |
| Permanent install | Yes | Yes |
| Privacy policy required | No | Yes |
| Screenshots required | No | Yes |
| Description required | Minimal | Full |
| Updates | Manual (upload XPI) | Automatic |
| Other users can find it | No | Yes |

## Which Should You Choose?

**Self-Distribution (This Guide) if:**
- ✓ You just want to use it yourself
- ✓ You want it NOW (minutes, not days)
- ✓ You don't want public visibility
- ✓ You're okay manually updating

**Public Store (PUBLISHING.md) if:**
- ✓ You want to help other job seekers
- ✓ You want automatic updates
- ✓ You want it discoverable on addons.mozilla.org
- ✓ You're willing to wait for review

**You can always start with self-distribution now, then publish later!**

## Troubleshooting

**"This add-on could not be installed because it has not been verified"**
- You're using regular Firefox without a signed XPI
- Solution: Follow this guide to get Mozilla to sign it

**Validation fails:**
- Check the error message
- Usually minor manifest issues
- Fix and re-upload

**Can't find the download button:**
- Wait for validation to complete (green checkmark)
- Look for "Download signed add-on" or similar

**Want to remove it:**
- Menu → Add-ons and Themes
- Find "Job Application Analyzer"
- Click "Remove"

## Quick Reference

```bash
# 1. Package extension
npm run package

# 2. Go to Mozilla submission
# https://addons.mozilla.org/developers/addon/submit/distribution

# 3. Choose "On your own"

# 4. Upload: packages/job-application-analyzer-v1.0.0.zip

# 5. Wait 1-5 minutes for signing

# 6. Download signed .xpi file

# 7. Drag .xpi into Firefox

# Done! Extension permanently installed
```

---

**This is the perfect solution for personal use!**

You get all the benefits of a signed, permanent extension without the hassle of public store submission.
