# Test Guide

This document provides comprehensive guidance on testing for the AI-Powered Personal Finance Tracker.

## Overview

The test suite includes:

- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test API endpoints and database interactions
- **E2E Tests**: Test complete user flows from start to finish

## Tech Stack

- **Vitest**: Unit and integration testing framework
- **Testing Library**: React component testing utilities
- **Playwright**: End-to-end testing framework

## Running Tests

### Unit and Integration Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (during development)
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### End-to-End Tests

```bash
# Run e2e tests
npm run test:e2e

# Run e2e tests with UI
npm run test:e2e:ui

# Run specific test file
npm run test:e2e -- upload-flow.spec.ts
```

## Test Structure

### Unit Tests

Located alongside the code they test with `.test.ts` suffix:

- `lib/parsers/csv-parser.test.ts` - CSV parsing logic
- `lib/ai/categorizer.test.ts` - AI categorization and rule-based fallback

### Integration Tests

Located alongside API routes:

- `app/api/transactions/route.test.ts` - Transaction API endpoints

### E2E Tests

Located in `test/e2e/`:

- `upload-flow.spec.ts` - Document upload → categorization → insights
- `transactions.spec.ts` - Transaction filtering, editing, bulk operations
- `goals.spec.ts` - Goal creation, tracking, progress monitoring

## Test Coverage Goals

As per the PRD requirements:

- **Unit Tests**: All parsers, rule engines, and utility functions
- **Integration Tests**: All API endpoints with Zod validation
- **E2E Tests**: Critical flows with performance budgets
  - Upload → categorization: < 30 seconds
  - Auto-categorization accuracy: > 90%

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest'
import { parseCSV } from './csv-parser'

describe('CSV Parser', () => {
  it('should parse valid CSV', () => {
    const csv = `Date,Merchant,Amount
2024-01-15,Whole Foods,-87.50`

    const result = parseCSV(csv)

    expect(result.success).toBe(true)
    expect(result.transactions).toHaveLength(1)
  })
})
```

### Integration Test Example

```typescript
import { describe, it, expect, vi } from 'vitest'
import { GET } from './route'

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockResolvedValue({ userId: 'test-user' }),
}))

describe('GET /api/transactions', () => {
  it('should return transactions', async () => {
    const request = createMockRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.transactions).toBeDefined()
  })
})
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test'

test('should upload CSV file', async ({ page }) => {
  await page.goto('/upload')

  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles({
    name: 'test.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('Date,Merchant,Amount\n2024-01-15,Test,-10'),
  })

  await expect(page.locator('[data-testid="upload-complete"]')).toBeVisible({
    timeout: 30000,
  })
})
```

## Test Data Attributes

Use `data-testid` attributes in components for reliable E2E testing:

```tsx
<button data-testid="create-goal">Create Goal</button>
<div data-testid="transaction-row">...</div>
<span data-testid="confidence-score">{confidence}%</span>
```

## Mocking

### Mocking External APIs

```typescript
import { vi } from 'vitest'

global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ category: 'Groceries' }),
})
```

### Mocking Prisma

```typescript
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn().mockResolvedValue({ id: '1' }),
    },
  },
}))
```

### Mocking Clerk Auth

```typescript
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockResolvedValue({ userId: 'test-user-123' }),
}))
```

## Test Helpers

Common test utilities are in `test/helpers/`:

- `api.ts` - Mock request/response objects, Prisma, Clerk auth

## Performance Testing

E2E tests include performance assertions based on PRD requirements:

```typescript
// Should complete within 30 seconds (PRD requirement)
await expect(page.locator('[data-testid="upload-complete"]')).toBeVisible({
  timeout: 30000,
})
```

## Continuous Integration

Tests run automatically on:

- Pull requests
- Pushes to main branch
- Pre-commit hooks (unit tests only)

### CI Configuration

The GitHub Actions workflow runs:

1. Unit and integration tests with coverage
2. E2E tests on Chromium, Firefox, and WebKit
3. Coverage reports uploaded to artifacts

## Debugging Tests

### Vitest

```bash
# Run tests with debugger
node --inspect-brk ./node_modules/.bin/vitest

# Run specific test file
npm test -- csv-parser.test.ts

# Run tests matching pattern
npm test -- --grep "should parse"
```

### Playwright

```bash
# Run with browser visible
npm run test:e2e -- --headed

# Run in debug mode
npm run test:e2e -- --debug

# Generate test report
npm run test:e2e -- --reporter=html
```

## Test Coverage

View coverage reports:

```bash
# Generate coverage
npm run test:coverage

# Open HTML report
open coverage/index.html
```

### Coverage Targets

- **Parsers**: 100% line coverage
- **API Routes**: > 90% line coverage
- **Categorization Logic**: > 95% line coverage

## Best Practices

### DO

✅ Test behavior, not implementation
✅ Use descriptive test names
✅ Test edge cases and error conditions
✅ Mock external dependencies (APIs, databases)
✅ Keep tests fast and independent
✅ Use data-testid for E2E test selectors

### DON'T

❌ Test internal implementation details
❌ Create dependencies between tests
❌ Use CSS selectors for E2E tests (fragile)
❌ Mock what you're testing
❌ Write flaky tests
❌ Skip error cases

## Common Test Scenarios

### Testing CSV Parsing

- Valid formats
- Different date formats (MM/DD/YYYY, YYYY-MM-DD)
- Different amount formats ($100, (100), -100)
- Missing required fields
- Invalid data types
- Special characters
- Large datasets

### Testing AI Categorization

- Rule-based fallback
- API responses (Claude, OpenAI)
- Confidence scores
- Edge cases (empty strings, special chars)
- Error handling (API failures)

### Testing API Routes

- Authentication (authenticated, unauthenticated)
- Input validation
- Database operations (CRUD)
- Error handling
- Deduplication logic

### Testing E2E Flows

- Upload → Categorization → Insights
- Transaction filtering and editing
- Goal creation and tracking
- Empty states
- Error states

## Troubleshooting

### Tests Timing Out

- Increase timeout in test config
- Check for infinite loops
- Verify async operations complete

### Flaky E2E Tests

- Add explicit waits for dynamic content
- Use `waitForLoadState('networkidle')`
- Avoid relying on timing

### Mock Not Working

- Ensure mock is set up before import
- Use `vi.clearAllMocks()` in beforeEach
- Check mock function signatures match

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [PRD Test Requirements](./PRD.md#testing)

## Seed Data for Testing

To run E2E tests with realistic data:

```bash
# Seed database with demo data
npm run db:seed
```

This creates:
- 1 demo user
- 200 sample transactions
- 10 insights
- 2 goals
- 3 alerts

## Maintaining Tests

- Update tests when behavior changes
- Remove obsolete tests
- Keep test data realistic
- Review coverage reports regularly
- Fix flaky tests immediately

---

For questions or issues with tests, please check the [GitHub Issues](https://github.com/pcatattacks/ai-finance-tracker/issues).
