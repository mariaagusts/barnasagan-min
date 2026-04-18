// ══════════════════════════════════════════════
//  Auth tests — barnasagan.is
//  Covers: login, chapter map loading, logout
// ══════════════════════════════════════════════
const { test, expect } = require('@playwright/test');

const EMAIL = 'test@saganmin.is';
const PASSWORD = process.env.TEST_PASSWORD;

// Helper: navigate to auth screen and log in
async function login(page) {
  await page.goto('/');
  // Landing screen shows first — click the login button
  await page.waitForSelector('#nav-login-btn', { timeout: 15_000 });
  await page.click('#nav-login-btn');
  // Wait for auth form to appear
  await page.waitForSelector('#auth-email', { timeout: 10_000 });
  await page.fill('#auth-email', EMAIL);
  await page.fill('#auth-password', PASSWORD);
  await page.click('#auth-btn');
  // Wait for chapter map — Supabase DB can be slow on cold start
  await expect(page.locator('#chapter-grid')).toBeVisible({ timeout: 70_000 });
}

test('innskráning virkar', async ({ page }) => {
  await login(page);
  await expect(page.locator('#chapter-grid')).toBeVisible();
});

test('kaflakor hlaðast', async ({ page }) => {
  await login(page);
  // At least one chapter card must be visible (free or locked)
  await expect(page.locator('#chapter-grid .chapter-card').first()).toBeVisible({ timeout: 15_000 });
});

test('útskráning virkar', async ({ page }) => {
  await login(page);
  await page.click('#map-signout-btn');
  // After sign-out the landing screen should reappear
  await expect(page.locator('#nav-login-btn')).toBeVisible({ timeout: 10_000 });
});
