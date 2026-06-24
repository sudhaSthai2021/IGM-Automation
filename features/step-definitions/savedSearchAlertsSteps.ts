import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../../support/world';

Given(
  'user is on Dashboard page for Search Alert',
  async function (this: CustomWorld) {
    await this.login.goto();
    await this.login.loginAsAdmin();
    await this.dashboard.verifyDashboardPage();
  }
);

When('user navigates to Search page', async function (this: CustomWorld) {
  await this.search.openSearchPage();
});

When(
  'user opens the first story result from Search',
  async function (this: CustomWorld) {
    await this.search.openFirstStoryOnly();
  }
);

When(
  'user adds the story to Dashboard with a generated title',
  async function (this: CustomWorld) {
    const result = await this.search.addStoryToDashboard();

    this.searchStoryTitle = result.title;
    this.searchStoryDestinations = result.destinations;
  }
);

Then(
  'story tile should be visible on Dashboard',
  async function (this: CustomWorld) {
    await this.search.verifyStoryTileOnDashboard(this.searchStoryTitle);
  }
);

When(
  'user creates {string} alert for the story tile from Dashboard',
  async function (this: CustomWorld, alertType: string) {
    const expectedData =
      await this.search.createAlertFromDashboardTile(
        `Story - ${this.searchStoryTitle}`,
        alertType,
        this.searchStoryDestinations
      );

    if (alertType.toLowerCase() === 'instant') {
      this.searchStoryInstantExpectedData = expectedData;
    } else {
      this.searchStoryDigestExpectedData = expectedData;
    }
  }
);

Then(
  'email alerts should contain alert with story destinations',
  async function (this: CustomWorld) {
    await this.dashboard.openEmailAlerts();

    await this.dashboard.verifyAlertContainsDestinations(
      this.searchStoryInstantExpectedData
    );

    await this.dashboard.verifyAlertContainsDestinations(
      this.searchStoryDigestExpectedData
    );
  }
);

Then(
  'user deletes alert with story destinations',
  async function (this: CustomWorld) {
    await this.search.deleteAlertsFromEmailAlerts(this.searchStoryDestinations);
  }
);


When(
  'user captures a random word from any story result title',
  async function (this: CustomWorld) {
    this.savedSearchName =
      await this.search.captureRandomWordFromAnyStoryTitle();
  }
);

When(
  'user searches using the captured word',
  async function (this: CustomWorld) {
    await this.search.searchByKeyword(this.savedSearchName);
  }
);

When(
  'user saves the search using the captured word',
  async function (this: CustomWorld) {
    await this.search.saveSearch();
  }
);

Then(
  'saved search should be available in Saved Searches dropdown',
  async function (this: CustomWorld) {
    await this.search.verifySavedSearchExists(this.savedSearchName);
  }
);

When(
  'user creates {string} alert for the saved search',
  async function (this: CustomWorld, alertType: string) {
    const expectedData =
      await this.search.createAlertFromSavedSearch(
        this.savedSearchName,
        alertType
      );

    console.log(
      'Expected data:',
      JSON.stringify(expectedData, null, 2)
    );

    if (alertType.toLowerCase() === 'instant') {
      this.savedSearchInstantExpectedData = expectedData;
    } else {
      this.savedSearchDigestExpectedData = expectedData;
    }
  }
);

When(
  'user adds the saved search to Dashboard',
  async function (this: CustomWorld) {
    await this.search.addSavedSearchToDashboard(this.savedSearchName);
  }
);

Then(
  'saved search tile should be visible on Dashboard',
  async function (this: CustomWorld) {
    await this.search.verifySavedSearchTileOnDashboard(this.savedSearchName);
  }
);

When(
  'user creates {string} alert for the saved search dashboard tile',
  async function (this: CustomWorld, alertType: string) {
    const expectedData =
      await this.search.createAlertFromDashboardTile(
        this.savedSearchName,
        alertType,
        [this.savedSearchName]
      );

    console.log(
      'Expected data:',
      JSON.stringify(expectedData, null, 2)
    );

    if (alertType.toLowerCase() === 'instant') {
      this.savedSearchDashboardInstantExpectedData = expectedData;
    } else {
      this.savedSearchDashboardDigestExpectedData = expectedData;
    }
  }
);

Then(
  'email alerts should contain alert with captured search name',
  async function (this: CustomWorld) {
    await this.dashboard.openEmailAlerts();

    // Saved Search alert - Digest overwrites Instant
    await this.dashboard.verifyAlertContainsDestinations(
      this.savedSearchDigestExpectedData
    );

    // Dashboard tile alert - Digest overwrites Instant
    await this.dashboard.verifyAlertContainsDestinations(
      this.savedSearchDashboardDigestExpectedData
    );
  }
);


Then(
  'user deletes alert with captured search name',
  async function (this: CustomWorld) {
    await this.search.deleteAlertsFromEmailAlerts([this.savedSearchName]);
  }
);
