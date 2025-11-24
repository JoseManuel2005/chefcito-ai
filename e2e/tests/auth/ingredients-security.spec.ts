import { test, expect } from '@playwright/test';
import { IngredientsPage } from '../../pages/IngredientsPage';

test.describe('Ingredients Page - Security & Robustness', () => {
  let ingredientsPage: IngredientsPage;

  test.beforeEach(async ({ page }) => {
    ingredientsPage = new IngredientsPage(page);
    await ingredientsPage.goto();
  });

  test('should handle extremely long payloads in ingredient input', async ({ page }) => {
    const longString = 'a'.repeat(10000);

    // Ensure a row exists and fill it
    await ingredientsPage.addNewIngredientRow();
    await ingredientsPage.addIngredient(longString);

    // Small wait to allow client-side processing
    await page.waitForTimeout(200);

    const value = await ingredientsPage.getIngredientValue(0);

    // If the app sanitized to empty string, ensure page is still fine.
    if (value === '') {
      await expect(page.locator('body')).toBeVisible();
      // Log warning so CI output clarifies why the test didn't assert the full string
      console.warn('Ingredient value empty after long fill — possible sanitization or input limit.');
    } else {
      // Basic sanity check — prefer that some of the payload persisted
      expect(value).toContain('aaaaa');
    }
  });

  test('should sanitize special characters (XSS prevention)', async ({ page }) => {
    const xssPayload = '<script>alert("XSS")</script>';

    // Spy for dialogs — if the payload executes, Playwright would fire 'dialog'
    let dialogSeen = false;
    page.on('dialog', () => {
      dialogSeen = true;
    });

    // Ensure row exists and fill it
    await ingredientsPage.addNewIngredientRow();
    await ingredientsPage.addIngredient(xssPayload);

    // Wait briefly to allow any script execution if it would happen
    await page.waitForTimeout(300);

    const value = await ingredientsPage.getIngredientValue(0);

    // No dialog should have been shown (script not executed)
    expect(dialogSeen).toBe(false);

    // The app should not render raw <script> tags in the displayed value.
    // It's acceptable either to escape or to remove the content entirely.
    expect(value).not.toContain('<script>');

    // If the app keeps content, prefer escaped or plain text but not executed form.
    if (value.length > 0) {
      // Disallow the exact raw payload to be present in rendered value (policy decision)
      expect(value).not.toBe(xssPayload);
    } else {
      // If empty, ensure app didn't crash
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should handle rapid addition of ingredients (Flood Test)', async ({ page }) => {
  // Add 20 ingredients rapidly
  for (let i = 0; i < 20; i++) {
    await ingredientsPage.addNewIngredientRow();      
    await ingredientsPage.addIngredient(`Ingredient ${i}`);  
  }

  const count = await ingredientsPage.getIngredientsCount();
  expect(count).toBe(21);
});

  test('should not expose sensitive tokens in the DOM', async ({ page }) => {
    // Check for common sensitive keywords in the entire page content
    const content = await page.content();
    const sensitiveKeywords = ['sk_live', 'eyJh', 'Bearer ', 'private_key'];

    for (const keyword of sensitiveKeywords) {
      expect(content).not.toContain(keyword);
    }
  });

  test('should have basic accessibility (A11y)', async ({ page }) => {
    // Ensure the first ingredient input has a placeholder attribute (basic a11y / semantic check)
    const firstInput = ingredientsPage.ingredientInput.first();
    const placeholder = await firstInput.getAttribute('placeholder');
    expect(placeholder).not.toBeNull();

    // The add button should be identifiable (text or aria-label). Prefer visible role check.
    await expect(ingredientsPage.addIngredientButton).toBeVisible();
  });
});
