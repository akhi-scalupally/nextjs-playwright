# Playwright Test Suite

This directory contains end-to-end tests for the TRX Headphones application using Playwright.

## Test Structure

- `example.spec.ts` - Basic example tests
- `app.spec.ts` - Application-specific tests
- `e2e.spec.ts` - Comprehensive end-to-end tests

## Running Tests

### Prerequisites
1. Install Playwright browsers: `npm run test:install`
2. Make sure you have a `.env.test` file with test environment variables

### Available Commands

- `npm run test:dev:open` - Open Playwright UI for interactive testing
- `npm run test:run` - Run tests in headless mode
- `npm run test:run:build` - Run tests with build (same as test:run)
- `npm run test:debug` - Run tests in debug mode
- `npm run test:headed` - Run tests with visible browser
- `npm run test:install` - Install Playwright browsers

### Test Environment

The tests use the same workflow as the previous Cypress setup:
1. Build the Next.js application
2. Start the production server
3. Wait for the server to be ready
4. Run Playwright tests

### Writing Tests

Tests are written in TypeScript and use Playwright's API:

```typescript
import { test, expect } from '@playwright/test';

test('my test', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Welcome');
});
```

### Test Categories

1. **Application Tests** - Basic page loading and navigation
2. **API Tests** - Backend API endpoint testing
3. **Cross-browser Tests** - Testing across different browsers
4. **Mobile Tests** - Responsive design testing

### Configuration

The Playwright configuration is in `playwright.config.ts` and includes:
- Multiple browser support (Chrome, Firefox, Safari)
- Mobile device testing
- Parallel test execution
- Automatic retries on failure
- HTML test reports
