import { expect, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { config } from '../test-data/config';
import { USERS } from '../test-data/users';

export class LoginPage extends BasePage {

  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: any) {
    super(page);

    this.emailInput =
      page.getByPlaceholder('Enter Email');

    this.passwordInput =
      page.locator('input[type="password"]');

    this.loginButton =
      page.getByRole('button', {
        name: /^login$/i,
      });
  }

  async goto(): Promise<void> {
    await this.page.goto(config.baseUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await this.acceptCookies();

    // Give React login page time to render after cookie banner closes
    await this.page.waitForTimeout(3000);
  }

  async acceptCookies(): Promise<void> {
  try {
    await this.page.waitForTimeout(3000);

    await this.page.evaluate(() => {
      const consentManager =
        globalThis.document.querySelector('#transcend-consent-manager');

      if (consentManager) {
        consentManager.remove();
      }

      const airgapElements =
        globalThis.document.querySelectorAll('[airgap-id]');

      airgapElements.forEach(element => element.remove());
    });

    await this.page.waitForTimeout(1000);

    console.log('--- Cookie banner removed');

  } catch (error) {
    console.log('--- Cookie banner not found');
  }
}
  /*
  
    async acceptCookies(): Promise<void> {
      try {
        await this.page.waitForTimeout(3000);
  
        const acceptAllButton = this.page.getByText('Accept all', {
          exact: true
        });
  
        if (await acceptAllButton.isVisible({ timeout: 5000 })) {
          await acceptAllButton.click({ force: true });
  
          console.log('--- Cookie accepted by text');
          return;
        }
  
        await this.page.mouse.click(684, 634);
  
        console.log('--- Cookie accepted by coordinates');
  
      } catch (error) {
        console.log('--- Cookie banner not found');
      }
  
      await this.page.waitForTimeout(2000);
    }
      */

  async login(
    username: string,
    password: string
  ): Promise<void> {

    console.log('Current URL before login:', this.page.url());
    console.log('Page title before login:', await this.page.title());

    await expect(this.emailInput).toBeVisible({ timeout: 60000 });

    await this.emailInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
  async loginAsAdmin(): Promise<void> {

    await this.login(
      USERS.admin.username,
      USERS.admin.password
    );

    await this.page.waitForURL(/\/my-igm$/, {
      timeout: 60000
    });

    await expect(
      this.page.getByRole('heading', { name: /^Dashboard$/ })
    ).toBeVisible({
      timeout: 60000
    });
  }
}