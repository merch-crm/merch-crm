import { test as setup, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const authDir = path.join(__dirname, '../playwright/.auth')
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true })
}
const authFile = path.join(authDir, 'user.json')

setup('authenticate', async ({ page }) => {
  try {
    console.log('Navigating to login page...');
    await page.goto(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', { timeout: 60000 });
    
    // Explicitly wait for the page to load
    await page.waitForLoadState('networkidle', { timeout: 60000 });
    
    console.log('Filling login form...');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'testpassword123');
    
    console.log('Submitting form...');
    await Promise.all([
      page.waitForURL(/\/dashboard/, { timeout: 30000 }),
      page.click('button[type="submit"]')
    ]);
    
    console.log('Authentication successful, saving state...');
    await page.context().storageState({ path: authFile });
  } catch (error) {
    console.error('Authentication failed:', error);
    throw error;
  }
})
