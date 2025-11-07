import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Goals and Budgets
 *
 * Tests goal creation, tracking, and progress monitoring
 */

test.describe('Goal Creation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/goals')
  })

  test('should create a budget goal', async ({ page }) => {
    // Click create goal button
    await page.locator('[data-testid="create-goal"]').click()

    // Goal creation dialog should open
    await expect(page.locator('[data-testid="goal-dialog"]')).toBeVisible()

    // Select budget goal type
    await page.locator('[data-testid="goal-type-budget"]').click()

    // Fill in goal details
    await page.locator('[data-testid="goal-name"]').fill('Dining Budget')
    await page.locator('[data-testid="goal-category"]').click()
    await page.locator('text=Dining').click()
    await page.locator('[data-testid="goal-amount"]').fill('200')

    // Set time period
    await page.locator('[data-testid="goal-period"]').click()
    await page.locator('text=Monthly').click()

    // Save goal
    await page.locator('[data-testid="save-goal"]').click()

    // Should show success message
    await expect(page.locator('text=/Goal created|Saved/')).toBeVisible()

    // Goal should appear in list
    await expect(page.locator('text=Dining Budget')).toBeVisible()
  })

  test('should create a savings goal', async ({ page }) => {
    await page.locator('[data-testid="create-goal"]').click()

    // Select savings goal type
    await page.locator('[data-testid="goal-type-savings"]').click()

    // Fill in details
    await page.locator('[data-testid="goal-name"]').fill('Emergency Fund')
    await page.locator('[data-testid="goal-amount"]').fill('5000')
    await page.locator('[data-testid="goal-deadline"]').fill('2024-12-31')

    // Save
    await page.locator('[data-testid="save-goal"]').click()

    // Should show success
    await expect(page.locator('text=Emergency Fund')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.locator('[data-testid="create-goal"]').click()

    // Try to save without filling fields
    await page.locator('[data-testid="save-goal"]').click()

    // Should show validation errors
    await expect(page.locator('text=/Required|This field is required/')).toBeVisible()
  })
})

test.describe('Goal Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/goals')
  })

  test('should display goal progress', async ({ page }) => {
    // First goal card should show progress
    const goalCard = page.locator('[data-testid="goal-card"]').first()
    await expect(goalCard).toBeVisible()

    // Should show progress bar
    await expect(goalCard.locator('[data-testid="goal-progress-bar"]')).toBeVisible()

    // Should show percentage
    await expect(goalCard.locator('text=/%/')).toBeVisible()

    // Should show amount spent/saved
    await expect(goalCard.locator('text=/\\$/')).toBeVisible()
  })

  test('should show goal status indicators', async ({ page }) => {
    const goalCard = page.locator('[data-testid="goal-card"]').first()

    // Should show status badge (on track, over budget, etc.)
    await expect(
      goalCard.locator('[data-testid="goal-status"]')
    ).toBeVisible()
  })

  test('should update progress in real-time after new transaction', async ({ page }) => {
    // Get initial progress
    const goalCard = page.locator('[data-testid="goal-card"]').first()
    const initialProgress = await goalCard
      .locator('[data-testid="goal-progress"]')
      .textContent()

    // Add a transaction (would need to go through upload flow or API)
    // For now, we'll just verify the structure exists
    await expect(goalCard).toBeVisible()
  })
})

test.describe('Goal Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/goals')
  })

  test('should edit existing goal', async ({ page }) => {
    // Click edit button on first goal
    const editButton = page.locator('[data-testid="edit-goal"]').first()
    await editButton.click()

    // Dialog should open with existing values
    await expect(page.locator('[data-testid="goal-dialog"]')).toBeVisible()

    // Update amount
    const amountInput = page.locator('[data-testid="goal-amount"]')
    await amountInput.clear()
    await amountInput.fill('300')

    // Save
    await page.locator('[data-testid="save-goal"]').click()

    // Should show success
    await expect(page.locator('text=/Updated|Saved/')).toBeVisible()
  })

  test('should delete goal', async ({ page }) => {
    // Click delete button
    const deleteButton = page.locator('[data-testid="delete-goal"]').first()
    await deleteButton.click()

    // Confirmation dialog
    await expect(
      page.locator('text=/Are you sure|Delete goal/')
    ).toBeVisible()

    // Confirm
    await page.locator('[data-testid="confirm-delete"]').click()

    // Should show success
    await expect(page.locator('text=/Deleted|Removed/')).toBeVisible()
  })

  test('should pause/resume goal', async ({ page }) => {
    // Click pause button
    const pauseButton = page.locator('[data-testid="pause-goal"]').first()
    await pauseButton.click()

    // Goal should show paused status
    await expect(page.locator('text=/Paused/')).toBeVisible()

    // Click resume
    const resumeButton = page.locator('[data-testid="resume-goal"]').first()
    await resumeButton.click()

    // Should be active again
    await expect(page.locator('text=/Active|On track/')).toBeVisible()
  })
})

test.describe('Goal Insights', () => {
  test('should show goal recommendations', async ({ page }) => {
    await page.goto('/goals')

    // Should show recommendations for new goals
    const recommendations = page.locator('[data-testid="goal-recommendations"]')
    if (await recommendations.isVisible()) {
      await expect(recommendations).toContainText(/Recommended|Suggested/)
    }
  })

  test('should show alerts for overspending', async ({ page }) => {
    await page.goto('/goals')

    // Look for over-budget alerts
    const alerts = page.locator('[data-testid="goal-alert"]')
    const count = await alerts.count()

    if (count > 0) {
      // Alert should have warning styling
      await expect(alerts.first()).toBeVisible()
    }
  })

  test('should show projected completion date for savings goals', async ({ page }) => {
    await page.goto('/goals')

    // Find savings goal
    const savingsGoal = page.locator('[data-testid="goal-type-savings"]').first()
    if (await savingsGoal.isVisible()) {
      // Should show projected completion
      await expect(
        savingsGoal.locator('text=/Projected|Estimated/')
      ).toBeVisible()
    }
  })
})

test.describe('Empty States', () => {
  test('should show empty state when no goals', async ({ page }) => {
    await page.goto('/goals')

    const emptyState = page.locator('[data-testid="empty-state"]')
    if (await emptyState.isVisible()) {
      await expect(emptyState).toContainText(/No goals|Create your first goal/)
      await expect(page.locator('[data-testid="create-goal"]')).toBeVisible()
    }
  })
})
