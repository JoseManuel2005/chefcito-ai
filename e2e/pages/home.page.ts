import { Page } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly url = '/';

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');
  }

  async captureResponsesDuring(action: () => Promise<void>) {
    const responses: any[] = [];
    this.page.on('response', (resp) => responses.push(resp));
    await action();
    // small pause to let responses settle
    await this.page.waitForTimeout(200);
    return responses;
  }

  async assertNoTokensInDom() {
    const bodyText = await this.page.locator('body').innerText();
    const lowered = bodyText.toLowerCase();
    if (lowered.includes('bearer ') || lowered.includes('access_token') || lowered.includes('id_token') || lowered.includes('jwt')) {
      throw new Error('Possible token leakage in DOM detected');
    }
  }

  async assertNoStackTracesInResponses(responses: any[]) {
    for (const resp of responses) {
      let text = '';
      try {
        text = await resp.text();
      } catch {
        continue;
      }
      // Refined check: look for "Error: ... at ..." structure or file path indicators
      // to avoid false positives on words like "stack", "trace", "at" in normal content.
      const stackPattern = /(?:Error|Exception):[^\n]*\n\s+at\s+/i;
      
      if (stackPattern.test(text)) {
        throw new Error(`Response ${resp.url()} appears to leak internal stack/trace information`);
      }
    }
  }

  async assertCookiesAreSecure() {
    const cookies = await this.page.context().cookies();
    for (const c of cookies) {
      // If cookie name indicates session/token then it must be secure and httpOnly
      if (/token|session|auth|idp|cookie/i.test(c.name)) {
        if (!c.secure) throw new Error(`Cookie ${c.name} is not marked secure`);
        if (!c.httpOnly) throw new Error(`Cookie ${c.name} is not marked httpOnly`);
      }
    }
  }

  async checkContrastForSelector(selector: string, minRatio = 4.5) {
    const ratio = await this.page.evaluate((sel) => {
      function parseRGB(input: string) {
        const m = input.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!m) return null;
        return [Number(m[1]), Number(m[2]), Number(m[3])];
      }
      function luminance([r, g, b]: number[]) {
        const a = [r, g, b].map((v) => {
          v = v / 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
      }
      const el = document.querySelector(sel) as HTMLElement | null;
      if (!el) return -1;
      const style = getComputedStyle(el);
      const color = parseRGB(style.color) || [0, 0, 0];
      // find background by walking up until non-transparent
      let bg = style.backgroundColor;
      let node: Element | null = el;
      while (node && (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')) {
        node = node.parentElement;
        if (node) bg = getComputedStyle(node).backgroundColor;
      }
      const bgRgb = parseRGB(bg) || [255, 255, 255];
      const L1 = luminance(color);
      const L2 = luminance(bgRgb);
      const brightest = Math.max(L1, L2);
      const darkest = Math.min(L1, L2);
      const contrast = (brightest + 0.05) / (darkest + 0.05);
      return contrast;
    }, selector);
    if (ratio === -1) throw new Error(`Selector ${selector} not found for contrast check`);
    if (ratio < minRatio) throw new Error(`Contrast ratio ${ratio.toFixed(2)} for ${selector} is below ${minRatio}`);
    return ratio;
  }

  async tabbableAccessibleNames(count = 10) {
    const names: string[] = [];
    await this.page.keyboard.press('Tab');
    for (let i = 0; i < count; i++) {
      const active = await this.page.evaluate(() => document.activeElement?.outerHTML || '');
      names.push(active);
      await this.page.keyboard.press('Tab');
    }
    return names;
  }
}

export default HomePage;
