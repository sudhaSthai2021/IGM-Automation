

import { expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { AlertExpectedData } from '../support/world';

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async verifyDashboardPage(): Promise<void> {

    await expect(this.page).toHaveURL(/\/my-igm$/, {
      timeout: 30000
    });

    const loadingText = this.page.getByText('Loading...');

    if (await loadingText.isVisible().catch(() => false)) {
      console.log('Loading screen detected');
      await loadingText.waitFor({
        state: 'hidden',
        timeout: 60000
      });
    }

    await expect(
      this.page.getByRole('heading', { name: /^Dashboard$/ })
    ).toBeVisible({
      timeout: 60000
    });
    console.log('✅ Dashboard page verified');
  }


  private getFeedTile(feedName: string) {
    return this.page.getByText(feedName, { exact: false });
  }

  private getWidget(feedName: string) {
    return this.page
      .getByText(feedName, { exact: true })
      .locator(
        'xpath=ancestor::div[contains(@data-testid,"dashboard-widget")]'
      );
  }
  async getFeedDestinations(feedName: string): Promise<string[]> {
    await this.waitForPageLoad();

    const feedTile = this.getFeedTile(feedName);
    await expect(feedTile).toBeVisible({ timeout: 15000 });

    await feedTile.getByText(feedName, { exact: true }).click();

    await expect(
      this.page.getByRole('heading', { name: /Edit Feed/i })
    ).toBeVisible({ timeout: 15000 });

    const chips = this.page.locator('.MuiChip-label');

    await expect(chips.first()).toBeVisible({ timeout: 15000 });

    const destinations = [
      ...new Set(
        (await chips.allInnerTexts())
          .map(text => text.trim())
          .filter(Boolean)
      )
    ];

    console.log('--- Captured feed destinations:', destinations);

    const backButton = this.page.getByTestId('navigation-back-button');


    await backButton.click();


    await expect(
      this.page.getByRole('heading', { name: /^Dashboard$/ })
    ).toBeVisible({ timeout: 15000 });

    return destinations;
  }

  async getFirstAvailableFeedDestinations(): Promise<{
  feedName: string;
  destinations: string[];
}> {
  await this.waitForPageLoad();

  const widgets = this.page.locator('[data-testid*="dashboard-widget"]');
  await expect(widgets.first()).toBeVisible({ timeout: 15000 });

  const widgetCount = await widgets.count();
  console.log(`Dashboard widgets found: ${widgetCount}`);

  for (let i = 0; i < widgetCount; i++) {
    const widget = widgets.nth(i);
    const widgetText = await widget.innerText();

    const feedName = widgetText
      .split('\n')
      .map(line => line.trim())
      .find(Boolean);

    if (!feedName) {
      continue;
    }

    console.log(`Selected feed: ${feedName}`);

    return {
      feedName,
      destinations: await this.getFeedDestinations(feedName)
    };
  }

  throw new Error('No available feed found on dashboard.');
}
/*
  async getFirstAvailableFeedDestinations(): Promise<{
    feedName: string;
    destinations: string[];
  }> {
    await this.waitForPageLoad();

    const widgets = this.page.locator('[data-testid*="dashboard-widget"]');

    await expect(widgets.first()).toBeVisible({ timeout: 15000 });

    const widgetCount = await widgets.count();

    console.log(`--- Dashboard widgets found: ${widgetCount}`);

    for (let i = 0; i < widgetCount; i++) {
      const widget = widgets.nth(i);
      const widgetText = await widget.innerText();

      console.log(`--- Widget ${i} text ---`);
      console.log(widgetText);

      const lines = widgetText
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);

      const feedName = lines[0];

      if (feedName) {
        console.log(`--- Selected feed dynamically: ${feedName}`);

        const destinations = await this.getFeedDestinations(feedName);

        return {
          feedName,
          destinations
        };
      }
    }

    throw new Error('❌ No available feed found on dashboard');
  }
    */
  async createAlert(
    feedName: string,
    alertType: string,
    destinations: string[]
  ): Promise<AlertExpectedData> {
    await this.waitForPageLoad();

    const widget = this.getWidget(feedName);

    await expect(widget).toBeVisible({ timeout: 15000 });

    const bellIcon = widget.getByTestId(
      'feed-widget-create-alert'
    );

    await expect(bellIcon).toBeVisible({
      timeout: 10000
    });

    await bellIcon.click();

    await expect(
      this.page.getByText('Add Alert', { exact: true })
    ).toBeVisible({ timeout: 15000 });

    if (alertType.toLowerCase() === 'digest') {
      await this.page
        .getByRole('button', { name: /^Digest$/i })
        .click();

      const digestRow = this.page.locator(
        '[data-testid="alert-time-range-0"]'
      );

      const sendAtToggle = digestRow.locator(
        'input[type="checkbox"]'
      );

      await expect(digestRow).toBeVisible({
        timeout: 10000
      });

      if (!(await sendAtToggle.isChecked())) {
        await digestRow.click();
      }

      await expect(sendAtToggle).toBeChecked({
        timeout: 10000
      });
    } else {
      await this.page
        .getByRole('button', { name: /^Instant$/i })
        .click();
    }

    await this.page
      .getByRole('button', { name: /^Save$/i })
      .click();

    await expect(
      this.page.getByText('Add Alert', { exact: true })
    ).toBeHidden({ timeout: 15000 });

    console.log(
      `✅ ${alertType} alert created for feed: ${feedName}`
    );

    const timeZone = 'Etc/UTC';

    const emailRange =
      alertType.toLowerCase() === 'instant'
        ? 'All Day'
        : '05:00 - 12:00';

    console.log('Expected alert data:', {
      destinations,
      alertType,
      timeZone,
      emailRange
    });

    return {
      destinations,
      alertType,
      timeZone,
      emailRange
    };
  }
  async openEmailAlerts(): Promise<void> {
    await this.page.goto('https://igm-stage.informagm-np.com/settings/alerts', {
      waitUntil: 'domcontentloaded'
    });

    await this.page.waitForLoadState('networkidle');

    await expect(
      this.page.getByText('Alert Settings', { exact: true })
    ).toBeVisible({ timeout: 15000 });

    console.log('✅ Email Alerts page opened');
  }

  async verifyAlertMatchesExpected(
    expectedData: AlertExpectedData
  ): Promise<boolean> {
    const rows = this.page.locator('table tbody tr');

    await expect(rows.first()).toBeVisible({ timeout: 15000 });

    const expectedDestinations = expectedData.destinations
      .map(d => d.trim().toUpperCase())
      .sort();

    const expectedType = expectedData.alertType.trim().toUpperCase();
    const expectedTimeZone = expectedData.timeZone.trim().toUpperCase();
    const expectedEmailRange = expectedData.emailRange.replace(/\s+/g, '');

    const rowCount = await rows.count();

    for (let i = 0; i < rowCount; i++) {
      const rowText = await rows.nth(i).innerText();

      const alertName = rowText
        .split('\n')[0]
        .replace(/^Alert for\s+/i, '')
        .trim()
        .toUpperCase();

      const actualDestinations = alertName
        .split(',')
        .map(d => d.trim().toUpperCase())
        .filter(Boolean)
        .sort();

      console.log('--------------------------------');
      console.log('Expected destinations:', expectedDestinations);
      console.log('Actual destinations:', actualDestinations);
      console.log('Alert name extracted:', alertName);
      console.log('--------------------------------');

      const actualRowText = rowText.toUpperCase();
      const actualRowTextNoSpaces = rowText.replace(/\s+/g, '');

      const destinationsMatch =
        actualDestinations.length === expectedDestinations.length &&
        actualDestinations.every(
          (value, index) => value === expectedDestinations[index]
        );

      const typeMatches = actualRowText.includes(expectedType);
      const timeZoneMatches = actualRowText.includes(expectedTimeZone);
      const emailRangeMatches =
        actualRowTextNoSpaces.includes(expectedEmailRange);

      console.log('Expected:', expectedData);
      console.log('Row text:', rowText);
      console.log('Destinations match:', destinationsMatch);
      console.log('Type match:', typeMatches);
      console.log('Time zone match:', timeZoneMatches);
      console.log('Email range match:', emailRangeMatches);

      if (
        destinationsMatch &&
        typeMatches &&
        timeZoneMatches &&
        emailRangeMatches
      ) {
        console.log('✅ Full alert match found:', rowText);
        return true;
      }
    }

    console.log('❌ No full alert match found');
    console.log('Expected:', expectedData);

    return false;
  }
  async verifyStoryExistsOnDashboard(storyTitle: string): Promise<void> {
    await this.page.goto('https://igm-stage.informagm-np.com/my-igm', {
      waitUntil: 'domcontentloaded'
    });

    await this.page.waitForLoadState('networkidle');

    await expect(
      this.page.getByRole('heading', { name: /^Dashboard$/ })
    ).toBeVisible({ timeout: 30000 });

    await expect(
      this.page.getByText(storyTitle, { exact: false })
    ).toBeVisible({ timeout: 30000 });

    console.log(`✅ Story found on Dashboard: ${storyTitle}`);
  }

  async createAlertForDashboardStory(
    storyTitle: string,
    alertType: string,
    destinations: string[]
  ): Promise<AlertExpectedData> {
    await this.verifyStoryExistsOnDashboard(storyTitle);

    const storyTile = this.page
      .getByText(storyTitle, { exact: false })
      .locator('xpath=ancestor::*[contains(@class,"MuiCard-root") or contains(@data-testid,"dashboard-widget")][1]');

    await expect(storyTile).toBeVisible({ timeout: 15000 });

    const bellIcon = storyTile
      .locator(
        'button:has(svg[data-testid*="Notifications"]), button[aria-label*="alert" i], [data-testid*="create-alert"]'
      )
      .first();

    await expect(bellIcon).toBeVisible({ timeout: 10000 });
    await bellIcon.click();

    await expect(
      this.page.getByText('Add Alert', { exact: true })
    ).toBeVisible({ timeout: 15000 });

    if (alertType.toLowerCase() === 'digest') {
      await this.page
        .getByRole('button', { name: /^Digest$/i })
        .click();

      const digestRow = this.page.locator(
        '[data-testid="alert-time-range-0"]'
      );

      const sendAtToggle = digestRow.locator(
        'input[type="checkbox"]'
      );

      await expect(digestRow).toBeVisible({ timeout: 10000 });

      if (!(await sendAtToggle.isChecked())) {
        await digestRow.click();
      }

      await expect(sendAtToggle).toBeChecked({ timeout: 10000 });
    } else {
      await this.page
        .getByRole('button', { name: /^Instant$/i })
        .click();
    }
    await this.removeCookieOverlay();
    await this.closeCookieBannerIfPresent();
    await this.page
      .getByRole('button', { name: /^Save$/i })
      .click();

    await expect(
      this.page.getByText('Add Alert', { exact: true })
    ).toBeHidden({ timeout: 15000 });

    const expectedData: AlertExpectedData = {
      destinations: destinations.map(value => value.toUpperCase()),
      alertType,
      timeZone: 'Etc/UTC',
      emailRange:
        alertType.toLowerCase() === 'instant'
          ? 'All Day'
          : '05:00 - 12:00'
    };

    console.log(`✅ ${alertType} alert created from Dashboard story`);
    console.log('Expected dashboard story alert data:', expectedData);

    return expectedData;
  }
  async verifyAlertContainsDestinations(
    expectedData: AlertExpectedData
  ): Promise<void> {
    const isMatch = await this.verifyAlertMatchesExpected(expectedData);

    expect(isMatch).toBeTruthy();
  }

  async removeCookieOverlay(): Promise<void> {
    await this.page.evaluate(() => {
      globalThis.document
        .querySelector('#transcend-consent-manager')
        ?.remove();

      globalThis.document
        .querySelectorAll('[airgap-id]')
        .forEach(element => element.remove());
    });
  }
}
