# E2E Testing with Playwright

## Overview

End-to-end (E2E) tests verify the extension works correctly in a real Firefox browser. These tests complement unit tests by testing the full user workflow.

## Setup

Playwright and Firefox are already installed. To run E2E tests:

```bash
# Run basic E2E tests (package integrity, manifest validation)
npm run test:e2e

# Run E2E tests in UI mode (visual debugging)
npm run test:e2e:ui

# Run E2E tests with debug output
npm run test:e2e:debug
```

## Current Test Coverage

### ✅ Package Integrity Tests
- Verifies dist/ directory exists with all required files
- Validates manifest.json version and permissions
- Checks XPI and source packages exist and have reasonable size

### 🚧 Extension Functionality Tests (Manual Setup Required)
- Popup loading and rendering
- Job page detection (LinkedIn, Indeed, Reed)
- CV upload and parsing
- Job analysis and scoring
- History and export features
- Dark mode toggle

## Manual Extension Testing

For full E2E testing, you need to load the extension in Firefox:

### Method 1: web-ext (Recommended)
```bash
npm run dev:firefox
```
This automatically loads the extension and opens Firefox with it installed.

### Method 2: about:debugging (Manual)
1. Build the extension: `npm run build`
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Navigate to `dist/manifest.json` and select it
5. Extension is now loaded for testing

## Writing E2E Tests

### Example: Test Job Analysis
```typescript
test('should analyze LinkedIn job posting', async ({ page, context }) => {
  // Load extension (requires web-ext or manual setup)
  await loadExtension(context);

  // Navigate to a test job posting
  await page.goto('https://www.linkedin.com/jobs/view/test-job');

  // Wait for content script to detect page
  await page.waitForTimeout(2000);

  // Open extension popup
  const popup = await context.newPage();
  await popup.goto('moz-extension://[id]/popup/index.html');

  // Verify analysis appeared
  const matchScore = await popup.locator('.match-score').textContent();
  expect(matchScore).toMatch(/\d+%/);

  // Verify recommendation
  const recommendation = await popup.locator('.recommendation').textContent();
  expect(['apply', 'maybe', 'pass']).toContain(recommendation);
});
```

## Test Data

E2E tests can use the Faker data generator for realistic scenarios:

```typescript
import { generateCV, generateJobPosting } from '@/shared/utils/__tests__/testDataGenerator';

test('should upload and parse generated CV', async ({ page }) => {
  const testCV = generateCV({ skillCount: 15, experienceYears: 5 });

  // Upload CV to extension
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('./fixtures/generated-cv.docx');

  // Verify parsing
  const skillsCount = await page.locator('.skills-count').textContent();
  expect(skillsCount).toBe('15');
});
```

## Debugging E2E Tests

### Run with UI Mode
```bash
npm run test:e2e:ui
```
Opens Playwright's visual test runner where you can:
- See each test step
- Pause and resume tests
- Inspect DOM at any point
- View screenshots and videos

### Debug Mode
```bash
npm run test:e2e:debug
```
Runs tests with Playwright Inspector for step-by-step debugging.

### Screenshots and Videos
Failed tests automatically capture:
- Screenshot at point of failure
- Video recording of entire test
- HTML trace for debugging

Find these in `test-results/` directory.

## CI/CD Integration

E2E tests can run automatically on GitHub Actions:

```yaml
- name: Run E2E Tests
  run: npm run test:e2e
```

For full extension testing in CI, consider:
- Using web-ext programmatically
- Creating test fixtures (sample job pages)
- Mocking external services (LinkedIn, Indeed)

## Known Limitations

### Firefox Extension Testing
Firefox extension testing with Playwright is more complex than Chrome due to:
- No native `chrome.runtime` API in test context
- Must use web-ext or manual loading
- Extension ID changes on each load

### Workarounds
1. **Unit tests** - Test business logic without browser (already done!)
2. **Manual E2E** - Use `npm run dev:firefox` for human testing
3. **Package tests** - Verify build integrity (automated)
4. **Integration tests** - Test components in isolation

## Future Improvements

- [ ] Automate web-ext in Playwright tests
- [ ] Create test fixtures for LinkedIn/Indeed/Reed
- [ ] Mock external APIs
- [ ] Visual regression testing (screenshots)
- [ ] Performance testing (load times, memory usage)
- [ ] Accessibility testing (screen readers, keyboard navigation)

## Recommended Testing Strategy

1. **Unit Tests** (Vitest) - 80% of testing
   - CV parser logic
   - Scoring algorithm
   - Data transformations
   - Edge cases

2. **Generated Data Tests** (Faker + Vitest) - 15% of testing
   - Stress testing with realistic data
   - Statistical analysis
   - Bug reproduction scenarios

3. **E2E Tests** (Playwright) - 5% of testing
   - Critical user flows
   - Integration points
   - Visual regressions

This pyramid ensures fast, reliable tests while catching bugs at all levels.
