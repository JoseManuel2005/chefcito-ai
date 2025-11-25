import { Page, Locator, expect } from '@playwright/test';

export class UserGuidePage {
  readonly page: Page;
  readonly userMenuButton: Locator;
  readonly userMenuDropdown: Locator;
  readonly manualButton: Locator;
  readonly mobileMenuButton: Locator;
  readonly mobileManualButton: Locator;
  readonly modal: Locator;
  readonly closeButton: Locator;
  readonly sidebar: Locator;
  readonly mobileSidebarToggle: Locator;
  
  constructor(page: Page) {
    this.page = page;
    // Navbar elements
    this.userMenuButton = page.locator('button:has(.rounded-full)'); // Heuristic for avatar button
    this.userMenuDropdown = page.locator('div.absolute.right-0.top-12');
    this.manualButton = page.getByRole('button', { name: 'Manual de Usuario' });
    
    // Mobile Navbar elements
    this.mobileMenuButton = page.locator('button:has(svg.lucide-menu)'); // Hamburger menu
    this.mobileManualButton = page.locator('.md\\:hidden').getByRole('button', { name: 'Manual de Usuario' });

    // Modal elements
    this.modal = page.locator('.fixed.z-50.bg-white'); // Main modal container
    this.closeButton = this.modal.locator('button:has(svg.lucide-x)');
    this.sidebar = this.modal.locator('nav');
    this.mobileSidebarToggle = this.modal.locator('button:has(svg.lucide-menu)');
  }

  async openFromDesktop() {
    await this.userMenuButton.click();
    await expect(this.userMenuDropdown).toBeVisible();
    await this.manualButton.click();
  }

  async openFromMobile() {
    await this.mobileMenuButton.click();
    await this.mobileManualButton.click();
  }

  async navigateToSection(sectionName: string) {
    await this.sidebar.getByRole('button', { name: sectionName }).click();
  }

  async getSectionTitle() {
    return this.modal.locator('h3.text-xl').textContent();
  }

  async isSectionActive(sectionName: string) {
    const button = this.sidebar.getByRole('button', { name: sectionName });
    return await button.evaluate(el => el.classList.contains('bg-yellow-100'));
  }
}
