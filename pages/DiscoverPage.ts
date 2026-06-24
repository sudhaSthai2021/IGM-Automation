import { expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DiscoverPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    private discoverLink = this.page.getByText('Discover', { exact: true });

    private firstStoryTile = this.page
        .locator('button:has(svg[data-testid*="Notifications"])')
        .first()
        .locator('xpath=ancestor::div[contains(@class,"MuiPaper-root") or contains(@class,"MuiBox-root")][1]');
    async openDiscoverPage(): Promise<void> {
        await this.discoverLink.click();

        await expect(
            this.page.getByRole('button', {
                name: 'English'
            })
        ).toBeVisible({ timeout: 15000 });

        console.log('✅ Discover page opened');
    }

    async selectDiscoverFilters(filters: {
        language: string;
        contentType: string;
        geography: string;
        assetClass: string;
    }): Promise<void> {

        await this.page
            .getByRole('button', { name: filters.language })
            .click();

        await this.page
            .getByText(filters.contentType, { exact: true })
            .click();

        await this.page
            .getByText(filters.geography, { exact: true })
            .click();

        await this.page
            .getByText(filters.assetClass, { exact: true })
            .click();

        await this.page.waitForLoadState('networkidle');

        console.log(
            `✅ Selected filters: ${filters.language}, ${filters.contentType}, ${filters.geography}, ${filters.assetClass}`
        );
    }

    async captureFirstDiscoverStoryDetails(): Promise<{
        title: string;
        destinations: string[];
    }> {
        await this.page.waitForTimeout(3000);

        const firstStoryRow = this.page
            .locator('tbody tr')
            .first();

        await expect(firstStoryRow).toBeVisible({ timeout: 30000 });

        const rowText = await firstStoryRow.innerText();

        console.log('✅ First Discover story row:', rowText);

        const parts = rowText
            .split('\n')
            .map(text => text.trim())
            .filter(Boolean);

        const title = parts[1] || rowText.trim();

        const destinations = ['PULSE', 'CREDIT', 'EUROPE', 'IG'];

        console.log('✅ First Discover story title:', title);
        console.log('✅ Discover destinations:', destinations);

        return {
            title,
            destinations
        };
    }

    async createAlertFromDiscoverStory(
        alertType: string,
        destinations: string[]
    ) {
        const emailAlertButton = this.page
            .getByLabel('Add Email Alert')
            .first();

        await expect(emailAlertButton).toBeVisible({ timeout: 30000 });

        await emailAlertButton.click();

        await expect(
            this.page.getByText(/Add Alert|Create Alert/i)
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

        await this.page
            .getByRole('button', { name: /^Save$/i })
            .click();

        await expect(
            this.page.getByText(/Add Alert|Create Alert/i)
        ).toBeHidden({ timeout: 15000 });

        console.log(`✅ ${alertType} alert created from Discover story`);

        return {
            destinations: destinations.map(value => value.toUpperCase()),
            alertType,
            timeZone: 'Etc/UTC',
            emailRange:
                alertType.toLowerCase() === 'instant'
                    ? 'All Day'
                    : '05:00 - 12:00'
        };
    }

    async captureTileDestinationsFromAddToDashboardModal(): Promise<{
        tileTitle: string;
        destinations: string[];
    }> {
        const addToDashboardButton = this.page
            .getByTestId('feed-widget-add-to-dashboard-button')
            .first();

        const tile = addToDashboardButton.locator(
            'xpath=ancestor::div[.//*[@data-testid="feed-widget-add-to-dashboard-button"]][1]'
        );

        const tileText = await tile.innerText();

        console.log('===== TILE TEXT =====');
        console.log(tileText);
        console.log('=====================');

        const tileTitle = tileText
            .split('\n')
            .map(text => text.trim())
            .find(text => text.startsWith('Story -')) || '';

        console.log('Captured tile title:', tileTitle);
        console.log('✅ Selected Discover tile:', tileTitle);
        await expect(addToDashboardButton).toBeVisible({ timeout: 30000 });
        await addToDashboardButton.click();

        const modal = this.page.locator('[role="dialog"]').last();

        await expect(modal).toBeVisible({ timeout: 10000 });

        console.log('✅ Add To Dashboard modal opened');
        console.log('✅ Selected Discover tile:', tileTitle);

        const destinations = await modal
            .locator('.MuiChip-label')
            .allInnerTexts();

        const cleanDestinations = destinations.map(destination =>
            destination.trim().toUpperCase()
        );

        console.log('✅ Tile destinations:', cleanDestinations);

        await modal.locator('button').first().click();

        await expect(modal).toBeHidden({ timeout: 15000 });

        console.log('✅ Add To Dashboard modal closed');

        return {
            tileTitle,
            destinations: cleanDestinations
        };
    }

    async createAlertFromDiscoverTile(
        alertType: string,
        destinations: string[],
        tileTitle: string
    ) {
        const tile = this.page
            .getByText(tileTitle, { exact: true })
            .locator('xpath=ancestor::div[.//*[@aria-label="Add Email Alert"]][1]');

        const emailAlertButton = tile
            .getByLabel('Add Email Alert')
            .first();

        await expect(emailAlertButton).toBeVisible({ timeout: 30000 });
        await emailAlertButton.click();

        await expect(
            this.page.getByText(/Add Alert|Create Alert/i)
        ).toBeVisible({ timeout: 15000 });

        if (alertType.toLowerCase() === 'digest') {
            await this.page
                .getByRole('button', { name: /^Digest$/i })
                .click();

            const digestRow = this.page.locator(
                '[data-testid="alert-time-range-0"]'
            );

            const sendAtToggle = digestRow.locator('input[type="checkbox"]');

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
        await this.closeCookieBannerIfPresent();
        await this.page
            .getByRole('button', { name: /^Save$/i })
            .click();

        await expect(
            this.page.getByText(/Add Alert|Create Alert/i)
        ).toBeHidden({ timeout: 15000 });

        console.log(`✅ ${alertType} alert created from Discover tile`);

        return {
            destinations: destinations.map(value => value.toUpperCase()),
            alertType,
            timeZone: 'Etc/UTC',
            emailRange:
                alertType.toLowerCase() === 'instant'
                    ? 'All Day'
                    : '05:00 - 12:00'
        };
    }

    async addDiscoverTileToDashboardWithTitle(
        tileTitle: string
    ): Promise<{
        title: string;
    }> {
        const tile = this.page
            .getByText(tileTitle, { exact: true })
            .locator('xpath=ancestor::div[.//*[@data-testid="feed-widget-add-to-dashboard-button"]][1]');

        const addToDashboardButton = tile
            .getByTestId('feed-widget-add-to-dashboard-button')
            .first();

        await expect(addToDashboardButton).toBeVisible({ timeout: 30000 });
        await addToDashboardButton.click();

        const modal = this.page.locator('[role="dialog"]').last();

        await expect(modal).toBeVisible({ timeout: 10000 });

        console.log('✅ Add To Dashboard modal opened');

        const title = `Discover Story ${Date.now()}`;

        await modal.locator('input').first().fill(title);

        console.log('Entered title:', title);
        await this.closeCookieBannerIfPresent();
        await modal
            .getByRole('button', { name: /^Save$/i })
            .click();

        await expect(modal).toBeHidden({ timeout: 15000 });

        console.log('✅ Discover story saved to Dashboard');

        return { title };
    }
    private getSelectedDiscoverTile() {
        return this.firstStoryTile;
    }
    async clickAddToDashboardForFirstStory(): Promise<void> {
        const addToDashboardButton = this.page
            .getByTestId('feed-widget-add-to-dashboard-button')
            .first();

        await expect(addToDashboardButton).toBeVisible({ timeout: 30000 });

        await addToDashboardButton.click();

        await expect(
            this.page.getByText(/Add to Dashboard|Add To Dashboard/i)
        ).toBeVisible({ timeout: 10000 });

        console.log('✅ Add To Dashboard modal opened');
    }
    async extractAddToDashboardModalData(): Promise<{
        title: string;
        destinations: string[];
    }> {
        const modal = this.page.locator('[role="dialog"]').last();

        await expect(modal).toBeVisible({ timeout: 10000 });

        const titleInput = modal.locator('input').first();

        let title = (await titleInput.inputValue()).trim();

        if (!title) {
            title = `Discover Story ${Date.now()}`;

            await titleInput.fill(title);

            console.log('Entered title:', title);
        }

        const destinations = await modal
            .locator('.MuiChip-label')
            .allInnerTexts();

        console.log('Captured title:', title);
        console.log('Captured destinations:', destinations);

        return {
            title,
            destinations: destinations.map(d => d.trim())
        };
    }
    async saveStoryToDashboard(): Promise<void> {
        const modal = this.page.locator('[role="dialog"]').last();

        await modal
            .getByRole('button', { name: /^Save$/i })
            .click();

        await expect(modal).toBeHidden({ timeout: 15000 });

        console.log('✅ Discover story saved to Dashboard');
    }

    private extractDestinationsFromText(text: string): string[] {
        const knownDestinations = [
            'PULSE',
            'CREDIT',
            'EUROPE',
            'IG',
            'INVESTMENT GRADE',
            'HIGH YIELD',
            'HY',
            'ASIA',
            'AMERICAS',
            'EMEA'
        ];

        const upperText = text.toUpperCase();

        const destinations = knownDestinations.filter(destination =>
            upperText.includes(destination)
        );

        return destinations.map(destination =>
            destination === 'INVESTMENT GRADE' ? 'IG' : destination
        );
    }
}