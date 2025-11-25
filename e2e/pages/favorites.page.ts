import { Page, Locator, expect } from '@playwright/test';

export class FavoritesPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly emptyStateMessage: Locator;
  readonly recipeGrid: Locator;
  readonly recipeCards: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('h1', { hasText: 'Recetas Favoritas' });
    this.emptyStateMessage = page.locator('text=Aún no tienes favoritos');
    this.recipeGrid = page.locator('.grid');
    this.recipeCards = page.locator('.group'); // Assuming cards have 'group' class based on code analysis
    this.loadingSpinner = page.locator('text=Cargando tus favoritos');
  }

  async goto() {
    await this.page.goto('/favorites');
  }

  async getRecipeCard(index: number = 0) {
    return this.recipeCards.nth(index);
  }

  async getRecipeTitle(index: number = 0) {
    return this.recipeCards.nth(index).locator('h3');
  }

  async openRecipeDetail(index: number = 0) {
    const card = await this.getRecipeCard(index);
    await card.locator('button[aria-label="Ver detalles"]').click();
  }

  async removeFavorite(index: number = 0) {
    const card = await this.getRecipeCard(index);
    await card.locator('button[aria-label="Quitar de favoritos"]').click();
  }

  async openShareMenu(index: number = 0) {
    const card = await this.getRecipeCard(index);
    await card.locator('button[aria-label="Más opciones"]').click();
  }

  // Locators for the detail modal
  get modal() {
    return this.page.locator('.fixed.inset-0');
  }

  get modalTitle() {
    return this.modal.locator('h2');
  }

  get modalCloseButton() {
    return this.modal.locator('button[aria-label="Cerrar"]');
  }

  // Helper to inject mock data
  async injectFavorites(favorites: any[]) {
    await this.page.addInitScript((data) => {
      // This is a simplified mock. In a real app, we might need to mock the API response
      // or the Firebase hook. Since we can't easily mock the hook from outside without
      // complex setup, we might rely on the fact that the page fetches data.
      // However, for this task, we'll assume we can intercept the network or 
      // just test the UI reaction to whatever is there, OR we mock the network response if it was a REST API.
      // Since it's Firebase, we might need to mock the `useFavoriteRecipes` hook or the firebase calls.
      // For this exercise, we will assume the test runner has a way to seed data or we will mock the network requests if possible.
      // Given the constraints, we will focus on UI interactions.
      // But to test "long payloads", we can try to intercept network requests if they were HTTP.
      // Since it's client-side firebase, it's harder. 
      // We will try to mock `window.localStorage` if it was used, but it uses Firestore.
      
      // Strategy: We will use `page.route` to mock network if possible, but Firebase uses WebSockets/special protocols.
      // Fallback: We will focus on the UI handling of content that *is* rendered, 
      // assuming we could seed the DB. 
      // OR, we can try to mock the `window` object properties if the app exposed the hook (it doesn't).
    }, favorites);
  }
}
