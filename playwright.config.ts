import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Global setup and teardown */
  globalSetup: './tests/global-setup.ts',
  globalTeardown: './tests/global-teardown.ts',
  /* Temporary directory for test artifacts - will be cleaned up after tests */
  outputDir: './.playwright-temp',
  /* Run tests sequentially to avoid race conditions */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Use only 1 worker to run tests sequentially */
  workers: 1,
  /* Increase timeout for tests */
  timeout: 60000, // 60 seconds
  expect: {
    timeout: 30000, // 30 seconds for assertions
  },
  /* Run tests in order to avoid race conditions */
  testMatch: '**/*.spec.ts',
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'list',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Disable all file generation to prevent test-results folder */
    trace: 'off',
    video: 'off',
    screenshot: 'off',
    
    /* Custom test id attribute - similar to Cypress data-cy */
    testIdAttribute: 'data-testid',
    
    /* Disable cache to improve network event detection in Firefox and mobile browsers */
    extraHTTPHeaders: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    
    /* Add isolation between tests */
    contextOptions: {
      ignoreHTTPSErrors: true,
    },
  },

  /* Configure projects for specific browsers */
  projects: [
    {
      name: 'chrome',
      use: { 
        ...devices['Desktop Chrome'],
        // Disable cache for Chrome to improve network event detection
        bypassCSP: true,
        // Add isolation for each test
        launchOptions: {
          args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
        }
      },
    },

    {
      name: 'safari',
      use: { 
        ...devices['Desktop Safari'],
        // Disable cache for Safari to improve network event detection
        bypassCSP: true,
      },
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        // Disable cache for Firefox to improve network event detection
        bypassCSP: true,
      },
    },

    {
      name: 'edge',
      use: { 
        ...devices['Desktop Edge'],
        // Disable cache for Edge to improve network event detection
        bypassCSP: true,
      },
    },

    /* Mobile browsers */
    {
      name: 'google-pixel',
      use: { 
        ...devices['Pixel 5'],
        // Disable cache for mobile Chrome
        bypassCSP: true,
      },
    },
    {
      name: 'iphone-14',
      use: { 
        ...devices['iPhone 14'],
        // Disable cache for mobile Safari
        bypassCSP: true,
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
