import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/world';

Given(
  'user is on Dashboard page for alert deletion',
  async function (this: CustomWorld) {

    await this.login.goto();

    await this.login.loginAsAdmin();

    await this.dashboard.verifyDashboardPage();
  }
);

When('user navigates to Alerts page', async function (this: CustomWorld) {
    await this.alert.navigateToAlertsPage();
});

When(
  'user deletes all existing alerts',
  { timeout: 180000 },
  async function (this: CustomWorld) {
    await this.alert.deleteAllAlerts();
  }
);
Then('no alerts should be displayed', async function (this: CustomWorld) {
    await this.alert.verifyNoAlertsPresent();
});