import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 0 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 1, // Force single worker for context isolation
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Force headless mode in CI, allow headed locally */
    headless: process.env.CI ? true : false,
    
    /* Fresh context settings - ensure clean browser state */
    acceptDownloads: true,
    ignoreHTTPSErrors: true,
    
    /* Clear browser data between tests - don't persist storage state */
    storageState: undefined,
    
    /* Keep default viewport dimensions */
    // viewport: { width: 1280, height: 720 }, // Commented out to keep default
    
    /* Ensure fresh context by not reusing contexts */
    reuseExistingServer: false,
    
    /* Set locale and timezone for consistency */
    locale: 'en-US',
    timezoneId: 'America/New_York',
    
    /* Disable offline mode */
    offline: false,
    
    /* Clear permissions between tests */
    permissions: [],
    
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  /* Configure projects for Chrome browser only */
  projects: [
    {
      name: 'chrome',
      use: { 
        ...devices['Desktop Chrome'],
        // Add Chrome-specific launch options for CI stability
        launchOptions: process.env.CI ? {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            // Additional args for fresh context isolation
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding'
          ]
        } : {
          // Non-CI launch options for fresh context
          args: [
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding'
          ]
        }
      },
    },
    
    // Optional: Add a specific project for dashboard scenario tests
    {
      name: 'dashboard-tests',
      testMatch: '**/dashboard-scenario-*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        // Enhanced fresh context settings specifically for dashboard tests
        acceptDownloads: true,
        ignoreHTTPSErrors: true,
        storageState: undefined,
        // Keep default viewport dimensions for dashboard tests
        // viewport: { width: 1280, height: 720 }, // Commented out to use default
        permissions: [],
        locale: 'en-US',
        timezoneId: 'America/New_York',
        
        // Dashboard-specific context options
        contextOptions: {
          // Additional context isolation for dashboard tests
          clearCookies: true,
          clearPermissions: true,
        },
        
        launchOptions: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            // Additional isolation for dashboard tests
            '--disable-extensions',
            '--disable-plugins',
            '--disable-default-apps'
          ]
        }
      }
    }
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});