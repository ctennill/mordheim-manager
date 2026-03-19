import { test, expect } from '@playwright/test'

test.describe('Public pages', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/login')
    // The login page h1 is "Mordheim Manager"; the subtext says "Sign in to your account"
    await expect(page.getByRole('heading', { name: /mordheim manager/i })).toBeVisible()
  })

  test('factions page loads with faction cards', async ({ page }) => {
    await page.goto('/factions')
    // Should show faction cards, not an error
    await expect(page.getByText(/failed to load/i)).not.toBeVisible()
    await expect(page.locator('a[href*="/factions/"]').first()).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Authenticated pages', () => {
  test('dashboard loads', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).not.toHaveURL(/login/)
    await expect(page.getByText(/failed|error/i)).not.toBeVisible()
  })

  test('warbands page loads', async ({ page }) => {
    await page.goto('/warbands')
    await expect(page).not.toHaveURL(/login/)
    await expect(page.getByText(/my warbands/i)).toBeVisible()
  })

  test('campaigns page loads', async ({ page }) => {
    await page.goto('/campaigns')
    await expect(page).not.toHaveURL(/login/)
    await expect(page.getByText(/campaigns/i).first()).toBeVisible()
  })

  test('new warband page loads', async ({ page }) => {
    await page.goto('/warbands/new')
    await expect(page).not.toHaveURL(/login/)
    await expect(page.getByText(/faction/i).first()).toBeVisible()
  })

  test('factions page shows content when authenticated', async ({ page }) => {
    await page.goto('/factions')
    await expect(page.getByText(/failed to load/i)).not.toBeVisible()
    await expect(page.locator('a[href*="/factions/"]').first()).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Warband builder flow', () => {
  test('can select a faction and advance to name step', async ({ page }) => {
    await page.goto('/warbands/new')
    // Click Reiklanders faction card
    await page.getByText('Reiklanders').click()
    // Should advance to name step — title is "Name Your Warband"
    await expect(page.getByText(/name your warband/i)).toBeVisible({ timeout: 5000 })
  })

  test('can name warband and advance to heroes step', async ({ page }) => {
    await page.goto('/warbands/new')
    await page.getByText('Reiklanders').click()
    await expect(page.getByText(/name your warband/i)).toBeVisible({ timeout: 5000 })
    await page.getByLabel(/warband name/i).fill('Test Warband')
    await page.getByRole('button', { name: 'Next →' }).click()
    // Title becomes "Hire Your Heroes"
    await expect(page.getByText(/hire your heroes/i)).toBeVisible({ timeout: 5000 })
  })

  test('heroes step shows position cards', async ({ page }) => {
    await page.goto('/warbands/new')
    await page.getByText('Reiklanders').click()
    await expect(page.getByText(/name your warband/i)).toBeVisible({ timeout: 5000 })
    await page.getByLabel(/warband name/i).fill('Test Warband')
    await page.getByRole('button', { name: 'Next →' }).click()
    await expect(page.getByText(/hire your heroes/i)).toBeVisible({ timeout: 5000 })
    // Should show at least one hero position card (Captain)
    await expect(page.getByText('Captain')).toBeVisible({ timeout: 5000 })
  })

  // Verify each of the 6 newly-seeded factions shows heroes in the builder
  const factionLeaders: [string, string][] = [
    ['Marienburg Merchants', 'Merchant'],
    ['Middenheim Mercenaries', 'Champion of Ulric'],
    ['Witch Hunters', 'Witch Hunter Captain'],
    ['Orcs & Goblins', 'Orc Boss'],
    ['Cult of the Possessed', 'Magister'],
    ['Beastmen Raiders', 'Beastman Shaman'],
  ]

  for (const [faction, leader] of factionLeaders) {
    test(`heroes step for ${faction} shows ${leader}`, async ({ page }) => {
      await page.goto('/warbands/new')
      await page.getByText(faction, { exact: true }).click()
      await expect(page.getByText(/name your warband/i)).toBeVisible({ timeout: 5000 })
      await page.getByLabel(/warband name/i).fill('Test Warband')
      await page.getByRole('button', { name: 'Next →' }).click()
      await expect(page.getByText(/hire your heroes/i)).toBeVisible({ timeout: 5000 })
      await expect(page.getByText(leader, { exact: true })).toBeVisible({ timeout: 5000 })
    })
  }
})
