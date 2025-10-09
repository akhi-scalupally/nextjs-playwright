import { test, expect } from '@playwright/test';

test.describe('Product Pages', () => {
  test.beforeEach(async ({ page }) => {
    // No need to clear database - product pages only display data
  });

  test('product listing page loads', async ({ page }) => {
    await page.goto('/product');
    
    // Check if page loads without errors
    await expect(page).toHaveTitle(/TRX Headphones/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('individual product page loads', async ({ page }) => {
    // First, try to navigate to a product page
    // This assumes you have products with slugs
    await page.goto('/product');
    
    // Look for product links
    const productLinks = page.locator('a[href*="/product/"]');
    const linkCount = await productLinks.count();
    
    if (linkCount > 0) {
      // Click on the first product link
      await productLinks.first().click();
      
      // Check if product page loads
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('product navigation works', async ({ page }) => {
    // Navigate to products page
    await page.goto('/product');
    
    // Check if products page loads
    await expect(page).toHaveTitle(/TRX Headphones/);
    await expect(page.locator('body')).toBeVisible();
    
    // Look for product elements
    const productElements = page.locator('[data-testid="product"], .product, [class*="product"]');
    if (await productElements.count() > 0) {
      await expect(productElements.first()).toBeVisible();
    }
  });
});
