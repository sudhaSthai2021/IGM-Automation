import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../../support/world';

Given('user is on Dashboard page for Story Editor', async function (this: CustomWorld) {
  await this.login.goto();
  await this.login.loginAsAdmin();

  await this.dashboard.waitForPageLoad();
  await this.dashboard.verifyDashboardPage();
});

When('user navigates to Author page and selects English', async function (this: CustomWorld) {
  await this.storyEditor.navigateToAuthorEnglishPage();
});

When('user clicks Create Bond Issue', async function (this: CustomWorld) {
  await this.storyEditor.clickCreateBondIssue();
});

When('user enters headline and body content', async function (this: CustomWorld) {
  await this.storyEditor.enterHeadlineAndBody();
});

Then(
  'user verifies all Rich Text Editor controls are available and functional',
  { timeout: 180000 }, // 3 minutes
  async function (this: CustomWorld) {
    await this.storyEditor.verifyAllRichTextEditorControls();
  }
);

When('user clicks Create', async function (this: CustomWorld) {
  await this.storyEditor.clickCreate();
});

Then('Story Editor page should be displayed', async function (this: CustomWorld) {
  await this.storyEditor.verifyStoryEditorPage();
});

When(
  'user selects destinations:',
  async function (this: CustomWorld, dataTable) {

    const destinations =
      dataTable.raw().flat();

    this.selectedDestinations = destinations;

    await this.storyEditor.selectDestinations(destinations);
  }
);


When(
  'user verifies all Rich Text Editor controls are available and editable',
  async function (this: CustomWorld) {
    await this.storyEditor.verifyRichTextToolbarControlsAreAvailableAndEditable();
  }
);

When('user enables Resend Alerts', async function (this: CustomWorld) {
  await this.storyEditor.enableResendAlerts();
});

When('user clicks Publish', async function (this: CustomWorld) {
  await this.storyEditor.clickPublish();
});

Then('story should be published successfully', async function (this: CustomWorld) {
  await this.storyEditor.verifyPublishSuccess();
});

