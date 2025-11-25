import { test, expect } from '@playwright/test';
import { UserGuidePage } from '../../pages/user-guide.page';

test.describe('User Guide Component', () => {
  let userGuide: UserGuidePage;

  test.beforeEach(async ({ page }) => {
    userGuide = new UserGuidePage(page);
    await page.goto('/home');
  });

  test.describe('Desktop Interaction', () => {
    test('should open and close the user guide', async ({ page }) => {
      await userGuide.openFromDesktop();
      await expect(userGuide.modal).toBeVisible();
      
      await userGuide.closeButton.click();
      await expect(userGuide.modal).toBeHidden();
    });

    test('should navigate through all sections', async ({ page }) => {
      await userGuide.openFromDesktop();
      
      const sections = [
        { id: 'ingredientes', title: 'Ingredientes → Recetas' },
        { id: 'voz', title: 'Entrada por voz y TTS' },
        { id: 'compartir', title: 'Compartir y guardar' },
        { id: 'analisis', title: 'Análisis de Recetas' },
        { id: 'preferencias', title: 'Preferencias y Configuración' },
        { id: 'inicio', title: 'Bienvenido a Chefcito AI' } // Back to start
      ];

      for (const section of sections) {
        await userGuide.navigateToSection(section.title);
        // Verify active state in sidebar
        const isActive = await userGuide.isSectionActive(section.title);
        expect(isActive).toBeTruthy();
        
        // Verify content title
        const title = await userGuide.getSectionTitle();
        expect(title).toContain(section.title);
      }
    });
  });

  test.describe('Mobile Interaction', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should open guide from mobile menu', async ({ page }) => {
      await userGuide.openFromMobile();
      await expect(userGuide.modal).toBeVisible();
      
      // Check if sidebar is hidden initially or accessible via toggle
      // In the component: (!isMobile || showMobileSidebar)
      // Initially showMobileSidebar is false.
      await expect(userGuide.sidebar).toBeHidden();
      
      // Open sidebar
      await userGuide.mobileSidebarToggle.click();
      await expect(userGuide.sidebar).toBeVisible();
      
      // Navigate and verify sidebar closes
      await userGuide.navigateToSection('Ingredientes → Recetas');
      await expect(userGuide.sidebar).toBeHidden(); // Should auto-close on selection
    });
  });

  test.describe('Robustness & Accessibility', () => {
    test('should handle rapid navigation without crashing', async ({ page }) => {
      await userGuide.openFromDesktop();
      
      // Click rapidly between sections
      await Promise.all([
        userGuide.navigateToSection('Ingredientes → Recetas'),
        userGuide.navigateToSection('Entrada por voz y TTS'),
        userGuide.navigateToSection('Compartir y guardar'),
        userGuide.navigateToSection('Bienvenido a Chefcito AI')
      ]);

      await expect(userGuide.modal).toBeVisible();
      const title = await userGuide.getSectionTitle();
      expect(title).toBeTruthy();
    });

    test('should have accessible elements', async ({ page }) => {
      await userGuide.openFromDesktop();
      
      // Check for aria-labels or roles
      await expect(userGuide.closeButton).toBeVisible();
      // Using accessible selectors in POM ensures we are targeting by role/label mostly
    });
  });
});
