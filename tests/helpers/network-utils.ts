import { Page, expect } from '@playwright/test';

/**
 * Cross-browser compatible network waiting utility
 * Works reliably across Chrome, Firefox, Safari, and mobile browsers
 */
export class NetworkUtils {
  /**
   * Wait for API response using UI-based approach (most reliable)
   * @param page - Playwright page instance
   * @param action - Function that triggers the network request
   * @param successIndicator - Element or condition that indicates success
   * @param timeout - Maximum time to wait (default: 30 seconds)
   */
  static async waitForApiSuccess(
    page: Page,
    action: () => Promise<void>,
    successIndicator: () => Promise<void>,
    timeout: number = 30000
  ): Promise<void> {
    // Execute the action
    await action();
    
    // Wait for the success indicator (UI change)
    await successIndicator();
  }

  /**
   * Wait for form submission success by checking form state
   * @param page - Playwright page instance
   * @param action - Function that submits the form
   * @param formSelector - Selector for the form field to check
   * @param timeout - Maximum time to wait
   */
  static async waitForFormSubmission(
    page: Page,
    action: () => Promise<void>,
    formSelector: string,
    timeout: number = 30000
  ): Promise<void> {
    await action();
    
    // Wait for form to clear (indicates successful submission)
    await expect(page.locator(formSelector)).toHaveValue('', { timeout });
  }

  /**
   * Wait for list update by checking item count or content
   * @param page - Playwright page instance
   * @param action - Function that triggers the update
   * @param listSelector - Selector for the list container
   * @param expectedContent - Expected content to appear
   * @param timeout - Maximum time to wait
   */
  static async waitForListUpdate(
    page: Page,
    action: () => Promise<void>,
    listSelector: string,
    expectedContent: string,
    timeout: number = 30000
  ): Promise<void> {
    await action();
    
    // Wait for the expected content to appear in the list
    await expect(page.locator(listSelector)).toContainText(expectedContent, { timeout });
  }

  /**
   * Wait for element to disappear (useful for delete operations)
   * @param page - Playwright page instance
   * @param action - Function that triggers the deletion
   * @param elementSelector - Selector for the element that should disappear
   * @param timeout - Maximum time to wait
   */
  static async waitForElementRemoval(
    page: Page,
    action: () => Promise<void>,
    elementSelector: string,
    timeout: number = 30000
  ): Promise<void> {
    await action();
    
    // Wait for the element to be removed
    await expect(page.locator(elementSelector)).not.toBeVisible({ timeout });
  }

  /**
   * Monitor network requests for debugging (doesn't wait, just logs)
   * @param page - Playwright page instance
   */
  static monitorNetworkRequests(page: Page): void {
    page.on('request', request => {
      console.log(`>> ${request.method()} ${request.url()}`);
    });
    
    page.on('response', response => {
      console.log(`<< ${response.status()} ${response.url()}`);
    });
  }

  /**
   * Navigate to a page with retry logic for better reliability
   * @param page - Playwright page instance
   * @param url - URL to navigate to
   * @param maxRetries - Maximum number of retry attempts (default: 2)
   * @param timeout - Timeout for each attempt (default: 30000ms)
   */
  static async navigateWithRetry(
    page: Page,
    url: string,
    maxRetries: number = 2,
    timeout: number = 30000
  ): Promise<void> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Navigation attempt ${attempt} to ${url}`);
        await page.goto(url, { 
          waitUntil: 'domcontentloaded', 
          timeout 
        });
        console.log(`Successfully navigated to ${url}`);
        return;
      } catch (error) {
        lastError = error as Error;
        console.log(`Navigation attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          console.log(`Retrying navigation in 2 seconds...`);
          await page.waitForTimeout(2000);
        }
      }
    }
    
    throw new Error(`Failed to navigate to ${url} after ${maxRetries} attempts. Last error: ${lastError?.message}`);
  }
}
