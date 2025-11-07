# Test Directory

This directory contains test helpers, utilities, and end-to-end tests for the AI Finance Tracker.

## Structure

```
test/
├── setup.ts              # Global test setup (Vitest)
├── helpers/
│   └── api.ts           # API testing utilities (mocks, helpers)
└── e2e/
    ├── upload-flow.spec.ts      # Upload → Categorization → Insights flow
    ├── transactions.spec.ts     # Transaction management tests
    └── goals.spec.ts            # Goal creation and tracking tests
```

## Setup File

`setup.ts` configures the test environment:
- Imports testing-library matchers
- Sets up cleanup after each test
- Configures environment variables

## Helpers

### api.ts

Provides utilities for testing API routes:

- `mockAuth()` - Mock Clerk authentication
- `createMockRequest()` - Create mock NextRequest objects
- `createMockPrisma()` - Mock Prisma client

Example usage:

```typescript
import { mockAuth, createMockPrisma } from '@/test/helpers/api'

vi.mock('@clerk/nextjs/server', () => ({
  auth: mockAuth('user-123', 'test@example.com'),
}))

const mockPrisma = createMockPrisma()
vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))
```

## E2E Tests

End-to-end tests use Playwright to test complete user flows.

### Running E2E Tests

```bash
# Run all e2e tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- upload-flow.spec.ts

# Run with UI
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Debug tests
npm run test:e2e -- --debug
```

### Test Files

**upload-flow.spec.ts**
- Document upload with CSV files
- File format validation
- Processing status updates
- Automatic categorization
- Insight generation
- Performance: < 30 seconds to first insight (PRD requirement)

**transactions.spec.ts**
- Transaction list display
- Filtering by date, category, merchant
- Sorting by date and amount
- Inline category editing
- Bulk operations
- Transaction details modal
- Empty states

**goals.spec.ts**
- Budget goal creation
- Savings goal creation
- Progress tracking
- Goal editing and deletion
- Goal insights and alerts
- Pause/resume functionality

### Test Data

E2E tests use test data attributes for reliable selectors:

```typescript
// Good: Using data-testid
await page.locator('[data-testid="create-goal"]').click()

// Avoid: Using CSS classes (fragile)
await page.locator('.btn-primary').click()
```

### Common Test Patterns

**Checking visibility:**
```typescript
await expect(page.locator('[data-testid="upload-status"]')).toBeVisible()
```

**Uploading files:**
```typescript
await fileInput.setInputFiles({
  name: 'test.csv',
  mimeType: 'text/csv',
  buffer: Buffer.from(csvContent),
})
```

**Waiting for completion:**
```typescript
await expect(page.locator('[data-testid="upload-complete"]')).toBeVisible({
  timeout: 30000,
})
```

## Adding New Tests

1. **Unit/Integration Tests**: Create alongside the code (`*.test.ts`)
2. **E2E Tests**: Create in `test/e2e/` directory (`*.spec.ts`)
3. **Test Helpers**: Add to `test/helpers/` if reusable

## Best Practices

- Use descriptive test names
- Test user behavior, not implementation
- Use `data-testid` attributes for E2E selectors
- Mock external dependencies
- Keep tests independent
- Clean up after tests

## See Also

- [TEST_GUIDE.md](../TEST_GUIDE.md) - Comprehensive testing guide
- [PRD.md](../PRD.md) - Product requirements and success metrics
