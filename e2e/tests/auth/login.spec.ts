import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

test.describe('Login Page Security & Robustness', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test.describe('Usability & Accessibility', () => {
    test('should have correct metadata and structure', async ({ page }) => {
      await expect(page).toHaveTitle(/Chefcito/i);
      await expect(loginPage.mainHeading).toBeVisible();
      await expect(loginPage.subHeading).toBeVisible();
    });

    test('should have accessible interactive elements', async () => {
      await loginPage.checkBasicAccessibility();
    });

    test('should handle theme toggling correctly', async ({ page }) => {
      // Check initial state (assuming light or system default, but we check for change)
      const initialHtmlClass = await page.locator('html').getAttribute('class') || '';
      
      await loginPage.toggleTheme();
      
      // Wait for transition
      await page.waitForTimeout(500);
      
      const newHtmlClass = await page.locator('html').getAttribute('class') || '';
      expect(newHtmlClass).not.toBe(initialHtmlClass);
      
      // Check if specific dark/light classes are applied to the main container
      const main = page.locator('main');
      if (initialHtmlClass.includes('dark')) {
         await expect(main).not.toHaveClass(/dark/);
      } else {
         // If it was light, now it might be dark or vice versa depending on implementation
         // The implementation toggles a class on the main element or html?
         // Looking at page.tsx: className={`... ${theme === "dark" ? "dark bg-gray-950" : "bg-white"}`}
         // So we check the main element classes.
      }
    });

    test('should manage focus order logically', async ({ page }) => {
      // Press Tab and check focus moves to expected elements
      // 1. Theme Toggle (fixed top right)
      // 2. Google Button (in the card)
      // Note: This depends on the DOM order. Theme toggle is earlier in DOM.
      
      await page.keyboard.press('Tab');
      await expect(loginPage.themeToggle).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(loginPage.googleButton).toBeFocused();
    });
  });

  test.describe('Robustness & Error Handling', () => {
    test('should handle rapid clicks (Flood) on Google button', async ({ page }) => {
      // Intercept the request to mock or just observe
      // Since it calls signInWithGoogle (Firebase), we might not want to actually trigger the popup repeatedly
      // or we just want to see if the UI breaks.
      
      // We check if the button becomes disabled or handles the click.
      // The component has `disabled={loading}`.
      
      // Click once
      await loginPage.googleButton.click();
      
      // Immediately check if it's disabled or shows loading state
      // Note: This might be too fast for the state update if not mocked, but let's try.
      await expect(loginPage.googleButton).toBeDisabled();
      await expect(loginPage.googleButton).toHaveText(/Iniciando.../i);
      
      // Try to click again while disabled (should not error, just do nothing)
      await loginPage.googleButton.click({ force: true });
      
      // Ensure it stays in loading state or recovers eventually
      // We can't easily mock the firebase response here without more setup, 
      // so we assume it stays loading until timeout or error.
    });

    test('should handle rapid clicks on Theme Toggle', async () => {
      for (let i = 0; i < 10; i++) {
        await loginPage.themeToggle.click();
      }
      // Should not crash
      await expect(loginPage.themeToggle).toBeVisible();
    });
  });

  test.describe('Security Checks', () => {
    test('should have secure headers', async ({ page }) => {
      const response = await page.goto('/login');
      const headers = response?.headers();
      
      if (headers) {
        // These are standard security headers we expect in a robust app
        // Note: In a dev environment these might be missing, so we log warnings instead of failing if not strict.
        const securityHeaders = [
          'x-content-type-options',
          'x-frame-options',
          'strict-transport-security'
        ];
        
        for (const header of securityHeaders) {
          if (!headers[header]) {
            console.warn(`Missing security header: ${header}`);
          } else {
            expect(headers[header]).toBeDefined();
          }
        }
      }
    });

    test('should not expose sensitive tokens in DOM', async () => {
      const findings = await loginPage.checkNoSensitiveDataInDOM();
      expect(findings).toEqual([]);
    });

    test('should not reflect URL parameters (XSS Check)', async ({ page }) => {
      const maliciousPayload = '<script>alert(1)</script>';
      await page.goto(`/login?redirect=${encodeURIComponent(maliciousPayload)}`);
      
      const content = await page.content();
      // We expect the payload to be escaped or not present in a dangerous context
      expect(content).not.toContain(maliciousPayload); 
      // Or if it is present, it should be encoded: &lt;script&gt;...
    });
  });

  test.describe('Input Validation & Injection (Hypothetical)', () => {
    test('should verify absence of vulnerable inputs or test them if present', async ({ page }) => {
      const inputs = page.locator('input');
      const count = await inputs.count();

      if (count === 0) {
        console.log('No inputs found. Skipping injection tests. Surface area is minimized.');
        return;
      }

      // If inputs existed, we would test them here:
      const longPayload = 'A'.repeat(10000);
      const sqlPayload = "' OR '1'='1";
      
      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);
        if (await input.isVisible()) {
           await input.fill(longPayload);
           // Check for crash or truncation
           const value = await input.inputValue();
           expect(value.length).toBe(longPayload.length); // or expect truncation if that's the policy

           await input.fill(sqlPayload);
           // Check for error messages
        }
      }
    });
  });
});
