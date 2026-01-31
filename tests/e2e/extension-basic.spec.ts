/**
 * Basic Extension E2E Tests
 *
 * These tests verify the extension loads and functions correctly in Firefox.
 * Run with: npm run test:e2e
 *
 * Note: Firefox extension testing requires special setup.
 * For manual testing, use: npm run dev:firefox
 */

import { test, expect, type BrowserContext } from '@playwright/test';
import path from 'path';

/**
 * Helper to load extension in Firefox
 * Note: This is a simplified approach. For full extension testing,
 * consider using web-ext or manual loading for now.
 */
async function loadExtension(context: BrowserContext) {
  // For Firefox, extensions must be loaded via web-ext or about:debugging
  // This is a placeholder for future implementation
  // Real implementation would use web-ext programmatically
}

test.describe('Extension Installation', () => {
  test('should have extension files built', async () => {
    const fs = await import('fs');
    const distPath = path.join(process.cwd(), 'dist');

    // Verify dist directory exists
    expect(fs.existsSync(distPath)).toBe(true);

    // Verify manifest.json exists
    const manifestPath = path.join(distPath, 'manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);

    // Verify background script exists
    const backgroundPath = path.join(distPath, 'background.js');
    expect(fs.existsSync(backgroundPath)).toBe(true);

    // Verify content script exists
    const contentPath = path.join(distPath, 'content.js');
    expect(fs.existsSync(contentPath)).toBe(true);

    // Verify popup exists
    const popupPath = path.join(distPath, 'popup.js');
    expect(fs.existsSync(popupPath)).toBe(true);
  });

  test('manifest.json should have correct version', async () => {
    const fs = await import('fs');
    const manifestPath = path.join(process.cwd(), 'dist', 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

    expect(manifest.version).toBe('1.3.1');
    expect(manifest.name).toBe('Job Application Analyzer');
    expect(manifest.manifest_version).toBe(3);
  });

  test('manifest.json should have required permissions', async () => {
    const fs = await import('fs');
    const manifestPath = path.join(process.cwd(), 'dist', 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

    expect(manifest.permissions).toContain('storage');
    expect(manifest.permissions).toContain('activeTab');
    expect(manifest.permissions).toContain('scripting');
  });
});

test.describe('Package Integrity', () => {
  test('should have valid XPI package', async () => {
    const fs = await import('fs');
    const xpiPath = path.join(process.cwd(), 'packages', 'job-application-analyzer-v1.3.1.xpi');

    if (fs.existsSync(xpiPath)) {
      const stats = fs.statSync(xpiPath);
      // XPI should be at least 100KB
      expect(stats.size).toBeGreaterThan(100 * 1024);
    } else {
      // XPI might not exist in dev environment
      test.skip();
    }
  });

  test('should have source package', async () => {
    const fs = await import('fs');
    const sourcePath = path.join(process.cwd(), 'packages', 'job-application-analyzer-v1.3.1-source.zip');

    if (fs.existsSync(sourcePath)) {
      const stats = fs.statSync(sourcePath);
      // Source should be at least 50KB
      expect(stats.size).toBeGreaterThan(50 * 1024);
    } else {
      test.skip();
    }
  });
});

// Note: The tests below require the extension to be loaded in Firefox
// For now, they are marked as skipped. To enable them:
// 1. Build the extension: npm run build
// 2. Load it manually in Firefox via about:debugging
// 3. Or use web-ext: npx web-ext run --source-dir=dist

test.describe.skip('Extension Functionality (requires manual setup)', () => {
  test('popup should load correctly', async ({ page }) => {
    // This would require loading the extension first
    // await page.goto('moz-extension://[id]/popup/index.html');
    // await expect(page.locator('.cv-tab')).toBeVisible();
  });

  test('should detect job pages', async ({ page }) => {
    // Navigate to a job posting
    // await page.goto('https://www.linkedin.com/jobs/view/...');

    // Extension should inject content script
    // const badgeText = await page.evaluate(() => {
    //   return chrome.action.getBadgeText({});
    // });

    // expect(badgeText).toBeDefined();
  });

  test('should analyze job when popup opened', async ({ page }) => {
    // Open popup on a job page
    // const popup = await context.newPage();
    // await popup.goto('moz-extension://[id]/popup/index.html');

    // Should show analysis
    // await expect(popup.locator('.match-score')).toBeVisible();
  });
});
