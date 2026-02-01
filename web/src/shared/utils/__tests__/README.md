# Test Suite

## Running Tests

```bash
# Run tests in watch mode (re-runs on file changes)
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Files

### cvParser.test.ts
Tests for CV parsing functionality:
- **Pipe-separated format**: Month-year and year-only date ranges
- **Experience calculation**: Accurate month-based calculation
- **Self-employment filtering**: Excludes freelance/independent work
- **Section detection**: Experience, education, skills sections
- **Skills extraction**: From experience and skills sections
- **Real-world bug reproduction**: Tests the actual CV that caused the bug

### analysis.test.ts
Tests for job analysis and scoring:
- **Weighted scoring**: Required skills (3x), preferred skills (1x)
- **Experience bonus**: +5 points per year (max +20)
- **Match score calculation**: 0-100% range
- **Recommendation logic**: apply, maybe, pass
- **Matched vs missing skills**: Correct identification
- **Strengths and gaps**: Analysis insights
- **Edge cases**: Empty descriptions, no skills, etc.

## Coverage

Focus areas (most bug-prone):
1. ✅ CV Parser - extractExperience(), calculateExperienceYears()
2. ✅ Analysis - analyzeJob(), weighted scoring algorithm
3. 🔜 Export functions (coming soon)
4. 🔜 Storage utilities (coming soon)

## Test Philosophy

- **Write tests for bugs**: Every bug should have a regression test
- **Test high-value code**: Focus on business logic, not UI components
- **Keep tests simple**: Readable tests are maintainable tests
- **Fast feedback**: Tests run in <1 second

## Example: Bug That Tests Caught

**Bug**: CV parser only extracting 1 job instead of 3, showing 0 years experience

**Root Cause**: Parser didn't support month-year date ranges (Sep 2021 – Mar 2022)

**Test That Would Have Caught It**:
```typescript
it('should extract jobs with month-year date ranges', () => {
  const text = `IT Technician | VantageUAV | Sep 2021 – Mar 2022`;
  const jobs = extractExperience(text);
  expect(jobs).toHaveLength(1);
  expect(jobs[0].duration).toBe('Sep 2021 – Mar 2022');
});
```

This test now runs on every commit to prevent regression.
