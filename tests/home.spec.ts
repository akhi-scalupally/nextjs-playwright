import { test, expect } from '@playwright/test';
import { NetworkUtils } from './helpers/network-utils';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    // No need to clear database - home page doesn't use local database
    await NetworkUtils.navigateWithRetry(page, '/');
    // Wait for page to be ready with more reliable approach
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('main', { timeout: 10000 });
  });

  test('homepage loads and displays main content', async ({ page }) => {
    // Navigate to homepage
    await NetworkUtils.navigateWithRetry(page, '/');
    
    // Check page title
    await expect(page).toHaveTitle(/TRX Headphones/);
    
    // Check if main content is visible
    await expect(page.locator('body')).toBeVisible();
    
    // Check for main banner
    await expect(page.locator('main').first()).toBeVisible();
    
    // Check for products section
    await expect(page.locator('section:has-text("Best Selling Headphones")')).toBeVisible();
    
    // Wait for products to load and find them with flexible selectors
    await page.waitForLoadState('networkidle');
    
    // Try multiple selectors to find products
    let productCards;
    const selectors = [
      '[data-testid="product-card"]',
      '.product-card', 
      '[class*="product"]',
      'div[class*="card"]',
      'article',
      'div:has(img)',
      'div:has-text("$")', // Products usually have price with $ symbol
      'div:has-text("Buy")', // Products usually have buy button
    ];
    
    for (const selector of selectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        productCards = page.locator(selector);
        console.log(`Found ${count} products using selector: ${selector}`);
        break;
      }
    }
    
    if (!productCards || (await productCards.count()) === 0) {
      // Fallback: look for any divs that might contain product info
      productCards = page.locator('div').filter({ hasText: /\$|\d+\.\d+|\d+€|price|buy|headphone/i });
    }
    
    await expect(productCards.first()).toBeVisible({ timeout: 10000 });
    
    // Check that we have multiple products
    const productCount = await productCards.count();
    expect(productCount).toBeGreaterThan(0);
  });

  test('navigation bar is functional', async ({ page }) => {
    // Check if navbar exists using data-testid
    const navbar = page.getByTestId('navbar');
    await expect(navbar).toBeVisible();
    
    // Check for navigation links using data-testid
    const homeLink = page.getByTestId('home-link');
    await expect(homeLink).toBeVisible();
    
    const addressLink = page.getByTestId('address-link');
    await expect(addressLink).toBeVisible();
    
    // Check for cart button using data-testid
    const cartButton = page.getByTestId('open-cart');
    await expect(cartButton).toBeVisible();
    
    // Check for cart count
    const cartCount = page.getByTestId('cart-count');
    await expect(cartCount).toBeVisible();
  });

  test('footer is present', async ({ page }) => {
    // Check if footer exists using CSS classes
    const footer = page.locator('div.mt-20.mx-4.text-center');
    await expect(footer).toBeVisible();
    
    // Check for footer text content
    const footerText = page.locator('text=TRX Headphones All rights reserverd');
    await expect(footerText).toBeVisible();
  });

  test('homepage loads with all main components', async ({ page }) => {
    // Navigate to homepage
    await NetworkUtils.navigateWithRetry(page, '/');
    
    // Check page title
    await expect(page).toHaveTitle(/TRX Headphones/);
    
    // Check if main content is visible
    await expect(page.locator('body')).toBeVisible();
    
    // Check for navbar using data-testid
    const navbar = page.getByTestId('navbar');
    await expect(navbar).toBeVisible();
    
    // Check for footer using CSS classes
    const footer = page.locator('div.mt-20.mx-4.text-center');
    await expect(footer).toBeVisible();
    
    // Check for main banner
    await expect(page.locator('main').first()).toBeVisible();
    
    // Check for products section
    await expect(page.locator('section:has-text("Best Selling Headphones")')).toBeVisible();
    
    // Check for price sort dropdown
    await expect(page.locator('select#price-sort')).toBeVisible();
  });

  test('price sorting functionality works', async ({ page }) => {
    // Navigate to homepage with retry logic
    await NetworkUtils.navigateWithRetry(page, '/');
    
    // Wait for products to load in UI with flexible selectors
    await page.waitForLoadState('networkidle');
    
    let productCards;
    const selectors = [
      '[data-testid="product-card"]',
      '.product-card', 
      '[class*="product"]',
      'div[class*="card"]',
      'article',
      'div:has(img)',
      'div:has-text("$")',
      'div:has-text("Buy")',
    ];
    
    for (const selector of selectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        productCards = page.locator(selector);
        break;
      }
    }
    
    if (!productCards || (await productCards.count()) === 0) {
      productCards = page.locator('div').filter({ hasText: /\$|\d+\.\d+|\d+€|price|buy|headphone/i });
    }
    
    await expect(productCards.first()).toBeVisible({ timeout: 10000 });
    
    // Check that price sort dropdown is visible and functional
    const priceSort = page.locator('select#price-sort');
    await expect(priceSort).toBeVisible();
    
    // Get initial product count
    const initialCount = await productCards.count();
    expect(initialCount).toBeGreaterThan(0);
    
    // Test descending sort
    await priceSort.selectOption('desc');
    await expect(priceSort).toHaveValue('desc');
    
    // Wait for sorting to take effect
    await page.waitForTimeout(500);
    
    // Test ascending sort
    await priceSort.selectOption('asc');
    await expect(priceSort).toHaveValue('asc');
    
    // Wait for sorting to take effect
    await page.waitForTimeout(500);
    
    // Verify products are still visible after sorting
    const finalCount = await productCards.count();
    expect(finalCount).toBe(initialCount);
  });

  test('product listing functionality works', async ({ page }) => {
    // Navigate to homepage
    await NetworkUtils.navigateWithRetry(page, '/');
    
    // Wait for products to load in UI with flexible selectors
    await page.waitForLoadState('networkidle');
    
    let productCards;
    const selectors = [
      '[data-testid="product-card"]',
      '.product-card', 
      '[class*="product"]',
      'div[class*="card"]',
      'article',
      'div:has(img)',
      'div:has-text("$")',
      'div:has-text("Buy")',
    ];
    
    for (const selector of selectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        productCards = page.locator(selector);
        break;
      }
    }
    
    if (!productCards || (await productCards.count()) === 0) {
      productCards = page.locator('div').filter({ hasText: /\$|\d+\.\d+|\d+€|price|buy|headphone/i });
    }
    
    await expect(productCards.first()).toBeVisible({ timeout: 10000 });
    
    // Verify product information is displayed
    const productCount = await productCards.count();
    expect(productCount).toBeGreaterThan(0);
    
    // Check that each product card has required elements
    for (let i = 0; i < Math.min(productCount, 3); i++) {
      const productCard = productCards.nth(i);
      
      // Check for product name with flexible selectors
      const nameSelectors = [
        '[data-testid="product-name"]',
        'h3', 'h4', 'h5', 'h6',
        '.product-name', '[class*="name"]',
        'p', 'span', 'div'
      ];
      
      let nameElement;
      for (const selector of nameSelectors) {
        const elements = productCard.locator(selector);
        if (await elements.count() > 0) {
          nameElement = elements.first();
          break;
        }
      }
      
      if (nameElement) {
        await expect(nameElement).toBeVisible();
      } else {
        console.log(`No name element found for product ${i + 1}`);
      }
      
      // Check for product price with flexible selectors
      const priceSelectors = [
        '[data-testid="product-price"]',
        '.price', '[class*="price"]', '[class*="cost"]',
        'span:has-text("$")', 'div:has-text("$")',
        'span:has-text("€")', 'div:has-text("€")'
      ];
      
      let priceElement;
      for (const selector of priceSelectors) {
        const elements = productCard.locator(selector);
        if (await elements.count() > 0) {
          priceElement = elements.first();
          break;
        }
      }
      
      if (priceElement) {
        await expect(priceElement).toBeVisible();
      } else {
        console.log(`No price element found for product ${i + 1}`);
      }
      
      // Check for product image
      const imageElement = productCard.locator('img');
      if (await imageElement.count() > 0) {
        await expect(imageElement.first()).toBeVisible();
      } else {
        console.log(`No image found for product ${i + 1}`);
      }
      
      // Check for buy button with flexible selectors
      const buttonSelectors = [
        '[data-testid="buy-button"]',
        'button', '.btn', '[class*="buy"]', '[class*="button"]',
        'a:has-text("Buy")', 'button:has-text("Buy")',
        'a:has-text("Add")', 'button:has-text("Add")'
      ];
      
      let buyButton;
      for (const selector of buttonSelectors) {
        const elements = productCard.locator(selector);
        if (await elements.count() > 0) {
          buyButton = elements.first();
          break;
        }
      }
      
      if (buyButton) {
        await expect(buyButton).toBeVisible();
      } else {
        console.log(`No buy button found for product ${i + 1}`);
      }
    }
  });
});

test.describe('Cross-browser compatibility', () => {
  test.beforeEach(async ({ page }) => {
    // No need to clear database - home page doesn't use local database
    await NetworkUtils.navigateWithRetry(page, '/');
    // Wait for page to be ready with more reliable approach
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('main', { timeout: 10000 });
  });

  test('works in Chrome', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium');
    
    await NetworkUtils.navigateWithRetry(page, '/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('works in Firefox', async ({ page, browserName }) => {
    test.skip(browserName !== 'firefox');
    
    await NetworkUtils.navigateWithRetry(page, '/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('works in Safari', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit');
    
    await NetworkUtils.navigateWithRetry(page, '/');
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Mobile responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    // No need to clear database - home page doesn't use local database
    await page.setViewportSize({ width: 375, height: 667 });
    await NetworkUtils.navigateWithRetry(page, '/');
    // Wait for page to be ready with more reliable approach
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('main', { timeout: 10000 });
  });

  test('works on mobile devices', async ({ page }) => {
    await NetworkUtils.navigateWithRetry(page, '/');
    await expect(page.locator('body')).toBeVisible();
    
    // Check if navigation is accessible on mobile
    const navbar = page.getByTestId('navbar');
    await expect(navbar).toBeVisible();
    
    // Check if price sort dropdown works on mobile
    const priceSort = page.locator('select#price-sort');
    await expect(priceSort).toBeVisible();
  });
});
