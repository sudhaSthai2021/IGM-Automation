import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { AlertExpectedData } from '../support/world';

export class SearchPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    private searchLink = this.page.getByText('Search', { exact: true });

    private searchInput = this.page.getByRole('textbox').first();

    private resultRows = this.page.locator('tbody tr');

    private dashboardLink = this.page.getByText('Dashboard', { exact: true });

    private emailAlertsLink = this.page.getByRole('link', { name: 'Email Alerts' });

    async openSearchPage(): Promise<void> {
        await this.closeCookieBannerIfPresent();

        await this.searchLink.click();

        await expect(
            this.page.getByRole('heading', { name: /^Search$/i })
        ).toBeVisible({ timeout: 15000 });

        await expect(this.resultRows.first()).toBeVisible({ timeout: 20000 });

        console.log('✅ Search page opened');
    }

    async openFirstStoryOnly(): Promise<void> {
        const count = await this.resultRows.count();

        for (let i = 0; i < count; i++) {

            const row = this.resultRows.nth(i);

            const searchUrl = this.page.url();

            await row.click();

            await this.page.waitForTimeout(2000);

            const currentUrl = this.page.url();

            console.log(`Row ${i + 1}`);
            console.log('Before URL:', searchUrl);
            console.log('After URL :', currentUrl);

            // Row click didn't navigate
            if (currentUrl === searchUrl) {
                console.log('⚠️ Row did not open');
                continue;
            }

            // Story page detected
            if (currentUrl.includes('/search/stories/')) {
                console.log('✅ Story result opened');
                return;
            }

            console.log('⚠️ Not a story, going back');

            await this.page.goBack();

            await expect(
                this.page.getByRole('heading', { name: /^Search$/i })
            ).toBeVisible({ timeout: 15000 });
        }

        throw new Error('❌ No Story result found in Search results');
    }


    async addStoryToDashboard(): Promise<{
        title: string;
        destinations: string[];
    }> {
        const title = `Search Story ${Date.now()}`;

        await this.page
            .getByRole('button', { name: /Add To Dashboard/i })
            .click();

        const modal = this.page.getByRole('dialog');
        await expect(modal).toBeVisible({ timeout: 10000 });

        console.log('===== ADD TO DASHBOARD MODAL =====');
        console.log(await modal.innerHTML());

        const destinations = await this.captureDestinationsFromModal(modal);

        await modal.locator('input').first().fill(title);

        await modal.getByRole('button', { name: /^Save$/i }).click();

        await expect(modal).toBeHidden({ timeout: 15000 });

        console.log(`✅ Story added to Dashboard with title: ${title}`);
        console.log('✅ Story destinations captured:', destinations);

        return { title, destinations };
    }

    async verifyStoryTileOnDashboard(title: string): Promise<void> {
        await this.dashboardLink.click();

        await this.page.waitForLoadState('networkidle');

        console.log('===== DASHBOARD HTML =====');
        console.log(
            await this.page.locator('body').innerText()
        );

        const storyText = this.page.getByText(
            `Story - ${title}`,
            { exact: false }
        );

        console.log(
            'Story count:',
            await storyText.count()
        );

        await expect(storyText.first()).toBeVisible({
            timeout: 20000
        });

        console.log(`✅ Story tile found on Dashboard: Story - ${title}`);
    }
    async captureWordFromFirstStoryTitle(): Promise<string> {
        const count = await this.resultRows.count();

        for (let i = 0; i < count; i++) {
            const rowText = await this.resultRows.nth(i).innerText();

            if (!rowText.trim()) continue;

            const words = rowText
                .replace(/[^a-zA-Z0-9 ]/g, ' ')
                .split(/\s+/)
                .filter(word => word.length > 3 && isNaN(Number(word)));

            if (words.length > 0) {
                const keyword = words[0];
                console.log(`✅ Captured search keyword: ${keyword}`);
                return keyword;
            }
        }

        throw new Error('❌ Could not capture keyword from Search results');
    }

    async searchByKeyword(keyword: string): Promise<void> {
        await this.searchInput.fill(keyword);
        await this.page.keyboard.press('Enter');

        await expect(this.resultRows.first()).toBeVisible({ timeout: 20000 });

        console.log(`✅ Search completed for keyword: ${keyword}`);
    }

    async saveSearch(): Promise<void> {
        await this.page.getByRole('button', { name: /Save as/i }).click();

        await this.page.waitForTimeout(1000);

        console.log('✅ Search saved');
    }

    async verifySavedSearchExists(savedSearchName: string): Promise<void> {
        await this.openSavedSearchesDropdown();

        const savedSearchOption = this.getSavedSearchItem(savedSearchName);

        await expect(savedSearchOption).toBeVisible({ timeout: 15000 });

        // Do NOT close the Saved Searches dropdown here
        // await this.page.keyboard.press('Escape');

        console.log(`✅ Saved search found: ${savedSearchName}`);
    }

    async createAlertFromSavedSearch(
        savedSearchName: string,
        alertType: string
    ): Promise<AlertExpectedData> {

        await this.openSavedSearchesDropdown();


        const savedSearchText = this.page
            .getByText(savedSearchName, { exact: true })
            .first();

        await expect(savedSearchText).toBeVisible({ timeout: 15000 });

        const savedSearchRow = savedSearchText.locator(
            'xpath=ancestor::div[contains(@class,"MuiBox-root") or contains(@class,"MuiStack-root") or contains(@class,"css-")][1]'
        );

        console.log('===== SAVED SEARCH ROW TEXT =====');
        console.log(await savedSearchRow.innerText());

        const buttons = savedSearchRow.locator('button');
        console.log(
            'Buttons in saved search row:',
            await buttons.count()
        );

        console.log('Buttons in saved search row:', await buttons.count());

        // UI order: + button, Add alert button, Delete button
        const alertButton = buttons.nth(1);

        await expect(alertButton).toBeVisible({ timeout: 10000 });

        await alertButton.click();

        await this.completeAlertModal(alertType);

        return {
            destinations: [savedSearchName.toUpperCase()],
            alertType,
            timeZone: 'Etc/UTC',
            emailRange:
                alertType.toLowerCase() === 'instant'
                    ? 'All Day'
                    : '05:00 - 12:00'
        };
    }
    async addSavedSearchToDashboard(
        savedSearchName: string
    ): Promise<void> {

        await this.openSavedSearchesDropdown();

        const savedSearchText = this.page
            .getByText(savedSearchName, { exact: true })
            .first();

        await expect(savedSearchText).toBeVisible({
            timeout: 15000
        });

        const savedSearchRow = savedSearchText.locator(
            'xpath=ancestor::div[contains(@class,"MuiPaper-root")][1]'
        );

        const buttons = savedSearchRow.locator('button');

        console.log(
            'Buttons in saved search row:',
            await buttons.count()
        );

        const addButton = buttons.nth(0);

        await expect(addButton).toBeVisible({
            timeout: 10000
        });

        await addButton.click();

        await this.page.keyboard.press('Escape');

        console.log(
            `✅ Saved search added to Dashboard: ${savedSearchName}`
        );
    }

    async verifySavedSearchTileOnDashboard(savedSearchName: string): Promise<void> {
        await this.dashboardLink.click();

        await this.page.waitForLoadState('networkidle');

        const savedSearchTiles = this.page
            .locator('[data-testid*="dashboard-widget"]')
            .filter({
                has: this.page.getByRole('link', {
                    name: savedSearchName,
                    exact: true
                })
            });

        const count = await savedSearchTiles.count();

        console.log(
            `Dashboard tiles found for saved search "${savedSearchName}": ${count}`
        );

        await expect(savedSearchTiles.first()).toBeVisible({
            timeout: 20000
        });

        console.log(`✅ Saved search tile found on Dashboard: ${savedSearchName}`);
    }
    async createAlertFromDashboardTile(
        tileTitle: string,
        alertType: string,
        destinations: string[]
    ): Promise<AlertExpectedData> {

        console.log(`Looking for dashboard tile: ${tileTitle}`);

        let tile: Locator;

        // Story tiles
        if (tileTitle.startsWith('Story -')) {

            tile = this.page
                .locator('[data-testid*="dashboard-widget"]')
                .filter({
                    hasText: new RegExp(
                        `^${this.escapeRegExp(tileTitle)}`,
                        'i'
                    )
                })
                .first();

        } else {

            // Saved Search tiles appear as "All - <saved search name>"
            tile = this.page
                .locator('[data-testid*="dashboard-widget"]')
                .filter({
                    hasText: new RegExp(
                        `^All\\s*-\\s*${this.escapeRegExp(tileTitle)}`,
                        'im'
                    )
                })
                .first();
        }

        await expect(tile).toBeVisible({ timeout: 20000 });

        console.log('===== TILE FOUND =====');

        const tileText = await tile.innerText();

        console.log(tileText);
        console.log('======================');

        const allButtons = tile.locator('button');

        console.log('Total buttons in tile:', await allButtons.count());

        for (let i = 0; i < await allButtons.count(); i++) {
            console.log(
                `Button ${i}:`,
                {
                    ariaLabel: await allButtons.nth(i).getAttribute('aria-label'),
                    testId: await allButtons.nth(i).getAttribute('data-testid'),
                    text: await allButtons.nth(i).textContent()
                }
            );
        }

        const alertButtons = tile.locator(
            'button[aria-label="Alert"], button[aria-label="Add alert"], button[data-testid*="create-alert"], button[data-testid*="alert"]'
        );

        console.log(
            'Matching alert buttons:',
            await alertButtons.count()
        );

        for (let i = 0; i < await alertButtons.count(); i++) {
            console.log(
                `Alert Button ${i}:`,
                {
                    ariaLabel: await alertButtons.nth(i).getAttribute('aria-label'),
                    testId: await alertButtons.nth(i).getAttribute('data-testid'),
                    text: await alertButtons.nth(i).textContent()
                }
            );
        }

        const alertButton = alertButtons.first();

        await expect(alertButton).toBeVisible({ timeout: 15000 });

        console.log('===== CLICKING ALERT BUTTON =====');
        console.log(
            'aria-label:',
            await alertButton.getAttribute('aria-label')
        );
        console.log(
            'data-testid:',
            await alertButton.getAttribute('data-testid')
        );
        console.log('=================================');

        await alertButton.click();

        await this.completeAlertModal(alertType);

        const expectedData: AlertExpectedData = {
            destinations: destinations.map(value => value.toUpperCase()),
            alertType,
            timeZone: 'Etc/UTC',
            emailRange:
                alertType.toLowerCase() === 'instant'
                    ? 'All Day'
                    : '05:00 - 12:00'
        };

        console.log(
            `✅ ${alertType} alert created for dashboard tile: ${tileTitle}`
        );
        console.log(
            'Expected dashboard alert data:',
            JSON.stringify(expectedData, null, 2)
        );

        return expectedData;
    }
    async verifyAlertInEmailAlerts(alertName: string): Promise<void> {
        await this.emailAlertsLink.click();

        await expect(
            this.page.getByText(alertName, { exact: false }).first()
        ).toBeVisible({ timeout: 20000 });

        console.log(`✅ Alert found in Email Alerts: ${alertName}`);
    }

    async deleteAlertsFromEmailAlerts(destinations: string[]): Promise<void> {
        await this.emailAlertsLink.click();

        const pattern = new RegExp(
            destinations.map(d => this.escapeRegExp(d)).join('|'),
            'i'
        );

        const matchingAlerts = this.page
            .locator('tr, div')
            .filter({ hasText: pattern });

        const count = await matchingAlerts.count();

        if (count === 0) {
            throw new Error(
                `❌ No alert found to delete for destinations: ${destinations.join(', ')}`
            );
        }

        for (let i = count - 1; i >= 0; i--) {
            const row = matchingAlerts.nth(i);

            const deleteButton = row
                .locator(
                    'button:has(svg[data-testid*="Delete"]), button[aria-label*="Delete"], button[title*="Delete"]'
                )
                .first();

            if (!(await deleteButton.isVisible().catch(() => false))) continue;

            await deleteButton.click();

            const confirmationModal = this.page.getByRole('dialog');

            await expect(confirmationModal).toBeVisible({ timeout: 10000 });

            await confirmationModal
                .getByRole('button', { name: /yes.*delete|delete|confirm/i })
                .click();

            await expect(confirmationModal).toBeHidden({ timeout: 10000 });

            await this.page.waitForTimeout(1000);
        }

        console.log(
            `✅ Alerts deleted for destinations: ${destinations.join(', ')}`
        );
    }
    async captureRandomWordFromAnyStoryTitle(): Promise<string> {

    // Wait for search results/network activity to finish
    await this.page.waitForLoadState('networkidle');

    // Ensure at least one result row is visible
    await expect(this.resultRows.first()).toBeVisible({ timeout: 20000 });

    // Ensure the first row has text content
    await expect(this.resultRows.first()).not.toHaveText('', {
        timeout: 10000
    });

    const count = await this.resultRows.count();

    console.log(`Result row count: ${count}`);

    const words: string[] = [];

    for (let i = 0; i < count; i++) {

        const rowText = (await this.resultRows.nth(i).innerText()).trim();

        console.log(`Row ${i + 1}: ${rowText}`);

        const rowWords = rowText
            .replace(/[^a-zA-Z0-9 ]/g, ' ')
            .split(/\s+/)
            .filter(word =>
                word.length > 3 &&
                isNaN(Number(word)) &&
                !/^\d{4}$/.test(word)
            );

        words.push(...rowWords);
    }

    console.log(`Total candidate words found: ${words.length}`);

    if (words.length === 0) {
        throw new Error('❌ Could not capture random word from story results');
    }

    const keyword = words[Math.floor(Math.random() * words.length)];

    console.log(`✅ Captured random search keyword: ${keyword}`);

    return keyword;
}
    private async openSavedSearchesDropdown(): Promise<void> {
        const savedSearchDropdown = this.page.getByRole('button', {
            name: /Saved Searches/i
        });

        await expect(savedSearchDropdown).toBeVisible({ timeout: 15000 });

        const savedSearchItemsVisible = await this.page
            .locator('button[aria-label="Add alert"], button[aria-label="Add to dashboard"]')
            .first()
            .isVisible()
            .catch(() => false);

        if (!savedSearchItemsVisible) {
            await savedSearchDropdown.click();
            await this.page.waitForTimeout(1000);
        }

        console.log('===== SAVED SEARCHES DROPDOWN =====');
        console.log(await this.page.locator('body').innerText());
    }

    private getSavedSearchItem(savedSearchName: string) {
        return this.page
            .locator('[role="option"], [role="menuitem"], li, div')
            .filter({
                hasText: new RegExp(this.escapeRegExp(savedSearchName), 'i')
            })
            .first();
    }

    private async captureDestinationsFromModal(
        modal: Locator
    ): Promise<string[]> {

        const chips = modal.locator('.MuiChip-label');

        const destinations = [
            ...new Set(
                (await chips.allInnerTexts())
                    .map(text => text.trim())
                    .filter(Boolean)
            )
        ];

        console.log(
            'Captured modal destinations:',
            destinations
        );

        return destinations;
    }

    private async completeAlertModal(alertType: string): Promise<void> {
        const modal = this.page.getByRole('dialog');

        await expect(modal).toBeVisible({ timeout: 10000 });

        if (alertType.toLowerCase() === 'instant') {
            await modal.getByText('Instant', { exact: true }).click();

        } else if (alertType.toLowerCase() === 'digest') {

            await modal.getByRole('button', { name: /^Digest$/i }).click();

            console.log('===== DIGEST MODAL BEFORE SELECTION =====');
            console.log(await modal.innerText());

            const digestRow = modal.locator(
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

            console.log('✅ Selected digest range: 05:00 - 12:00');
        } else {
            throw new Error(`❌ Unsupported alert type: ${alertType}`);
        }

        console.log('===== ALERT MODAL BEFORE SAVE =====');
        console.log(await modal.innerText());

        const saveButton = modal.getByRole('button', { name: /^Save$/i });

        await expect(saveButton).toBeVisible({ timeout: 10000 });
        await expect(saveButton).toBeEnabled({ timeout: 10000 });

        console.log('Save disabled?', await saveButton.isDisabled());

        await saveButton.click({ force: true });

        await this.page.waitForTimeout(1500);

        await expect(modal).toBeHidden({ timeout: 20000 });
    }
    protected async selectDigestRange(): Promise<void> {
        const digestRow = this.page.locator(
            '[data-testid="alert-time-range-0"]'
        );

        const sendAtToggle = digestRow.locator(
            'input[type="checkbox"]'
        );

        await expect(digestRow).toBeVisible();

        if (!(await sendAtToggle.isChecked())) {
            await digestRow.click();
        }

        await expect(sendAtToggle).toBeChecked();
    }
    private escapeRegExp(value: string): string {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}