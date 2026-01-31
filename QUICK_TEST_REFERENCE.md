# Quick Test Reference Card

## Most Common Commands

```bash
# Run all tests (fastest)
npm run test:run

# Run tests in watch mode (auto-rerun on file changes)
npm test

# Run specific test file
npm test -- cvParser
npm test -- analysis
npm test -- generated

# Run with visual UI (best for debugging)
npm run test:ui

# Run E2E tests
npm run test:e2e
```

---

## Debugging Workflow (For Tomorrow)

### Step 1: Reproduce Bug in Test
```bash
# Edit: src/shared/utils/__tests__/generated.test.ts
# Add new test case using generateBugScenario()

npm run test:run  # Should FAIL - confirms bug
```

### Step 2: Fix Bug
```bash
# Edit the source file (e.g., cvParser.ts or analysis.ts)
npm test  # Watch mode - auto-reruns on save
```

### Step 3: Verify Fix
```bash
npm run test:run  # All tests should PASS
npm run test:e2e  # Verify package integrity
```

### Step 4: Build & Release
```bash
npm run build
npm run package
npm run package:source
# Upload to Mozilla
```

---

## Test File Locations

```
src/shared/utils/__tests__/
├── cvParser.test.ts       ← CV parsing tests
├── analysis.test.ts       ← Scoring algorithm tests
├── generated.test.ts      ← Faker stress tests
└── testDataGenerator.ts   ← Faker data functions

tests/e2e/
└── extension-basic.spec.ts ← E2E tests
```

---

## Generate Test Data

```typescript
import { generateCV, generateJobPosting, generateBugScenario } from './testDataGenerator';

// Generate a CV
const cv = generateCV({ skillCount: 15, experienceYears: 5 });

// Generate a job that matches the CV
const job = generateJobPosting({ matchCV: cv });

// Reproduce a specific bug
const { cv, jobs, expectedBehavior } = generateBugScenario('month-year-parsing');
```

---

## Test Output Guide

### ✅ All Passing (Good!)
```
Test Files  3 passed (3)
Tests       63 passed | 1 skipped (64)
Duration    811ms
```

### ❌ Test Failure (Bug Found!)
```
FAIL src/shared/utils/__tests__/generated.test.ts
  ✕ should calculate correct experience (42ms)

    Expected: 1.6 years
    Received: 0 years
```

### 🔍 Debugging Tips
- Check console output for `=== ANALYSIS DEBUG ===` logs
- Look for "Matched required: X / Y" to see skill matching
- Verify "Experience bonus" is calculated correctly
- Compare "Final match score" with expected range

---

## Quick Fixes for Common Issues

### Tests failing after code changes?
```bash
# Clear cache and rebuild
rm -rf node_modules/.vite dist/
npm run build
npm run test:run
```

### E2E tests failing?
```bash
# Rebuild dist/ folder
npm run build
npm run test:e2e
```

### Need to see test details?
```bash
# Use UI mode for visual debugging
npm run test:ui
```

---

## Test Status at End of Day (Jan 25, 2026)

✅ 68 tests passing
⏭️ 4 tests skipped (expected)
⚠️ 0 tests failing
📊 98.4% pass rate

**Ready for tomorrow's debugging session!**
