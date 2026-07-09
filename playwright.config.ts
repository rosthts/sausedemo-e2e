import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';
import { config } from './src/config/config';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: isCI,
  /* Retry on CI only to get flaky tests to pass (not failed) */
  retries: isCI ? 2 : 0,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['list'], ['html', { open: 'never' }]],
  /* Cap each test while keeping enough time for external site latency. */
  timeout: config.timeout,
  expect: {
    timeout: 7_000,
  },
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    // Change default 'data-testid' to custom attribute name 'data-test'
    testIdAttribute: 'data-test',
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: config.baseURL,

    /* Keep failure artifacts lightweight locally and focused in CI. */
    trace: isCI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  /* Configure projects for major browsers (only one for now, other can be added later) */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ]
});
