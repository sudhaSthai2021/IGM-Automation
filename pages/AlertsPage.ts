import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class AlertsPage extends BasePage {

    readonly alertsMenu: Locator;
    readonly deleteButton: Locator;

    constructor(page: Page) {
        super(page);

        this.alertsMenu =
            page.getByRole('link', { name: /alerts/i });

        this.deleteButton =
            page.locator(
                'button[aria-label*="Delete"], button:has-text("Delete")'
            );
    }

    async navigateToAlertsPage(): Promise<void> {
    await this.alertsMenu.click();

    await expect(this.page).toHaveURL(/alerts/i);

    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(3000);
}
async deleteAllAlerts(): Promise<void> {

    let deletedCount = 0;

    while (deletedCount < 100) {

        const deleteButton =
            this.page.locator(
                '[data-testid="alerts-delete-icon-button"]'
            ).first();

        if (!(await deleteButton.isVisible().catch(() => false))) {
            break;
        }

        await deleteButton.click();

        await this.page
            .getByRole('button', { name: /yes.*delete/i })
            .click();

        deletedCount++;

        console.log(`Deleted ${deletedCount} alerts`);

        await this.page.waitForTimeout(1500);
    }

    console.log(`✅ Deleted ${deletedCount} alerts`);
}
    async verifyNoAlertsPresent(): Promise<void> {

    const deleteButtons =
        this.page.locator('[data-testid="alerts-delete-icon-button"]');

    const count = await deleteButtons.count();

    console.log(`Delete buttons remaining: ${count}`);

    await expect(deleteButtons).toHaveCount(0);

    console.log('✅ No alerts available');
}
}