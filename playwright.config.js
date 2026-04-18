// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  // How long one test can take — 90s to handle Supabase cold-start
  timeout: 90_000,
  // Retry once on failure before marking as broken
  retries: 1,
  // Run tests one at a time (avoids parallel login conflicts)
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'https://barnasagan.is',
    headless: true,
    actionTimeout: 15_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
