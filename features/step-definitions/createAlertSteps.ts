import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/world';

Given('user is on Dashboard page', async function (this: CustomWorld) {
  //await this.page.goto('about:blank');

  await this.login.goto();
  await this.login.loginAsAdmin();

  console.log('Current URL:', this.page.url());

  await this.dashboard.waitForPageLoad();
  await this.dashboard.verifyDashboardPage();
});

When(
  'user captures destinations for any available feed',
  async function (this: CustomWorld) {

    const result =
      await this.dashboard.getFirstAvailableFeedDestinations();

    this.feedName = result.feedName;
    this.feedDestinations = result.destinations;

    console.log(
      `--- Capturing destinations for feed: ${this.feedName}`
    );

    console.log(
      '--- Captured feed destinations:',
      this.feedDestinations
    );

    expect(this.feedDestinations.length).toBeGreaterThan(0);
  }
);

When(
  'user creates an {string} alert for the same feed',
  async function (
    this: CustomWorld,
    alertType: string
  ) {


    console.log(
      `--- Creating ${alertType} alert for feed: ${this.feedName}`
    );

    this.alertExpectedData =
      await this.dashboard.createAlert(
        this.feedName,
        alertType,
        this.feedDestinations
      );
  }
);


Then(
  'alert destinations should match the feed destinations',
  async function (this: CustomWorld) {

    await this.dashboard.openEmailAlerts();

    const alertFound =
      await this.dashboard.verifyAlertMatchesExpected(
        this.alertExpectedData
      );

    expect(alertFound).toBeTruthy();
  }
);