import { test as setup, expect } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, '.auth/user.json')

setup('authenticate', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel(/email/i).fill('test@mordheim.local')
  await page.getByLabel(/password/i).fill('TestPassword123!')
  await page.getByRole('button', { name: /sign in|log in/i }).click()
  await page.waitForURL(/\/(dashboard|warbands|campaigns)/, { timeout: 10000 })
  await page.context().storageState({ path: authFile })
})
