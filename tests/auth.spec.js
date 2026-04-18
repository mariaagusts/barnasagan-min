// ══════════════════════════════════════════════
//  Smoke tests — barnasagan.is
//  Covers: page load, nav, auth form, pricing
// ══════════════════════════════════════════════
const { test, expect } = require('@playwright/test');

test('forsíða hleðst og innskráningarhnappurinn er til staðar', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#nav-login-btn')).toBeVisible({ timeout: 15_000 });
});

test('innskráningarform opnast við smelli', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('#nav-login-btn', { timeout: 15_000 });
  await page.click('#nav-login-btn');
  await expect(page.locator('#auth-email')).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('#auth-btn')).toBeVisible({ timeout: 5_000 });
});

test('verðskráarsíða hleðst', async ({ page }) => {
  await page.goto('/pricing.html');
  await expect(page.locator('body')).toBeVisible({ timeout: 15_000 });
  // Payment coming-soon banner must be present
  await expect(page.locator('#payment-soon-msg')).toBeVisible({ timeout: 10_000 });
});
