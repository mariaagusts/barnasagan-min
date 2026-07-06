// ══════════════════════════════════════════════
//  Interview flow smoke test
//  Requires secrets: TEST_EMAIL + TEST_PASSWORD
//  (skipped automatically when not set)
// ══════════════════════════════════════════════
const { test, expect } = require('@playwright/test');

const EMAIL = process.env.TEST_EMAIL;
const PASSWORD = process.env.TEST_PASSWORD;

test('innskráning → kaflakort → fyrsta spurning birtist', async ({ page }) => {
  test.skip(!EMAIL || !PASSWORD, 'TEST_EMAIL/TEST_PASSWORD ekki stillt');

  await page.goto('/');
  await page.waitForSelector('#nav-login-btn', { timeout: 15_000 });
  await page.click('#nav-login-btn');
  await page.fill('#auth-email', EMAIL);
  await page.fill('#auth-password', PASSWORD);
  await page.click('#auth-btn');

  // Chapter map should appear after sign-in (Supabase cold start can be slow)
  const firstChapter = page.locator('.chapter-card').first();
  await expect(firstChapter).toBeVisible({ timeout: 45_000 });

  // Enter the first chapter — a question and answer box must render
  await firstChapter.click();
  await expect(page.locator('#question-text')).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('#answer-input')).toBeVisible({ timeout: 10_000 });
});
