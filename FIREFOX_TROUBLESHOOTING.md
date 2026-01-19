# Firefox Troubleshooting Guide

## "background.service_worker is currently disabled" Error

If you see this error when loading the extension, it's related to how Firefox handles background scripts in Manifest V3.

### ✅ Solution 1: Update Firefox (Recommended)

**The extension requires Firefox 109 or later** for full Manifest V3 support with ES modules.

**Check your Firefox version:**
1. Open Firefox
2. Go to `about:support`
3. Look for "Version" at the top

**Update Firefox:**
1. Menu → Help → About Firefox
2. Firefox will check for updates automatically
3. Restart after update

### ✅ Solution 2: Enable Manifest V3 (if on older version)

If you're on Firefox 10 8 or earlier:

1. Go to `about:config`
2. Accept the warning
3. Search for: `extensions.manifestV3.enabled`
4. Set it to `true`
5. Restart Firefox

### ✅ Solution 3: Try the Development Version

If neither works, try Firefox Developer Edition or Nightly:
- **Firefox Developer Edition**: https://www.mozilla.org/firefox/developer/
- **Firefox Nightly**: https://www.mozilla.org/firefox/channel/desktop/

### 🔍 Current Extension Requirements

- **Firefox Version**: 109+ (recommended: latest)
- **Manifest Version**: 3
- **Background Script**: ES6 Modules
- **Permissions**:
  - `storage` - Store CV and job data
  - `activeTab` - Read current job page
  - `scripting` - Inject content scripts
  - `notifications` - Show match notifications

### 📊 What We've Built

The extension uses:
- **React 18** for UI
- **TypeScript** (strict mode)
- **ES6 Modules** in background scripts
- **Tailwind CSS 4** for styling
- **Zustand** for state management

These require modern Firefox with full Manifest V3 support.

### ⚙️ Alternative: Manifest V2 Version (Not Included)

If you absolutely need Manifest V2 support (Firefox < 109), the extension would need significant refactoring:
- Convert background script to non-module format
- Use Manifest V2 specification
- Different permission structure

**This is not recommended** as Manifest V2 is deprecated.

### ✅ Verification Steps

After updating Firefox:

1. Check version is 109+
2. Load extension from `about:debugging`
3. You should see:
   - Extension loads without errors
   - Purple "JA" icon in toolbar
   - No console errors

### 🐛 Still Having Issues?

**Check Console Errors:**
1. Load extension
2. Click "Inspect" button in `about:debugging`
3. Check Console tab for specific errors
4. Look for:
   - Module loading errors
   - Permission errors
   - API compatibility issues

**Common Issues:**

| Error | Solution |
|-------|----------|
| "Module not found" | Ensure all files in dist/ folder |
| "Permission denied" | Check manifest.json permissions |
| "browser is not defined" | Firefox version too old |
| "Cannot use import statement" | Need "type": "module" in manifest |

### 📝 Manifest Configuration

The extension uses this background configuration:

```json
"background": {
  "scripts": ["background/index.js"],
  "type": "module"
}
```

This requires:
- Firefox 109+ for `type: "module"` support
- ES6 module compatibility
- Manifest V3

### 🎯 Quick Fix

**If you get the error:**

1. **Update Firefox** to version 109 or later
2. **Rebuild extension**: `npm run build`
3. **Reload** in `about:debugging`

That's it! The extension will work once Firefox is updated.

---

## Other Common Issues

### Extension Icon Not Showing

- Icons are SVG format (Firefox native support)
- Check `dist/icons/` folder has .svg files
- Verify manifest.json icon paths are correct

### CV Upload Fails

- Only `.docx` files supported (not PDF)
- File must be < 5MB
- Check browser console for errors

### Job Detection Not Working

- Must be on job detail page (not search results)
- Supported sites: LinkedIn, Indeed, Reed
- Check content script loaded (F12 → Console)

### Match Score Not Updating

- Ensure CV is uploaded first
- Check background script console (`about:debugging` → Inspect)
- Look for analysis errors in console

---

**Need more help?** Check `INSTALLATION.md` for detailed setup instructions.
