import { Given } from '@cucumber/cucumber';
import { CustomWorld } from '../../support/world';

Given('I open the application', async function (this: CustomWorld) {
  await this.login.goto();
  await this.login.loginAsAdmin();

  await this.page.waitForTimeout(10000);
});