# Install Extension on Your Main Browser NOW

You don't have to wait for Mozilla approval! Here are 3 ways to use your extension right now.

## Option 1: Temporary Install (Easiest, Works Until Firefox Restart)

Perfect for testing on your main browser today.

1. **Package the extension:**
   ```bash
   npm run package
   ```

2. **Open Firefox** (your main browser)

3. **Go to debugging page:**
   - Type in address bar: `about:debugging#/runtime/this-firefox`
   - Or Menu → More Tools → Remote Debugging → This Firefox

4. **Load extension:**
   - Click **"Load Temporary Add-on"**
   - Navigate to: `packages/job-application-analyzer-v1.0.0.zip`
   - Click **"Open"**

5. **Done!**
   - Extension is now loaded in your main browser
   - Click the purple icon in toolbar to use it
   - Works perfectly until you close Firefox

**Note:** This install is temporary - when you restart Firefox, you'll need to reload it (takes 10 seconds).

---

## Option 2: Firefox Developer Edition (Permanent Unsigned Install)

Best option if you want to use it daily while waiting for approval.

1. **Download Firefox Developer Edition:**
   - Visit: https://www.mozilla.org/firefox/developer/
   - Install alongside your regular Firefox
   - Your regular Firefox stays unchanged

2. **Configure Developer Edition:**
   - Open Developer Edition
   - Type in address bar: `about:config`
   - Search for: `xpinstall.signatures.required`
   - Set to: `false` (allows unsigned extensions)

3. **Load your extension:**
   - Go to: `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on"
   - Select: `packages/job-application-analyzer-v1.0.0.zip`

4. **Make it permanent:**
   - The extension stays loaded even after restart
   - Use Developer Edition as your job-search browser
   - Keep your regular Firefox for other browsing

**Benefits:**
- Extension stays permanently loaded
- Can use it every day
- Great for testing and development
- No need to reload after restart

---

## Option 3: Firefox Nightly (Most Permissive)

Similar to Developer Edition, but even more cutting-edge.

1. **Download Firefox Nightly:**
   - Visit: https://www.mozilla.org/firefox/channel/desktop/#nightly
   - Install it

2. **Same process as Developer Edition:**
   - Set `xpinstall.signatures.required` to `false`
   - Load your extension
   - Use it permanently

**Use this if:** Developer Edition doesn't work for some reason

---

## Option 4: Wait for Mozilla Approval (Recommended for Non-Technical Users)

If you want the official experience:

1. **Submit to Mozilla** (follow PUBLISHING.md)
2. **Wait 1-14 days** for review
3. **Get approval**
4. **Install from addons.mozilla.org** like any other extension
5. **Automatic updates** when you release new versions

**Benefits:**
- Listed publicly on Firefox Add-ons store
- Other users can find and install it
- Automatic updates
- Official Mozilla approval badge
- No need to reload ever

---

## Recommendation

**For immediate use today:**
→ Use **Option 1** (Temporary Install)
- Takes 2 minutes
- Works on your main browser
- Perfect for testing real job searches

**For daily use while waiting:**
→ Use **Option 2** (Firefox Developer Edition)
- One-time setup
- Permanent install
- Best developer experience

**For long-term:**
→ Use **Option 4** (Submit to Mozilla)
- Professional distribution
- Helps other job seekers
- Automatic updates

**You can do all three!**
1. Use Option 1 today to start analyzing jobs
2. Submit to Mozilla (Option 4) for long-term
3. Switch to store version when approved

---

## Quick Start (Use Extension Right Now)

```bash
# 1. Package extension
npm run package

# 2. Open Firefox

# 3. Go to: about:debugging#/runtime/this-firefox

# 4. Click "Load Temporary Add-on"

# 5. Select: packages/job-application-analyzer-v1.0.0.zip

# 6. Done! Click the purple icon to start analyzing jobs
```

**That's it!** You're now using your extension on your main browser.

---

## Comparison Table

| Option | Time to Setup | Permanent? | On Main Browser? | Official? |
|--------|---------------|------------|------------------|-----------|
| Temporary Install | 2 minutes | No (until restart) | Yes | No |
| Developer Edition | 10 minutes | Yes | Separate browser | No |
| Firefox Nightly | 10 minutes | Yes | Separate browser | No |
| Mozilla Store | 1-14 days | Yes | Any browser | Yes ✓ |

---

## Troubleshooting

**Extension doesn't load:**
- Make sure you selected the ZIP file, not the folder
- Check Firefox console (F12) for errors
- Verify ZIP was created successfully: `ls -lh packages/`

**Can't find extension icon:**
- Look in Firefox toolbar (top right)
- Try right-click toolbar → Customize
- Extension icon is purple with "JA"

**Extension disappears after restart:**
- This is normal for temporary installs
- Reload it from about:debugging (takes 10 seconds)
- Or use Developer Edition for permanent install

**Want to update after making changes:**
1. Make your code changes
2. Run `npm run package`
3. Go to about:debugging
4. Click "Reload" next to your extension
5. Changes applied instantly

---

## Pro Tip: Use Both!

**Best workflow:**

1. **Today:** Install temporarily on main Firefox
   - Start using it for real job searches
   - Test it with actual LinkedIn/Indeed/Reed jobs

2. **Tonight:** Submit to Mozilla
   - Follow PUBLISHING.md guide
   - Fill in all details
   - Upload screenshots

3. **This week:** Keep using temporary install
   - Reload after Firefox restarts
   - Takes 10 seconds each time

4. **Next week:** Mozilla approves
   - Uninstall temporary version
   - Install from addons.mozilla.org
   - Never reload again
   - Get automatic updates

---

**Ready to start?**

```bash
npm run package
```

Then load it in Firefox from `about:debugging` and start analyzing jobs! 🎉
