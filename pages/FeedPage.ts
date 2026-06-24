import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

interface FeedDestinations {
  contentType: string;
  product: string;
  assetClass: string;
  assetType?: string;
  geography?: string;
  countryRegion?: string;
}

export class FeedPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private nameInput = this.page.locator('input[name="name"], input').first();
  private createButton = this.page.getByRole('button', {
  name: /^Create$/i
});
  private createFeedButton = this.page.getByTestId('dashboard-header-new-feed-button');

  private contentTypeInput = this.page.locator('#allContentType');
  private productInput = this.page.locator('#allProduct');
  private assetClassInput = this.page.locator('#allAssetClass');
  private geographyInput = this.page.locator('#allGeography');

  async navigateToCreateFeed(): Promise<void> {
    await this.createFeedButton.click();

    await expect(this.page.getByText('General', { exact: true }))
      .toBeVisible({ timeout: 15000 });

    await expect(this.nameInput).toBeVisible({ timeout: 15000 });

    console.log('✅ Create Feed page opened');
  }

  async createFeed(destinations: FeedDestinations): Promise<string> {
    const selectedValues = [
      destinations.contentType,
      destinations.product,
      destinations.assetClass,
      destinations.geography
    ].filter(Boolean);

    const feedName = `Test Feed ${selectedValues.join(' ')} ${Date.now()}`;

    await this.nameInput.fill(feedName);

    await this.selectAutocomplete(this.contentTypeInput, destinations.contentType);
    await this.selectAutocomplete(this.productInput, destinations.product);
    await this.selectAutocomplete(this.assetClassInput, destinations.assetClass);

    if (destinations.geography) {
      await this.selectAutocomplete(this.geographyInput, destinations.geography);
    }

    await expect(this.createButton).toBeVisible({ timeout: 10000 });
await expect(this.createButton).toBeEnabled({ timeout: 10000 });

await this.createButton.click();

console.log('✅ Feed created');

    return feedName;
  }

  private async selectAutocomplete(input: Locator, value: string): Promise<void> {
    await input.click();
    await input.fill(value);

    await this.page.waitForTimeout(500);

    await this.page
      .getByText(value, { exact: true })
      .last()
      .click();

    console.log(`✅ Selected ${value}`);
  }

  async verifyFeedVisibleOnDashboard(feedName: string): Promise<void> {
    await expect(this.page).toHaveURL(/\/my-igm/);

    await expect(this.page.getByText(feedName, { exact: false }))
      .toBeVisible({ timeout: 20000 });

    console.log(`✅ Created feed is visible on dashboard: ${feedName}`);
  }
}