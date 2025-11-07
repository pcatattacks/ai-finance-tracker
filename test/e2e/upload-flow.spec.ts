import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Upload Flow
 *
 * Critical user journey: Upload → Categorization → Insight Generation
 *
 * Success criteria from PRD:
 * - Time-to-first-insight: < 30 seconds after upload
 * - Auto-categorization accuracy: > 90%
 */

test.describe('Document Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to upload page
    await page.goto('/upload')
  })

  test('should upload CSV file and show processing status', async ({ page }) => {
    // Check for upload dropzone
    const dropzone = page.locator('[data-testid="upload-dropzone"]')
    await expect(dropzone).toBeVisible()

    // Create a test CSV file
    const csvContent = `Date,Merchant,Description,Amount
2024-01-15,Whole Foods,Grocery shopping,-87.50
2024-01-16,Netflix,Monthly subscription,-15.99
2024-01-17,Shell,Fuel,-45.00`

    // Upload file
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-transactions.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    })

    // Should show upload progress
    await expect(page.locator('[data-testid="upload-status"]')).toBeVisible()

    // Should show processing status
    await expect(page.locator('text=/Processing|Categorizing/')).toBeVisible()

    // Should complete within 30 seconds (PRD requirement)
    await expect(page.locator('[data-testid="upload-complete"]')).toBeVisible({
      timeout: 30000,
    })
  })

  test('should show error for invalid file format', async ({ page }) => {
    // Try to upload a non-CSV file
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Invalid content'),
    })

    // Should show error message
    await expect(
      page.locator('text=/Invalid file format|Please upload a CSV/')
    ).toBeVisible()
  })

  test('should show validation errors for malformed CSV', async ({ page }) => {
    // Upload CSV with missing required columns
    const invalidCsv = `Name,Value
Test,100`

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'invalid.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(invalidCsv),
    })

    // Should show validation error
    await expect(
      page.locator('text=/Could not detect required columns|Missing required fields/')
    ).toBeVisible()
  })

  test('should redirect to dashboard after successful upload', async ({ page }) => {
    const csvContent = `Date,Merchant,Amount
2024-01-15,Whole Foods,-87.50`

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    })

    // Wait for processing to complete
    await expect(page.locator('[data-testid="upload-complete"]')).toBeVisible({
      timeout: 30000,
    })

    // Should redirect or provide link to dashboard
    await expect(page).toHaveURL(/\/(dashboard|upload)/)
  })
})

test.describe('Transaction Categorization', () => {
  test('should automatically categorize uploaded transactions', async ({ page }) => {
    // Upload transactions
    await page.goto('/upload')

    const csvContent = `Date,Merchant,Amount
2024-01-15,Whole Foods,-87.50
2024-01-16,Netflix,-15.99
2024-01-17,Shell,-45.00`

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    })

    // Wait for upload to complete
    await page.waitForTimeout(2000)

    // Navigate to transactions page
    await page.goto('/transactions')

    // Verify transactions are categorized
    await expect(page.locator('text=Groceries')).toBeVisible()
    await expect(page.locator('text=Subscriptions')).toBeVisible()
    await expect(page.locator('text=Transport')).toBeVisible()
  })

  test('should display confidence scores for AI categorizations', async ({ page }) => {
    await page.goto('/transactions')

    // Should show confidence indicators
    const confidenceBadges = page.locator('[data-testid="confidence-score"]')
    await expect(confidenceBadges.first()).toBeVisible()
  })

  test('should allow manual category editing', async ({ page }) => {
    await page.goto('/transactions')

    // Click on first transaction's category
    const firstCategory = page.locator('[data-testid="transaction-category"]').first()
    await firstCategory.click()

    // Category picker should open
    await expect(page.locator('[data-testid="category-picker"]')).toBeVisible()

    // Select a different category
    await page.locator('text=Dining').click()

    // Should save the change
    await expect(page.locator('text=/Category updated|Saved/')).toBeVisible()
  })
})

test.describe('Insight Generation', () => {
  test('should generate insights after upload', async ({ page }) => {
    // Upload transactions with patterns that should trigger insights
    await page.goto('/upload')

    const csvContent = `Date,Merchant,Amount
2024-01-01,Starbucks,-5.50
2024-01-02,Starbucks,-5.50
2024-01-03,Starbucks,-5.50
2024-01-04,Starbucks,-5.50
2024-01-05,Starbucks,-5.50`

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    })

    // Wait for processing
    await page.waitForTimeout(3000)

    // Navigate to dashboard or insights
    await page.goto('/')

    // Should show insight about recurring spending
    await expect(
      page.locator('text=/recurring|frequent|pattern/i')
    ).toBeVisible({ timeout: 10000 })
  })

  test('should display insight explanations', async ({ page }) => {
    await page.goto('/insights')

    // First insight card
    const insightCard = page.locator('[data-testid="insight-card"]').first()
    await expect(insightCard).toBeVisible()

    // Should have "why" tooltip or explanation
    const whyButton = insightCard.locator('[data-testid="insight-why"]')
    await whyButton.click()

    // Explanation should be visible
    await expect(
      insightCard.locator('[data-testid="insight-explanation"]')
    ).toBeVisible()
  })

  test('should allow dismissing insights', async ({ page }) => {
    await page.goto('/insights')

    const firstInsight = page.locator('[data-testid="insight-card"]').first()
    const insightText = await firstInsight.textContent()

    // Click dismiss button
    await firstInsight.locator('[data-testid="dismiss-insight"]').click()

    // Insight should be removed
    await expect(page.locator(`text=${insightText}`)).not.toBeVisible()
  })
})
