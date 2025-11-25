import { Page, Locator, expect } from '@playwright/test';

export class NavbarPage {
  readonly page: Page;
  readonly logo: Locator;
  readonly homeLink: Locator;
  readonly createRecipeLink: Locator;
  readonly analyzeRecipeLink: Locator;
  readonly themeToggle: Locator;
  readonly userMenuButton: Locator;
  readonly userMenuDropdown: Locator;
  readonly logoutButton: Locator;
  readonly mobileMenuButton: Locator;
  readonly mobileHomeLink: Locator;
  readonly mobileCreateRecipeLink: Locator;
  readonly mobileAnalyzeRecipeLink: Locator;
  readonly mobileThemeToggle: Locator;
  readonly mobileUserMenuButton: Locator;
  readonly mobileLogoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Desktop Elements
    this.logo = page.locator('.flex.items-center.gap-3.cursor-pointer').first();
    this.homeLink = page.getByRole('button', { name: 'Inicio' }).first();
    this.createRecipeLink = page.getByRole('button', { name: 'Crear receta' }).first();
    this.analyzeRecipeLink = page.getByRole('button', { name: 'Analizar receta' }).first();
    this.themeToggle = page.locator('button[aria-label^="Cambiar a modo"]').first();
    this.userMenuButton = page.locator('button:has(.rounded-full)').first();
    this.userMenuDropdown = page.locator('div.absolute.right-0.top-12');
    this.logoutButton = page.getByRole('button', { name: 'Cerrar sesión' });

    // Mobile Elements
    this.mobileMenuButton = page.locator('button:has(svg.lucide-menu)');
    // Mobile links appear in the dropdown, we can reuse names or target specifically if needed
    // The mobile menu container
    const mobileMenu = page.locator('.md\\:hidden.border-t');
    this.mobileHomeLink = mobileMenu.getByRole('button', { name: 'Inicio' });
    this.mobileCreateRecipeLink = mobileMenu.getByRole('button', { name: 'Crear receta' });
    this.mobileAnalyzeRecipeLink = mobileMenu.getByRole('button', { name: 'Analizar receta' });
    this.mobileThemeToggle = page.locator('.md\\:hidden button[aria-label^="Cambiar a modo"]');
    this.mobileUserMenuButton = mobileMenu.locator('.rounded-full'); // Avatar in mobile menu
    this.mobileLogoutButton = mobileMenu.getByRole('button', { name: 'Cerrar sesión' });
  }

  async goto() {
    await this.page.goto('/home');
  }

  async toggleTheme() {
    await this.themeToggle.click();
  }

  async openUserMenu() {
    await this.userMenuButton.click();
    await expect(this.userMenuDropdown).toBeVisible();
  }

  async logout() {
    await this.openUserMenu();
    await this.logoutButton.click();
  }

  async openMobileMenu() {
    await this.mobileMenuButton.click();
    await expect(this.page.locator('.md\\:hidden.border-t')).toBeVisible();
  }
}
