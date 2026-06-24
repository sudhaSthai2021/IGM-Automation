import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../../support/world';

Given(
  'user is on Dashboard page for Discover Alert',
  async function (this: CustomWorld) {
    await this.login.goto();
    await this.login.loginAsAdmin();
    await this.dashboard.verifyDashboardPage();
  }
);

When(
  'user navigates to Discover page',
  async function (this: CustomWorld) {
    await this.discover.openDiscoverPage();
  }
);

When(
  'user selects Discover filters',
  async function (this: CustomWorld, dataTable) {
    const filters = dataTable.raw().flat();

    await this.discover.selectDiscoverFilters({
      language: filters[0],
      contentType: filters[1],
      geography: filters[2],
      assetClass: filters[3]
    });
  }
);

When(
  'user captures Discover tile destinations from Add To Dashboard modal',
  async function (this: CustomWorld) {
    const tileData =
      await this.discover.captureTileDestinationsFromAddToDashboardModal();

    this.selectedDiscoverTileTitle = tileData.tileTitle;
    this.discoverStoryDestinations = tileData.destinations;
  }
);

When(
  'user creates Instant and Digest alerts from Discover tile',
  async function (this: CustomWorld) {

    this.discoverInstantAlertExpectedData =
      await this.discover.createAlertFromDiscoverTile(
        'Instant',
        this.discoverStoryDestinations,
        this.selectedDiscoverTileTitle
      );

    this.discoverDigestAlertExpectedData =
      await this.discover.createAlertFromDiscoverTile(
        'Digest',
        this.discoverStoryDestinations,
        this.selectedDiscoverTileTitle
      );
  }
);

Then(
  'Discover Instant and Digest alerts should be available in Email Alerts',
  async function (this: CustomWorld) {
    await this.dashboard.openEmailAlerts();

    await this.dashboard.verifyAlertContainsDestinations(
      this.discoverInstantAlertExpectedData
    );

    await this.dashboard.verifyAlertContainsDestinations(
      this.discoverDigestAlertExpectedData
    );
  }
);

When(
  'user navigates back to Discover page',
  async function (this: CustomWorld) {
    await this.discover.openDiscoverPage();

    await this.discover.selectDiscoverFilters({
      language: 'English',
      contentType: 'Credit',
      geography: 'Europe',
      assetClass: 'Investment Grade'
    });
  }
);

When(
  'user adds Discover tile to Dashboard with title',
  async function (this: CustomWorld) {
    const modalData =
      await this.discover.addDiscoverTileToDashboardWithTitle(
        this.selectedDiscoverTileTitle
      );

    this.discoverStoryTitle = modalData.title;
  }
);

Then(
  'Discover story should appear on Dashboard',
  async function (this: CustomWorld) {
    await this.dashboard.verifyStoryExistsOnDashboard(
      this.discoverStoryTitle
    );
  }
);


When(
  'user creates Instant and Digest alerts for the same story from Dashboard',
  async function (this: CustomWorld) {
    this.dashboardInstantAlertExpectedData =
      await this.dashboard.createAlertForDashboardStory(
        this.discoverStoryTitle,
        'Instant',
        this.discoverStoryDestinations
      );

    this.dashboardDigestAlertExpectedData =
      await this.dashboard.createAlertForDashboardStory(
        this.discoverStoryTitle,
        'Digest',
        this.discoverStoryDestinations
      );
  }
);

Then(
  'Dashboard Instant and Digest alerts should be available in Email Alerts',
  async function (this: CustomWorld) {
    await this.dashboard.openEmailAlerts();

    await this.dashboard.verifyAlertContainsDestinations(
      this.dashboardInstantAlertExpectedData
    );

    await this.dashboard.verifyAlertContainsDestinations(
      this.dashboardDigestAlertExpectedData
    );
  }
);