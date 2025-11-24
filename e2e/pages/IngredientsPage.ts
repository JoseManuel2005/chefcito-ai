import { type Page, type Locator } from '@playwright/test';

export class IngredientsPage {
  readonly page: Page;
  readonly ingredientInput: Locator;
  readonly expiryInput: Locator;
  readonly addIngredientButton: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  readonly ingredientsList: Locator;
  readonly voiceInput: Locator;

  constructor(page: Page) {
    this.page = page;
    // More specific locators to avoid ambiguities:
    // - target actual <input> elements by placeholder attribute when possible
    // - fallback to a more generic locator if the app uses contentEditable
    this.ingredientInput = page.locator('input[placeholder="Ej: tomate, cebolla, pollo..."], [data-testid="ingredient-input"], [contenteditable="true"]');
    this.expiryInput = page.getByLabel('Fecha de vencimiento (opcional)');
    // Use exact: true to avoid partial matches with similarly named buttons
    this.addIngredientButton = page.getByRole('button', { name: 'Agregar ingrediente', exact: true });
    this.searchButton = page.getByRole('button', { name: 'Buscar recetas', exact: true });
    this.resetButton = page.getByRole('button', { name: 'Limpiar', exact: true });
    this.ingredientsList = page.locator('.space-y-3'); // Parent container of ingredients (adjust if needed)
    this.voiceInput = page.getByLabel('Transcripción de voz (editable)');
  }

  async goto() {
    await this.page.goto('/ingredients');
  }

  /**
   * Adds/fills an ingredient row. Handles the case where no inputs exist yet
   * by clicking the add button and waiting for a new input to appear.
   */
  async addIngredient(name: string, expiry?: string) {
    // Count inputs (could be input elements or contenteditable nodes)
    let count = await this.ingredientInput.count();

    if (count === 0) {
      await this.addIngredientButton.click();
      // Wait for at least one input to appear - selector should match what the component renders
      await this.page.waitForSelector('input[placeholder="Ej: tomate, cebolla, pollo..."], [data-testid="ingredient-input"], [contenteditable="true"]', { timeout: 3000 });
      count = await this.ingredientInput.count();
    }

    // Target the last input (newly added)
    const last = this.ingredientInput.last();

    // Focus and try to type reliably (works with controlled inputs and contenteditable)
    await last.focus();

    // Use try/except-like pattern: prefer fill for inputs, fallback to type for contentEditable
    const tagName = await last.evaluate((el: Element) => el.tagName.toLowerCase());
    const isContentEditable = await last.evaluate((el: any) => el.getAttribute && el.getAttribute('contenteditable') === 'true');

    if (tagName === 'input' || tagName === 'textarea') {
      // fill is the most reliable for <input> and <textarea>
      await last.fill(name);
      // Some components only update internal state on blur
      await last.press('Tab');
    } else if (isContentEditable) {
      // contentEditable: use evaluate to set innerText or use keyboard typing
      await last.evaluate((el: HTMLElement, text: string) => {
        el.innerText = text;
      }, name);
      // optionally trigger input events
      await last.evaluate((el: HTMLElement) => {
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('blur', { bubbles: true }));
      });
    } else {
      // Fallback to typing
      await last.type(name);
    }

    if (expiry) {
      // Similar robust approach for expiry input; assume it's a standard input
      const expiryLast = this.expiryInput.last();
      await expiryLast.fill(expiry);
      await expiryLast.press('Tab');
    }
  }

  async addNewIngredientRow() {
    await this.addIngredientButton.click();
    await this.page.waitForSelector('input[placeholder="Ej: tomate, cebolla, pollo..."], [data-testid="ingredient-input"], [contenteditable="true"]', { timeout: 3000 });
  }

  async removeIngredient(index: number) {
    // Assuming trash icon is the remove button
    const removeButtons = this.page.locator('button:has(svg.lucide-trash-2)');
    await removeButtons.nth(index).click();
  }

  async searchRecipes() {
    await this.searchButton.click();
  }

  async resetForm() {
    await this.resetButton.click();
  }

  async getIngredientsCount(): Promise<number> {
    return await this.ingredientInput.count();
  }

  /**
   * Returns the value of the ingredient at `index`.
   * Works with <input>, <textarea>, and contentEditable elements by reading
   * value, value attribute, textContent or innerText depending on node type.
   */
  async getIngredientValue(index: number): Promise<string> {
    const el = this.ingredientInput.nth(index);
    return await el.evaluate((node: any) => {
      try {
        // For real form controls
        if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) {
          return node.value ?? '';
        }
        // Some components store value in attribute
        if (node.getAttribute && node.getAttribute('value') !== null) {
          return node.getAttribute('value') ?? '';
        }
        // contentEditable or other nodes
        if (node.innerText && node.innerText.trim().length > 0) {
          return node.innerText.trim();
        }
        if (node.textContent && node.textContent.trim().length > 0) {
          return node.textContent.trim();
        }
        return '';
      } catch {
        return '';
      }
    });
  }
}
