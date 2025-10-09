import { test, expect } from '@playwright/test';
import { clearAddressTestData } from '../lib/db-sqlite';
import { NetworkUtils } from './helpers/network-utils';

test.describe('Address Management', () => {
  // Clean up addresses only once before the entire test suite
  test.beforeAll(async () => {
    // Set test mode environment variable
    process.env.NEXT_PUBLIC_TEST_MODE = 'true';
    console.log('🧪 Test mode enabled:', process.env.NEXT_PUBLIC_TEST_MODE);
    
    // Clear test address data before starting
    clearAddressTestData();
  });

  test.beforeEach(async ({ page }) => {
    // Clear address data before each test to ensure clean state
    clearAddressTestData();
    
    // Monitor network requests for debugging
    page.on('request', request => {
      if (request.url().includes('/api/address')) {
        console.log(`🌐 API Request: ${request.method()} ${request.url()}`);
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/address')) {
        console.log(`🌐 API Response: ${response.status()} ${response.url()}`);
      }
    });
    
    await page.goto('/address');
    // Wait for page to be ready with more reliable approach
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('[data-testid="address-page"]');
  });

  test('address page loads and form is present', async ({ page }) => {
    // Check if page loads
    await expect(page).toHaveTitle(/TRX Headphones/);
    
    // Check for address page using data-testid
    const addressPage = page.getByTestId('address-page');
    await expect(addressPage).toBeVisible();
    
    // Check for form using data-testid
    const form = page.getByTestId('address-form');
    await expect(form).toBeVisible();
    
    // Check for form fields using data-testid
    const nameField = page.getByTestId('af-name');
    await expect(nameField).toBeVisible();
    
    const addressField = page.getByTestId('af-line1');
    await expect(addressField).toBeVisible();
    
    const cityField = page.getByTestId('af-city');
    await expect(cityField).toBeVisible();
    
    // Check for submit button using data-testid
    const submitButton = page.getByTestId('af-submit');
    await expect(submitButton).toBeVisible();
  });

  test('can fill and submit address form', async ({ page }) => {
    // Fill out the form with all required fields
    await page.getByTestId('af-name').fill('John Doe');
    await page.getByTestId('af-line1').fill('123 Main Street');
    await page.getByTestId('af-city').fill('New York');
    await page.getByTestId('af-postal').fill('10001');
    await page.getByTestId('af-country').fill('United States');
    
    // Submit the form
    await page.getByTestId('af-submit').click();
    
    // Verify the form cleared (indicates success)
    await expect(page.getByTestId('af-name')).toHaveValue('');
    
    // Wait for the new address to appear in the list
    await expect(page.getByTestId('al-name').first()).toContainText('John Doe');
  });

  test('can edit existing address', async ({ page, browserName }) => {
    // First create an address
    await page.getByTestId('af-name').fill('Test User');
    await page.getByTestId('af-line1').fill('123 Test Street');
    await page.getByTestId('af-city').fill('Test City');
    await page.getByTestId('af-postal').fill('12345');
    await page.getByTestId('af-country').fill('Test Country');
    
    console.log('📝 Filling form with Test User data');
    
    // Wait for the POST API call to complete
    const createApiPromise = page.waitForResponse(
      response => response.url().includes('/api/address') && response.request().method() === 'POST' && response.status() === 201,
      { timeout: 10000 }
    );
    
    await page.getByTestId('af-submit').click();
    console.log('🔄 Form submitted');
    
    // Wait for the API response
    const createResponse = await createApiPromise;
    const createData = await createResponse.json();
    console.log('✅ API Response received:', createData);
    
    // Wait for form to clear (indicates successful creation)
    await expect(page.getByTestId('af-name')).toHaveValue('');
    console.log('✅ Form cleared - address creation successful');
    
    // Wait for the address to appear in the list
    await expect(page.getByTestId('al-name').first()).toContainText('Test User');
    console.log('✅ Address created successfully');
    
    // Now edit the address
    await page.getByTestId('al-edit').first().click();
    
    // Check that form is populated with existing data
    await expect(page.getByTestId('af-name')).toHaveValue('Test User');
    console.log('✅ Form populated with existing data');
    
    // Wait for the PUT API call to complete
    const updateApiPromise = page.waitForResponse(
      response => response.url().includes('/api/address/') && response.request().method() === 'PUT' && response.status() === 200,
      { timeout: 10000 }
    );
    
    // Update the name
    await page.getByTestId('af-name').fill('Updated User');
    await page.getByTestId('af-submit').click();
    console.log('✅ Form submitted with updated name');
    
    // Wait for the API response
    const updateResponse = await updateApiPromise;
    const updateData = await updateResponse.json();
    console.log('✅ Update API Response received:', updateData);
    
    // Wait for form to clear (indicates successful update)
    await expect(page.getByTestId('af-name')).toHaveValue('');
    
    // Browser-specific handling for safari
    if (browserName === 'webkit') {
      // Safari needs extra time for DOM updates
      await page.waitForTimeout(200);
      console.log('🍎 Safari: Added extra wait for DOM updates');
    }
    
    // Wait for the updated name to appear in the list
    await expect(page.getByTestId('al-name').first()).toContainText('Updated User');
    
    console.log('✅ Address updated successfully in the list');
  });

  test('can delete address', async ({ page, browserName }) => {
    // Check existing addresses and clear if needed
    const existingAddresses = await page.getByTestId('al-item').count();
    console.log(`Found ${existingAddresses} existing addresses`);
    
    // First create an address
    await page.getByTestId('af-name').fill('Delete Test');
    await page.getByTestId('af-line1').fill('123 Delete Street');
    await page.getByTestId('af-city').fill('Delete City');
    await page.getByTestId('af-postal').fill('12345');
    await page.getByTestId('af-country').fill('Delete Country');
    await page.getByTestId('af-submit').click();
    
    // Wait for form to clear (indicates successful creation)
    await expect(page.getByTestId('af-name')).toHaveValue('');
    
    // Find the specific address item that contains "Delete Test" in the name field
    const addressItem = page.locator('[data-testid="al-item"]:has([data-testid="al-name"]:has-text("Delete Test"))');
    await expect(addressItem).toBeVisible();
    
    // Verify the address name within that specific item
    await expect(addressItem.locator('[data-testid="al-name"]')).toContainText('Delete Test');
    
    // Wait for the DELETE API call to complete before checking UI state
    const deleteApiPromise = page.waitForResponse(
      response => response.url().includes('/api/address/') && response.request().method() === 'DELETE' && response.status() === 200,
      { timeout: 10000 }
    );
    
    // Delete the address using the delete button within that specific item
    await addressItem.locator('[data-testid="al-delete"]').click();
    
    // Wait for the API response
    const deleteResponse = await deleteApiPromise;
    const deleteData = await deleteResponse.json();
    console.log('✅ Delete API Response received:', deleteData);
    
    // Wait for the address to be removed from the UI using the correct locator
    // Add a small delay to ensure UI state has updated after API response
    await page.waitForTimeout(100);
    
    // Browser-specific handling for Google Pixel
    if (browserName === 'chromium' && page.viewportSize()?.width && page.viewportSize()!.width < 768) {
      // Google Pixel needs extra time for UI updates
      await page.waitForTimeout(300);
      console.log('📱 Google Pixel: Added extra wait for UI updates');
    }
    
    // Debug: Check if the element still exists before asserting it's not visible
    const deleteTestElements = await page.locator('[data-testid="al-item"]:has([data-testid="al-name"]:has-text("Delete Test"))').count();
    console.log(`🔍 Found ${deleteTestElements} elements with "Delete Test" after deletion`);
    
    if (deleteTestElements > 0) {
      // Log the current state of all address items for debugging
      const allAddressItems = await page.getByTestId('al-item').count();
      console.log(`🔍 Total address items remaining: ${allAddressItems}`);
      
      for (let i = 0; i < allAddressItems; i++) {
        const itemName = await page.getByTestId('al-name').nth(i).textContent();
        console.log(`🔍 Address item ${i}: "${itemName}"`);
      }
    }
    
    await expect(page.locator('[data-testid="al-item"]:has([data-testid="al-name"]:has-text("Delete Test"))')).not.toBeVisible();
    
    // Verify the specific address was deleted using the correct locator
    await expect(page.locator('[data-testid="al-item"]:has([data-testid="al-name"]:has-text("Delete Test"))')).not.toBeVisible();
    
    // Check final count
    const finalCount = await page.getByTestId('al-item').count();
    console.log(`Final address count: ${finalCount}`);
    
    // If no addresses remain, check for empty state
    if (finalCount === 0) {
      await expect(page.getByTestId('al-empty')).toBeVisible();
    } else {
      // Verify that "Delete Test" is not in any remaining addresses using the correct locator
      const deleteTestExists = await page.locator('[data-testid="al-item"]:has([data-testid="al-name"]:has-text("Delete Test"))').count();
      expect(deleteTestExists).toBe(0);
    }
  });

  test('debug address deletion', async ({ page, browserName }) => {
    // Check how many addresses exist before creating new one
    const addressItems = page.getByTestId('al-item');
    const initialCount = await addressItems.count();
    console.log('Initial address count:', initialCount);
    
    // Create an address
    await page.getByTestId('af-name').fill('Delete Test');
    await page.getByTestId('af-line1').fill('123 Delete Street');
    await page.getByTestId('af-city').fill('Delete City');
    await page.getByTestId('af-postal').fill('12345');
    await page.getByTestId('af-country').fill('Delete Country');
    await page.getByTestId('af-submit').click();
    
    // Wait for form to clear (indicates successful creation)
    await expect(page.getByTestId('af-name')).toHaveValue('');
    
    // Check how many addresses exist after creating new one
    const newCount = await addressItems.count();
    console.log('Address count after creation:', newCount);
    
    // Find the specific address item using the correct locator
    const addressItem = page.locator('[data-testid="al-item"]:has([data-testid="al-name"]:has-text("Delete Test"))');
    await expect(addressItem).toBeVisible();
    
    // Wait for the DELETE API call to complete before checking UI state
    const deleteApiPromise = page.waitForResponse(
      response => response.url().includes('/api/address/') && response.request().method() === 'DELETE' && response.status() === 200,
      { timeout: 10000 }
    );
    
    // Delete the address
    await addressItem.locator('[data-testid="al-delete"]').click();
    
    // Wait for the API response
    const deleteResponse = await deleteApiPromise;
    const deleteData = await deleteResponse.json();
    console.log('✅ Delete API Response received:', deleteData);
    
    // Wait for the address to be removed from the UI using the correct locator
    // Add a small delay to ensure UI state has updated after API response
    await page.waitForTimeout(100);
    
    // Browser-specific handling for Google Pixel
    if (browserName === 'chromium' && page.viewportSize()?.width && page.viewportSize()!.width < 768) {
      // Google Pixel needs extra time for UI updates
      await page.waitForTimeout(300);
      console.log('📱 Google Pixel: Added extra wait for UI updates');
    }
    
    // Debug: Check if the element still exists before asserting it's not visible
    const deleteTestElements = await page.locator('[data-testid="al-item"]:has([data-testid="al-name"]:has-text("Delete Test"))').count();
    console.log(`🔍 Found ${deleteTestElements} elements with "Delete Test" after deletion`);
    
    if (deleteTestElements > 0) {
      // Log the current state of all address items for debugging
      const allAddressItems = await page.getByTestId('al-item').count();
      console.log(`🔍 Total address items remaining: ${allAddressItems}`);
      
      for (let i = 0; i < allAddressItems; i++) {
        const itemName = await page.getByTestId('al-name').nth(i).textContent();
        console.log(`🔍 Address item ${i}: "${itemName}"`);
      }
    }
    
    await expect(page.locator('[data-testid="al-item"]:has([data-testid="al-name"]:has-text("Delete Test"))')).not.toBeVisible();
    

    
    // Check final count
    const finalCount = await addressItems.count();
    console.log('Address count after deletion:', finalCount);
    
    // Should show empty state
    await expect(page.getByTestId('al-empty')).toBeVisible();
  });
});

test.describe('Address Page Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Don't clear between tests - work with existing data
    await page.goto('/address');
  });

  test('address page loads and form is functional', async ({ page }) => {
    await page.goto('/address');
    
    // Check if address page loads
    await expect(page).toHaveTitle(/TRX Headphones/);
    await expect(page.locator('body')).toBeVisible();
    
    // Check for address page using data-testid
    const addressPage = page.getByTestId('address-page');
    await expect(addressPage).toBeVisible();
    
    // Look for form elements using data-testid
    const form = page.getByTestId('address-form');
    await expect(form).toBeVisible();
    
    // Check for required form fields using data-testid
    const nameField = page.getByTestId('af-name');
    const addressField = page.getByTestId('af-line1');
    const cityField = page.getByTestId('af-city');
    const postalField = page.getByTestId('af-postal');
    const countryField = page.getByTestId('af-country');
    
    await expect(nameField).toBeVisible();
    await expect(addressField).toBeVisible();
    await expect(cityField).toBeVisible();
    await expect(postalField).toBeVisible();
    await expect(countryField).toBeVisible();
  });
});
