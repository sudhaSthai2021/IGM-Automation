import { Page, expect, Locator } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) { }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async wait(seconds: number): Promise<void> {
    await this.page.waitForTimeout(seconds * 1000);
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  async verifyUrlContains(text: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(text));
  }

  async verifyUrlEndsWith(text: string): Promise<void> {
    await expect(this.page).toHaveURL(
      new RegExp(`${text.replace('/', '\\/')}$`)
    );
  }

  async verifyElementVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
  }

  async closeCookieBannerIfPresent(): Promise<void> {
  try {
    await this.page.evaluate(() => {
      globalThis.document
        .querySelector('#transcend-consent-manager')
        ?.remove();

      globalThis.document
        .querySelectorAll('[airgap-id]')
        .forEach(element => element.remove());
    });

    console.log('✅ Cookie banner removed');
  } catch {
    // no banner
  }
}
}