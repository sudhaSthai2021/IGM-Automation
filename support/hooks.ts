import { BeforeAll, Before, After, AfterAll, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, Browser } from 'playwright';
import { CustomWorld } from './world';

import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { StoryEditorPage } from '../pages/StoryEditorPage';
import { AlertsPage } from '../pages/AlertsPage';
import { DiscoverPage } from '../pages/DiscoverPage';
import { SearchPage } from '../pages/SearchPage';

setDefaultTimeout(60 * 1000);

let browser: Browser;

BeforeAll(async function () {
  browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });
});

Before(async function (this: CustomWorld) {
  this.browser = browser;

  this.context = await browser.newContext();

  this.page = await this.context.newPage();

  this.login = new LoginPage(this.page);
  this.dashboard = new DashboardPage(this.page);
  this.storyEditor = new StoryEditorPage(this.page);
  this.alert = new AlertsPage(this.page);
  this.discover = new DiscoverPage(this.page);
  this.search = new SearchPage(this.page);
});

After(async function (this: CustomWorld) {
  await this.page.close();
  await this.context.close();
});

AfterAll(async function () {
  await browser.close();
});