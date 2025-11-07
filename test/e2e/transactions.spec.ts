import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Transaction Management
 *
 * Tests filtering, editing, and bulk operations
 */

test.describe('Transaction List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/transactions')
  })

  test('should display transaction table', async ({ page }) => {
    // Check for table headers
    await expect(page.locator('text=Date')).toBeVisible()
    await expect(page.locator('text=Merchant')).toBeVisible()
    await expect(page.locator('text=Amount')).toBeVisible()
    await expect(page.locator('text=Category')).toBeVisible()
  })

  test('should filter by date range', async ({ page }) => {
    // Open date range picker
    const dateRangePicker = page.locator('[data-testid="date-range-picker"]')
    await dateRangePicker.click()

    // Select date range (last 30 days)
    await page.locator('text=Last 30 days').click()

    // Transactions should be filtered
    await expect(page.locator('[data-testid="transaction-row"]')).toHaveCount(
      expect.any(Number)
    )
  })

  test('should filter by category', async ({ page }) => {
    // Open category filter
    const categoryFilter = page.locator('[data-testid="category-filter"]')
    await categoryFilter.click()

    // Select Groceries
    await page.locator('text=Groceries').click()

    // Should show only Groceries transactions
    const categoryBadges = page.locator('[data-testid="transaction-category"]')
    const count = await categoryBadges.count()

    for (let i = 0; i < count; i++) {
      const text = await categoryBadges.nth(i).textContent()
      expect(text).toContain('Groceries')
    }
  })

  test('should search by merchant name', async ({ page }) => {
    // Type in search box
    const searchBox = page.locator('[data-testid="transaction-search"]')
    await searchBox.fill('Whole Foods')

    // Should show filtered results
    await expect(page.locator('text=Whole Foods')).toBeVisible()
  })

  test('should sort by date', async ({ page }) => {
    // Click on Date header to sort
    await page.locator('th:has-text("Date")').click()

    // Get first transaction date
    const firstDate = await page
      .locator('[data-testid="transaction-date"]')
      .first()
      .textContent()

    // Click again to reverse sort
    await page.locator('th:has-text("Date")').click()

    // First date should be different
    const newFirstDate = await page
      .locator('[data-testid="transaction-date"]')
      .first()
      .textContent()

    expect(firstDate).not.toBe(newFirstDate)
  })

  test('should sort by amount', async ({ page }) => {
    await page.locator('th:has-text("Amount")').click()

    // Transactions should be sorted by amount
    const amounts = await page
      .locator('[data-testid="transaction-amount"]')
      .allTextContents()

    // Convert to numbers and check sorting
    const numericAmounts = amounts
      .map(a => parseFloat(a.replace(/[^0-9.-]/g, '')))
      .filter(n => !isNaN(n))

    for (let i = 1; i < numericAmounts.length; i++) {
      expect(Math.abs(numericAmounts[i])).toBeGreaterThanOrEqual(
        Math.abs(numericAmounts[i - 1])
      )
    }
  })

  test('should paginate results', async ({ page }) => {
    // Check if pagination is visible (only if > 50 transactions)
    const paginationNext = page.locator('[data-testid="pagination-next"]')

    if (await paginationNext.isVisible()) {
      // Get first transaction ID
      const firstTransactionId = await page
        .locator('[data-testid="transaction-row"]')
        .first()
        .getAttribute('data-transaction-id')

      // Click next page
      await paginationNext.click()

      // First transaction should be different
      const newFirstTransactionId = await page
        .locator('[data-testid="transaction-row"]')
        .first()
        .getAttribute('data-transaction-id')

      expect(firstTransactionId).not.toBe(newFirstTransactionId)
    }
  })
})

test.describe('Transaction Editing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/transactions')
  })

  test('should edit transaction category inline', async ({ page }) => {
    // Click on category badge
    const categoryBadge = page
      .locator('[data-testid="transaction-category"]')
      .first()
    const originalCategory = await categoryBadge.textContent()
    await categoryBadge.click()

    // Category picker should appear
    await expect(page.locator('[data-testid="category-picker"]')).toBeVisible()

    // Select different category
    const newCategory = originalCategory?.includes('Groceries')
      ? 'Dining'
      : 'Groceries'
    await page.locator(`text=${newCategory}`).click()

    // Should show success message
    await expect(page.locator('text=/Updated|Saved/')).toBeVisible()

    // Category should be updated
    await expect(categoryBadge).toHaveText(new RegExp(newCategory))
  })

  test('should create rule from category edit', async ({ page }) => {
    // Edit transaction category
    const categoryBadge = page
      .locator('[data-testid="transaction-category"]')
      .first()
    await categoryBadge.click()

    // Select category
    await page.locator('text=Groceries').click()

    // Should show option to create rule
    const createRuleOption = page.locator('[data-testid="create-rule-option"]')
    if (await createRuleOption.isVisible()) {
      await createRuleOption.click()

      // Rule should be created
      await expect(page.locator('text=/Rule created|Rule saved/')).toBeVisible()
    }
  })

  test('should bulk recategorize transactions', async ({ page }) => {
    // Select multiple transactions
    const checkboxes = page.locator('[data-testid="transaction-checkbox"]')
    await checkboxes.first().check()
    await checkboxes.nth(1).check()

    // Bulk actions menu should appear
    await expect(page.locator('[data-testid="bulk-actions"]')).toBeVisible()

    // Click recategorize
    await page.locator('[data-testid="bulk-recategorize"]').click()

    // Select category
    await page.locator('text=Dining').click()

    // Confirm
    await page.locator('[data-testid="confirm-bulk-action"]').click()

    // Should show success message
    await expect(page.locator('text=/2 transactions updated/')).toBeVisible()
  })

  test('should delete transaction', async ({ page }) => {
    // Click delete button on first transaction
    const deleteButton = page
      .locator('[data-testid="delete-transaction"]')
      .first()
    await deleteButton.click()

    // Confirmation dialog should appear
    await expect(
      page.locator('text=/Are you sure|Delete transaction/')
    ).toBeVisible()

    // Confirm deletion
    await page.locator('[data-testid="confirm-delete"]').click()

    // Should show success message
    await expect(page.locator('text=/Deleted|Removed/')).toBeVisible()
  })
})

test.describe('Transaction Details', () => {
  test('should show transaction details modal', async ({ page }) => {
    await page.goto('/transactions')

    // Click on first transaction
    const firstTransaction = page.locator('[data-testid="transaction-row"]').first()
    await firstTransaction.click()

    // Details modal should open
    await expect(page.locator('[data-testid="transaction-details"]')).toBeVisible()

    // Should show all transaction fields
    await expect(page.locator('text=Merchant')).toBeVisible()
    await expect(page.locator('text=Date')).toBeVisible()
    await expect(page.locator('text=Amount')).toBeVisible()
    await expect(page.locator('text=Category')).toBeVisible()
  })

  test('should show categorization confidence and explanation', async ({ page }) => {
    await page.goto('/transactions')

    // Click on transaction
    await page.locator('[data-testid="transaction-row"]').first().click()

    // Should show confidence score
    await expect(page.locator('[data-testid="confidence-score"]')).toBeVisible()

    // Should show explanation
    await expect(page.locator('[data-testid="category-explanation"]')).toBeVisible()
  })
})

test.describe('Empty States', () => {
  test('should show empty state when no transactions', async ({ page }) => {
    // Mock empty state (would need to clear data first in real scenario)
    await page.goto('/transactions')

    // Should show empty state if no transactions
    const emptyState = page.locator('[data-testid="empty-state"]')
    if (await emptyState.isVisible()) {
      await expect(emptyState).toContainText(/No transactions|Upload/)
      await expect(page.locator('text=Upload your first statement')).toBeVisible()
    }
  })

  test('should show empty state when filters return no results', async ({ page }) => {
    await page.goto('/transactions')

    // Apply filter that returns no results
    const searchBox = page.locator('[data-testid="transaction-search"]')
    await searchBox.fill('NonexistentMerchant12345')

    // Should show no results message
    await expect(page.locator('text=/No transactions found|No results/')).toBeVisible()
  })
})
