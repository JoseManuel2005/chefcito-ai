import { test, expect } from '@playwright/test';
import { NavbarPage } from '../../pages/navbar.page';

test.describe('Navbar Component', () => {
  let navbar: NavbarPage;

  test.beforeEach(async ({ page }) => {
    navbar = new NavbarPage(page);
    await navbar.goto();
  });

  test.describe('Desktop Navigation', () => {
    test('should navigate to main sections', async ({ page }) => {
      // Create Recipe
      await navbar.createRecipeLink.click();
      await expect(page).toHaveURL(/.*ingredients/);
      
      // Analyze Recipe
      await navbar.analyzeRecipeLink.click();
      await expect(page).toHaveURL(/.*recipe-analysis/);
      
      // Home via Logo
      await navbar.logo.click();
      await expect(page).toHaveURL(/.*home/);
    });

    test('should toggle theme', async ({ page }) => {
      const html = page.locator('html');
      const initialClass = await html.getAttribute('class');
      
      await navbar.toggleTheme();
      
      // Wait for class change
      await page.waitForTimeout(500); // Small wait for transition
      const newClass = await html.getAttribute('class');
      expect(newClass).not.toBe(initialClass);
      
      // Toggle back
      await navbar.toggleTheme();
    });
  });

  test.describe('User Menu & Logout', () => {
    test('should show user menu options', async ({ page }) => {
      await navbar.openUserMenu();
      
      await expect(navbar.userMenuDropdown.getByRole('button', { name: 'Manual de Usuario' })).toBeVisible();
      await expect(navbar.userMenuDropdown.getByRole('button', { name: 'Preferencias' })).toBeVisible();
      await expect(navbar.userMenuDropdown.getByRole('button', { name: 'Recetas Favoritas' })).toBeVisible();
      await expect(navbar.userMenuDropdown.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();
    });

    test('should logout correctly', async ({ page }) => {
      await navbar.logout();
      // Assuming logout redirects to landing page '/'
      await expect(page).toHaveURL(/\/$/); 
    });
  });

  test.describe('Mobile Navigation', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should open mobile menu and navigate', async ({ page }) => {
      await navbar.openMobileMenu();
      
      // Verify links are visible
      await expect(navbar.mobileHomeLink).toBeVisible();
      await expect(navbar.mobileCreateRecipeLink).toBeVisible();
      
      // Navigate
      await navbar.mobileCreateRecipeLink.click();
      await expect(page).toHaveURL(/.*ingredients/);
    });

    test('should show mobile user options', async ({ page }) => {
      await navbar.openMobileMenu();
      
      // In mobile, user options are directly in the menu list (based on code analysis)
      await expect(page.locator('.md\\:hidden').getByRole('button', { name: 'Manual de Usuario' })).toBeVisible();
      await expect(navbar.mobileLogoutButton).toBeVisible();
    });
  });
});
