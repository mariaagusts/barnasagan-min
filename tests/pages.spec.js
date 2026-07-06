// ══════════════════════════════════════════════
//  Smoke tests — static pages, PWA assets, i18n
// ══════════════════════════════════════════════
const { test, expect } = require('@playwright/test');

test('persónuverndarsíða hleðst', async ({ page }) => {
  await page.goto('/privacy.html');
  await expect(page.locator('body')).toBeVisible({ timeout: 15_000 });
});

test('skilmálasíða hleðst', async ({ page }) => {
  await page.goto('/terms.html');
  await expect(page.locator('body')).toBeVisible({ timeout: 15_000 });
});

test('manifest og PWA táknmynd eru til', async ({ request }) => {
  const manifest = await request.get('/manifest.json');
  expect(manifest.ok()).toBeTruthy();
  const json = await manifest.json();
  expect(json.icons?.length).toBeGreaterThan(0);
  for (const icon of json.icons) {
    const res = await request.get(icon.src);
    expect(res.ok(), `icon ${icon.src} vantar`).toBeTruthy();
  }
});

test('engar JS villur við hleðslu forsíðu', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));
  await page.goto('/');
  await page.waitForSelector('#nav-login-btn', { timeout: 15_000 });
  expect(errors, `JS villur: ${errors.join('; ')}`).toHaveLength(0);
});
