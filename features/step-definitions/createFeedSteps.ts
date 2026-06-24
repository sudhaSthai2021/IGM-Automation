import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { CustomWorld } from '../../support/world';
import { expect } from '@playwright/test';
import { FeedPage } from '../../pages/FeedPage';
import { DashboardPage } from '../../pages/DashboardPage';

Given('user is on Dashboard page for Feed', async function (this: CustomWorld) {
  await this.login.goto();
  await this.login.loginAsAdmin();

  this.dashboard = new DashboardPage(this.page);
  await this.dashboard.verifyDashboardPage();
});

When('user navigates to Create Feed page', async function (this: CustomWorld) {
  this.feed = new FeedPage(this.page);
  await this.feed.navigateToCreateFeed();
});
When(
  'user creates a feed with destinations:',
  async function (this: CustomWorld, dataTable: DataTable) {

    const destinations = Object.fromEntries(
      dataTable.raw()
    ) as Record<string, string>;

    const feedName = await this.feed.createFeed({
      contentType: destinations['Content Type'],
      product: destinations['Product'],
      assetClass: destinations['Asset Class'],
      assetType: destinations['Asset Type'],
      geography: destinations['Geography'],
      countryRegion: destinations['Country/Region']
    });

    this.feedName = feedName;

    this.selectedDestinations = Object.values(destinations).filter(Boolean);
  }
);

Then('feed should be saved successfully', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/\/my-igm/);
});

Then('created feed should be visible on Dashboard', async function (this: CustomWorld) {
  await this.feed.verifyFeedVisibleOnDashboard(this.feedName);
});