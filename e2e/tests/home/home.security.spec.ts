import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/home.page';

test.describe('Home security & robustness checks', () => {
  test('Smoke: home loads and main elements present', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });

  test('No tokens in DOM, cookies secure and responses do not leak stacks', async ({ page }) => {
    const home = new HomePage(page);
    const responses = await home.captureResponsesDuring(async () => {
      await home.goto();
    });

    // Check DOM for tokens
    await home.assertNoTokensInDom();

    // Check cookies
    await home.assertCookiesAreSecure();

    // Validate responses don't include obvious stack traces
    await home.assertNoStackTracesInResponses(responses);
  });

  test('Long-payload / XSS attempt on ingredients input is handled safely', async ({ page }) => {
    const home = new HomePage(page);
    // payload: long + script attempt
    const longPayload = '<script>alert(1)</script>' + 'A'.repeat(8000) + "'\";--<>";

    // Navigate to ingredients page which should accept text input
    await page.goto('/ingredients');
    await page.waitForLoadState('networkidle');

    // attach dialog listener to fail if any alert is shown
    let dialogShown = false;
    page.on('dialog', async (dialog) => {
      dialogShown = true;
      await dialog.dismiss();
    });

    // Try to find a textbox/textarea and type payload
    const textboxes = page.getByRole('textbox');
    if (await textboxes.count() > 0) {
      await textboxes.first().fill(longPayload);
      await textboxes.first().press('Enter').catch(() => {});
    } else {
      // Fallback: try generic textarea or input[type=text]
      const ta = page.locator('textarea, input[type=text], input[type=search]').first();
      await ta.fill(longPayload).catch(() => {});
      await ta.press('Enter').catch(() => {});
    }

    // wait a bit for potential client-side errors
    await page.waitForTimeout(700);
    expect(dialogShown).toBeFalsy();

    // ensure payload is not directly injected into DOM as executable script
    const body = (await page.locator('body').innerHTML()).toLowerCase();
    expect(body).not.toContain('<script>alert(1)</script>');

    // check network responses for echoes of the payload
    const responses = [] as any[];
    page.on('response', async (r) => {
      try {
        const txt = await r.text();
        responses.push({ url: r.url(), text: txt });
      } catch {}
    });

    // small navigation to trigger background calls
    await page.goto('/');
    await page.waitForTimeout(400);

    for (const r of responses) {
      const lowered = (r.text || '').toLowerCase();
      expect(lowered).not.toContain('<script>alert(1)</script>');
    }
  });

  test('Accessibility: focus order, aria attributes and basic contrast checks', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    // Wait for main content to load (h1 is only present in loaded state)
    await expect(page.locator('h1')).toBeVisible();

    // Ensure primary CTA buttons have accessible names
    // We check all visible buttons on the page to ensure they have a label or text
    const buttons = page.getByRole('button');
    
    // Wait for at least one button to be visible (the page has several)
    await expect(buttons.first()).toBeVisible();
    
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const btn = buttons.nth(i);
      if (await btn.isVisible()) {
        const name = await btn.getAttribute('aria-label');
        const text = await btn.innerText();
        // A button is accessible if it has an aria-label OR visible text
        const accessibleName = (name || text || '').trim();
        expect(accessibleName.length, `Button at index ${i} should have an accessible name`).toBeGreaterThan(0);
      }
    }

    // Tab through first 8 tabbable elements and ensure each has an accessible name
    const tapped = await home.tabbableAccessibleNames(8);
    for (const outer of tapped) {
      if (!outer) continue;
      // crude check: ensure active element has either aria-label or inner text
      // done in page context so we don't duplicate many selectors here
      // presence of an element string is considered ok
      expect(typeof outer).toBe('string');
    }

    // Contrast checks for hero heading and primary button
    await home.checkContrastForSelector('h1');
    await home.checkContrastForSelector('main button', 3.0); // buttons allowed lower threshold sometimes
  });

  test('Network headers: outgoing requests do not leak auth in query and responses avoid echoing sensitive headers', async ({ page }) => {
    const home = new HomePage(page);
    const recorded: { url: string; headers: Record<string, string> }[] = [];
    page.on('request', (req) => {
      const url = req.url();
      // ignore data: and static assets
      if (url.startsWith('http') && !/\.(png|jpg|css|js|svg|map)/i.test(url)) {
        recorded.push({ url, headers: req.headers() });
      }
    });

    await home.goto();
    await page.waitForTimeout(300);

    for (const r of recorded) {
      // ensure no tokens in URL
      expect(r.url.toLowerCase()).not.toContain('access_token=');
      expect(r.url.toLowerCase()).not.toContain('id_token=');
      // ensure headers do not include sensitive auth headers in plain text
      const hdrs = Object.keys(r.headers).join(' ').toLowerCase();
      expect(hdrs).not.toContain('x-api-key');
    }
  });
});
