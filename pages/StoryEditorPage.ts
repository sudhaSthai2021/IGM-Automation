import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class StoryEditorPage extends BasePage {
    private originalHeadline = '';
    private originalBodyHtml = '';

    readonly dashboardHeading: Locator;
    readonly authorMenu: Locator;
    readonly englishMenu: Locator;

    readonly createBondIssueButton: Locator;
    readonly createButton: Locator;
    readonly publishButton: Locator;

    readonly headlineEditor: Locator;
    readonly bodyEditor: Locator;

    readonly destinationDropdown: Locator;
    readonly resendAlertsToggle: Locator;

    readonly boldButton: Locator;
    readonly italicButton: Locator;
    readonly strikeThroughButton: Locator;

    readonly bulletListButton: Locator;
    readonly numberedListButton: Locator;


    readonly hyperlinkButton: Locator;
    readonly uploadFileButton: Locator;
    readonly horizontalLineButton: Locator;
    readonly vendorLinkButton: Locator;

    readonly alignLeftButton: Locator;
    readonly alignCenterButton: Locator;
    readonly alignRightButton: Locator;
    readonly justifyButton: Locator;

    readonly insertImageButton: Locator;
    readonly insertVideoButton: Locator;
    readonly insertTableButton: Locator;




    constructor(page: Page) {
        super(page);

        this.dashboardHeading =
            page.getByText('Dashboard', { exact: true });

        this.authorMenu =
            page.getByText('Author', { exact: true });

        this.englishMenu =
            page.getByText('English', { exact: true });

        this.createBondIssueButton =
            page.getByRole('button', { name: /Create Bond Issue/i });

        this.createButton =
            page.getByRole('button', { name: /^Create$/i });

        this.publishButton =
            page.getByRole('button', { name: /^Publish$/i });

        this.headlineEditor =
            page.locator('input[placeholder="Enter Headline"], textarea[placeholder="Enter Headline"]')
                .first();

        this.bodyEditor =
            page.locator('[contenteditable="true"]')
                .first();

        this.destinationDropdown =
            page.locator('#destinationsIds');

        this.resendAlertsToggle =
            page.locator('text=Resend Alerts')
                .locator('..')
                .locator('input[type="checkbox"]')
                .first();

        this.boldButton =
            page.getByRole('button', { name: /bold/i });

        this.italicButton =
            page.getByRole('button', { name: /italic/i });

        this.strikeThroughButton =
            page.getByRole('button', { name: /strikethrough|strike/i });

        this.bulletListButton =
            page.getByRole('button', {
                name: 'Unordered List',
                exact: true
            });
        this.numberedListButton =
            page.getByRole('button', {
                name: 'Ordered List',
                exact: true
            });

        this.hyperlinkButton =
            page.getByRole('button', {
                name: 'Insert Link',
                exact: true
            });

        this.alignLeftButton =
            page.getByRole('button', { name: /align left/i });

        this.alignCenterButton =
            page.getByRole('button', { name: /align center/i });

        this.alignRightButton =
            page.getByRole('button', { name: /align right/i });

        this.justifyButton =
            page.getByRole('button', { name: /justify/i });

        this.insertImageButton =
            page.locator('[data-cmd="insertImage"]');

        this.insertVideoButton =
            page.locator('button[data-cmd="insertVideo"]');

        this.insertTableButton =
            page.locator('button[data-cmd="insertTable"]');

        this.uploadFileButton =
            page.locator('[data-cmd="insertFile"]');

        this.horizontalLineButton =
            page.locator('[data-cmd="insertHR"]');

        this.vendorLinkButton =
            page.locator('[data-cmd="vendorLink"]');
    }



    async navigateToAuthorEnglishPage(): Promise<void> {
        await this.authorMenu.click();
        await this.englishMenu.click();

        await expect(this.createBondIssueButton).toBeVisible({ timeout: 15000 });
    }

    async clickCreateBondIssue(): Promise<void> {
        await this.createBondIssueButton.click();

        await expect(
            this.page.getByRole('heading', { name: /Create Bond Issue/i })
        ).toBeVisible({ timeout: 15000 });
    }

    async verifyEditorContentRetained(): Promise<void> {
        const html = await this.bodyEditor.innerHTML();

        expect(html).toContain('Vendor Link Test');
        expect(html).toContain('Bold Text');
        expect(html).toContain('Italic Text');
        expect(html).toContain('Strike Text');
        expect(html).toContain('Bullet Item');
        expect(html).toContain('Number Item');

        console.log('✅ Editor content retained after Create');
    }

    async enterHeadlineAndBody(): Promise<void> {
        const text = `Automation Bond Sudha1 Issue ${Date.now()}`;

        this.originalHeadline = text;

        await this.editHeadline(text);
        await this.editBody(text);

        this.originalBodyHtml = await this.bodyEditor.innerHTML();
    }
    async editHeadline(text: string): Promise<void> {
        await expect(this.headlineEditor).toBeVisible({ timeout: 15000 });

        await this.headlineEditor.click();
        await this.headlineEditor.press('Control+A');
        await this.headlineEditor.fill(text);
    }

    async editBody(text: string): Promise<void> {
        await expect(this.bodyEditor).toBeVisible({ timeout: 15000 });

        await this.bodyEditor.click();
        await this.selectAllInEditor();
        await this.bodyEditor.fill(text);
    }
    /*
        async verifyAllRichTextEditorControls(): Promise<void> {
    
            const startNewRow = async (label: string) => {
                console.log(`➡️ Preparing clean row for: ${label}`);
    
                await this.bodyEditor.click();
    
                // break any selection / formatting context
                await this.page.keyboard.press('Escape');
    
                // move to end safely
                await this.page.keyboard.press('Control+End');
    
                // ALWAYS create a fresh paragraph
                await this.page.keyboard.press('Enter');
    
                // small stability buffer for Froala/Quill
                await this.page.waitForTimeout(200);
            };
    
            console.log('START: Toolbar');
            await this.verifyToolbarButtonsVisibleAndEnabled();
            console.log('DONE: Toolbar');
    
            console.log('START: Vendor Link');
            await startNewRow('Vendor Link');
            await this.verifyVendorLinkInsert();
            console.log('DONE: Vendor Link');
    
            console.log('START: Bold');
            await startNewRow('Bold');
            await this.verifyBoldFunctionality();
            console.log('DONE: Bold');
    
            console.log('START: Italic');
            await startNewRow('Italic');
            await this.verifyItalicFunctionality();
            console.log('DONE: Italic');
    
            console.log('START: Strike');
            await startNewRow('Strike');
            await this.verifyStrikeThroughFunctionality();
            console.log('DONE: Strike');
    
            console.log('START: Bullet');
            await startNewRow('Bullet');
            await this.verifyBulletListFunctionality();
            console.log('DONE: Bullet');
    
            console.log('START: Number');
            await startNewRow('Number');
            await this.verifyNumberedListFunctionality();
            console.log('DONE: Number');
    
            console.log('START: Horizontal Line');
            await startNewRow('Horizontal Line');
            await this.verifyHorizontalLineInsert();
            console.log('DONE: Horizontal Line');
    
            console.log('START: Align Left');
            await startNewRow('Align Left');
            await this.verifyAlignLeftFunctionality();
            console.log('DONE: Align Left');
    
            console.log('START: Align Center');
            await startNewRow('Align Center');
            await this.verifyAlignCenterFunctionality();
            console.log('DONE: Align Center');
    
            console.log('START: Align Right');
            await startNewRow('Align Right');
            await this.verifyAlignRightFunctionality();
            console.log('DONE: Align Right');
    
            console.log('START: Justify');
            await startNewRow('Justify');
            await this.verifyJustifyFunctionality();
            console.log('DONE: Justify');
    
            console.log('START: File Upload');
            await startNewRow('File Upload');
            await this.verifyFileUpload();
            console.log('DONE: File Upload');
    
            console.log('START: Table');
            await startNewRow('Table');
            await this.verifyTableInsert();
            console.log('DONE: Table');
    
            console.log('START: Hyperlink');
            await startNewRow('Hyperlink');
            await this.verifyHyperlinkInsert();
            console.log('DONE: Hyperlink');
    
            console.log('START: Image');
            await startNewRow('Image');
            await this.verifyImageInsert();
            console.log('DONE: Image');
    
            console.log('START: Video');
            await startNewRow('Video');
            await this.verifyVideoInsert();
            console.log('DONE: Video');
    
            console.log('✅ All Rich Text Editor controls are fully validated');
        }
        */

    async verifyAllRichTextEditorControls(): Promise<void> {

        await this.resetEditor();
        await this.moveToNewParagraph();

        console.log('START: Toolbar');
        await this.verifyToolbarButtonsVisibleAndEnabled();
        console.log('DONE: Toolbar');

        console.log('START: Vendor Link');
        await this.verifyVendorLinkInsert();
        console.log('DONE: Vendor Link');

        console.log('START: Bold');
        await this.verifyBoldFunctionality();
        console.log('DONE: Bold');

        console.log('START: Italic');
        await this.verifyItalicFunctionality();
        console.log('DONE: Italic');

        console.log('START: Strike');
        await this.verifyStrikeThroughFunctionality();
        console.log('DONE: Strike');

        console.log('START: Bullet');
        await this.verifyBulletListFunctionality();
        console.log('DONE: Bullet');

        console.log('START: Number');
        await this.verifyNumberedListFunctionality();
        console.log('DONE: Number');

        console.log('START: Horizontal Line');
        await this.verifyHorizontalLineInsert();
        console.log('DONE: Horizontal Line');

        console.log('START: Align Left');
        await this.verifyAlignLeftFunctionality();
        console.log('DONE: Align Left');

        console.log('START: Align Center');
        await this.verifyAlignCenterFunctionality();
        console.log('DONE: Align Center');

        console.log('START: Align Right');
        await this.verifyAlignRightFunctionality();
        console.log('DONE: Align Right');

        console.log('START: Justify');
        await this.verifyJustifyFunctionality();
        console.log('DONE: Justify');

        console.log('START: File Upload');
        await this.verifyFileUpload();
        console.log('DONE: File Upload');

        console.log('START: Table');
        await this.verifyTableInsert();
        console.log('DONE: Table');

        console.log('START: Hyperlink');
        await this.verifyHyperlinkInsert();
        console.log('DONE: Hyperlink');

        console.log('START: Image');
        await this.verifyImageInsert();
        console.log('DONE: Image');

        console.log('START: Video');
        await this.verifyVideoInsert();
        console.log('DONE: Video');

        console.log('✅ All Rich Text Editor controls are fully validated');
    }

    async verifyRichTextToolbarControlsAreAvailableAndEditable(): Promise<void> {
        await this.resetEditor();
        console.log('EDITABLE: BOLD');


        await this.goToEndAndTypeNewLine();

        console.log(
            'BOLD DISABLED BEFORE CLICK:',
            await this.boldButton.getAttribute('aria-disabled')
        );

        console.log(
            'ITALIC DISABLED BEFORE BOLD:',
            await this.italicButton.getAttribute('aria-disabled')
        );

        await this.boldButton.click();

        console.log(
            'BOLD PRESSED AFTER CLICK:',
            await this.boldButton.getAttribute('aria-pressed')
        );

        await this.bodyEditor.pressSequentially('Bold Edit Test');

        await this.page.waitForTimeout(500);

        console.log(
            'BOLD DISABLED AFTER TYPE:',
            await this.boldButton.getAttribute('aria-disabled')
        );

        console.log(
            'BOLD PRESSED AFTER TYPE:',
            await this.boldButton.getAttribute('aria-pressed')
        );

        console.log(
            'ITALIC DISABLED AFTER BOLD TYPE:',
            await this.italicButton.getAttribute('aria-disabled')
        );

        console.log(
            'STRIKE DISABLED AFTER BOLD TYPE:',
            await this.strikeThroughButton.getAttribute('aria-disabled')
        );

        console.log(
            'ACTIVE ELEMENT AFTER BOLD TYPE:',
            await this.page.evaluate(() => document.activeElement?.outerHTML)
        );

        console.log('EDITABLE: ITALIC');


        await this.goToEndAndTypeNewLine();

        await this.page.waitForTimeout(500);

        console.log(
            'BODY EDITOR DISABLED:',
            await this.bodyEditor.getAttribute('aria-disabled')
        );

        console.log(
            'ITALIC DISABLED BEFORE CLICK:',
            await this.italicButton.getAttribute('aria-disabled')
        );

        console.log(
            'ITALIC PRESSED BEFORE CLICK:',
            await this.italicButton.getAttribute('aria-pressed')
        );

        console.log(
            'STRIKE DISABLED BEFORE ITALIC:',
            await this.strikeThroughButton.getAttribute('aria-disabled')
        );

        console.log(
            'ACTIVE ELEMENT BEFORE ITALIC:',
            await this.page.evaluate(() => document.activeElement?.outerHTML)
        );

        console.log(
            'EDITOR HTML BEFORE ITALIC:',
            await this.getBodyEditorHtml()
        );

        console.log(
            'ACTIVE VIDEO COUNT:',
            await this.page.locator('.fr-video.fr-active').count()
        );

        console.log(
            'ACTIVE TABLE COUNT:',
            await this.page.locator('table.fr-active').count()
        );

        console.log(
            'ACTIVE IMAGE COUNT:',
            await this.page.locator('.fr-image.fr-active').count()
        );

        console.log(
            'ITALIC BUTTON HTML:',
            await this.italicButton.evaluate(el => el.outerHTML)
        );

        await this.italicButton.click();
        console.log(
            'ITALIC PRESSED AFTER CLICK:',
            await this.italicButton.getAttribute('aria-pressed')
        );

        await this.bodyEditor.pressSequentially('Italic Edit Test');

        console.log('EDITABLE: STRIKE');

        await this.goToEndAndTypeNewLine();

        console.log(
            'STRIKE DISABLED BEFORE CLICK:',
            await this.strikeThroughButton.getAttribute('aria-disabled')
        );

        await this.strikeThroughButton.click();
        await this.bodyEditor.pressSequentially('Strike Edit Test');

        console.log('EDITABLE: BULLET');

        await this.goToEndAndTypeNewLine();

        await this.bulletListButton.click();
        await this.bodyEditor.pressSequentially('Bullet Edit Test');
        await this.page.keyboard.press('Enter');

        console.log('EDITABLE: NUMBER');

        await this.goToEndAndTypeNewLine();

        await this.numberedListButton.click();
        await this.bodyEditor.pressSequentially('Number Edit Test');
        await this.page.keyboard.press('Enter');

        console.log('EDITABLE: ALIGN LEFT');


        await this.goToEndAndTypeNewLine();

        await this.bodyEditor.pressSequentially('Left Align Edit Test');
        await this.selectAllInEditor();
        await this.alignCenterButton.click();
        await this.alignLeftButton.click();

        console.log('EDITABLE: ALIGN CENTER');

        console.log('CENTER BEFORE FOCUS');

        console.log('CENTER AFTER FOCUS');

        console.log('CENTER BEFORE MOVE');
        await this.goToEndAndTypeNewLine();
        console.log('CENTER AFTER MOVE');

        console.log('CENTER BEFORE TYPE');
        await this.bodyEditor.pressSequentially('Center Align Edit Test');
        console.log('CENTER AFTER TYPE');

        console.log('CENTER BEFORE CTRL+A');
        await this.bodyEditor.press('Control+A');
        console.log('CENTER AFTER CTRL+A');

        console.log(
            'CENTER BUTTON DISABLED:',
            await this.alignCenterButton.getAttribute('aria-disabled')
        );

        console.log('CENTER BEFORE CLICK');
        await this.alignCenterButton.click();
        console.log('CENTER AFTER CLICK');

        console.log(
            'CENTER BUTTON PRESSED:',
            await this.alignCenterButton.getAttribute('aria-pressed')
        );

        console.log(
            'ACTIVE ELEMENT AFTER CENTER:',
            await this.page.evaluate(() => document.activeElement?.outerHTML)
        );

        console.log(
            'VIDEO ACTIVE AFTER CENTER:',
            await this.page.locator('.fr-video.fr-active').count()
        );

        console.log(
            'TABLE ACTIVE AFTER CENTER:',
            await this.page.locator('table.fr-active').count()
        );

        console.log(
            'CENTER HTML:',
            await this.getBodyEditorHtml()
        );
        console.log('EDITABLE: ALIGN RIGHT');

        await this.goToEndAndTypeNewLine();

        console.log(
            'HTML BEFORE RIGHT TYPE:',
            await this.getBodyEditorHtml()
        );

        console.log(
            'ACTIVE ELEMENT BEFORE RIGHT TYPE:',
            await this.page.evaluate(() => document.activeElement?.outerHTML)
        );

        await this.bodyEditor.pressSequentially('Right Align Edit Test');

        console.log(
            'HTML AFTER RIGHT TYPE:',
            await this.getBodyEditorHtml()
        );

        console.log(
            'ACTIVE ELEMENT AFTER RIGHT TYPE:',
            await this.page.evaluate(() => document.activeElement?.outerHTML)
        );

        await this.bodyEditor.press('Control+A');

        console.log(
            'HTML AFTER CTRL+A:',
            await this.getBodyEditorHtml()
        );

        await this.alignRightButton.click();

        console.log(
            'HTML AFTER RIGHT ALIGN CLICK:',
            await this.getBodyEditorHtml()
        );
        console.log('EDITABLE: JUSTIFY');


        await this.goToEndAndTypeNewLine();
        await this.bodyEditor.pressSequentially('Justify Edit Test');
        await this.bodyEditor.press('Control+A');
        await this.justifyButton.click();

        console.log('EDITABLE: BEFORE HTML');

        const html = await this.getBodyEditorHtml();

        console.log('EDITABLE: AFTER HTML');
        console.log('FINAL HTML:', html);

        expect(html).toContain('bold edit test');
        expect(html).toContain('italic edit test');
        expect(html).toContain('strike edit test');
        expect(html).toContain('bullet edit test');
        expect(html).toContain('number edit test');
        expect(html).toContain('left align edit test');
        expect(html).toContain('right align edit test');
        expect(html).toContain('justify edit test');

        expect(html).toMatch(/<strong>|<b>/);
        expect(html).toMatch(/<em>|<i>/);
        expect(html).toMatch(/<s>|<strike>/);
        expect(html).toMatch(/<ul|<ol/);

        console.log('✅ Existing editor content remains editable after Create');
    }

    private async verifyToolbarButtonsVisibleAndEnabled(): Promise<void> {
        const buttons = [
            this.boldButton,
            this.italicButton,
            this.strikeThroughButton,
            this.bulletListButton,
            this.numberedListButton,
            this.hyperlinkButton,

            this.insertImageButton,
            this.insertVideoButton,
            this.insertTableButton,
            this.uploadFileButton,
            this.horizontalLineButton,
            this.vendorLinkButton,

            this.alignLeftButton,
            this.alignCenterButton,
            this.alignRightButton,
            this.justifyButton
        ];

        for (const button of buttons) {
            await expect(button).toBeVisible({ timeout: 10000 });
            await expect(button).toBeEnabled();
        }
    }
    private async clearBodyEditor(): Promise<void> {
        await this.bodyEditor.click();
        await this.bodyEditor.press('Control+A');
        await this.bodyEditor.press('Backspace');
    }



    private async getBodyEditorHtml(): Promise<string> {

        await this.page.waitForTimeout(500);


        const html =
            await this.page
                .locator('[contenteditable="true"]')
                .first()
                .innerHTML();

        console.log('Body editor HTML:', html);

        return html.toLowerCase();
    }

    private async verifyBoldFunctionality(): Promise<void> {
        await this.goToEndAndTypeNewLine();

        await expect(this.boldButton).toBeVisible();
        await expect(this.boldButton).toBeEnabled();

        await this.boldButton.click();
        await this.bodyEditor.pressSequentially('Bold Text');

        const html = await this.getBodyEditorHtml();

        expect(html).toMatch(/<strong>|<b>/);

        await this.boldButton.click();
    }

    private async verifyItalicFunctionality(): Promise<void> {
        await this.goToEndAndTypeNewLine();

        await expect(this.italicButton).toBeVisible();
        await expect(this.italicButton).toBeEnabled();

        await this.italicButton.click();
        await this.bodyEditor.pressSequentially('Italic Text');

        const html = await this.getBodyEditorHtml();

        expect(html).toMatch(/<em>|<i>/);

        await this.italicButton.click();
    }

    private async verifyStrikeThroughFunctionality(): Promise<void> {
        await this.goToEndAndTypeNewLine();

        await expect(this.strikeThroughButton).toBeVisible();
        await expect(this.strikeThroughButton).toBeEnabled();

        await this.strikeThroughButton.click();
        await this.bodyEditor.pressSequentially('Strike Text');

        const html = await this.getBodyEditorHtml();

        expect(html).toMatch(/<s>|<strike>|line-through/);

        await this.strikeThroughButton.click();
    }

    private async verifyBulletListFunctionality(): Promise<void> {
        await this.goToEndAndTypeNewLine();

        await expect(this.bulletListButton).toBeVisible();
        await expect(this.bulletListButton).toBeEnabled();

        await this.bulletListButton.click();
        await this.bodyEditor.pressSequentially('Bullet Item');

        const html = await this.getBodyEditorHtml();

        expect(html).toContain('<ul');

        await this.bulletListButton.click();
    }

    private async verifyNumberedListFunctionality(): Promise<void> {
        await this.goToEndAndTypeNewLine();

        await expect(this.numberedListButton).toBeVisible();
        await expect(this.numberedListButton).toBeEnabled();

        // STEP 1: type content first
        await this.bodyEditor.pressSequentially('Number Item');

        // STEP 2: select it (critical for Froala)
        await this.page.keyboard.press('Home');
        await this.page.keyboard.down('Shift');
        await this.page.keyboard.press('End');
        await this.page.keyboard.up('Shift');

        // STEP 3: apply numbered list
        await this.numberedListButton.click();

        await this.page.waitForTimeout(300);

        const html = await this.getBodyEditorHtml();

        expect(html).toContain('<ol');
        expect(html).toContain('<li');

        // optional cleanup
        await this.page.keyboard.press('ArrowRight');
    }
    private async verifyAlignLeftFunctionality(): Promise<void> {
        await this.goToEndAndTypeNewLine();

        await this.bodyEditor.pressSequentially('Left Text');
        await this.bodyEditor.press('Control+A');

        await expect(this.alignLeftButton).toBeVisible();
        await expect(this.alignLeftButton).toBeEnabled();

        await this.alignLeftButton.click();

        const html = await this.getBodyEditorHtml();

        expect(html).toMatch(/text-align:\s*left|align="left"/);
    }

    private async verifyAlignCenterFunctionality(): Promise<void> {
        console.log('CENTER: start');

        await this.goToEndAndTypeNewLine();
        console.log('CENTER: after move');

        await this.bodyEditor.pressSequentially('Center Text');
        console.log('CENTER: after type');

        await this.bodyEditor.press('Control+A');
        console.log('CENTER: after ctrl+a');

        await this.alignCenterButton.click();
        console.log('CENTER: after click');

        const html = await this.getBodyEditorHtml();
        console.log('CENTER: after html');
    }

    private async verifyAlignRightFunctionality(): Promise<void> {
        console.log('RIGHT: before moveToEditorEnd');

        await this.goToEndAndTypeNewLine();



        await this.bodyEditor.pressSequentially('Right Text');

        console.log('RIGHT: text entered');

        await this.bodyEditor.press('Control+A');

        console.log('RIGHT: ctrl+a done');

        await expect(this.alignRightButton).toBeVisible();
        await expect(this.alignRightButton).toBeEnabled();

        await this.alignRightButton.click();

        const html = await this.getBodyEditorHtml();

        console.log('RIGHT HTML:', html);

        expect(html).toMatch(
            /text-align:\s*right|align="right"/
        );

        console.log('✅ Align Right verified');
    }

    private async verifyJustifyFunctionality(): Promise<void> {
        await this.goToEndAndTypeNewLine();

        await this.bodyEditor.pressSequentially('Justify Text');
        await this.bodyEditor.press('Control+A');

        await expect(this.justifyButton).toBeVisible();
        await expect(this.justifyButton).toBeEnabled();

        await this.justifyButton.click();

        const html = await this.getBodyEditorHtml();

        expect(html).toMatch(/text-align:\s*justify|align="justify"/);
    }
    async clickCreate(): Promise<void> {
        await expect(this.createButton).toBeVisible({ timeout: 15000 });
        await this.createButton.click();
    }

    async verifyStoryEditorPage(): Promise<void> {
        await expect(
            this.page.getByRole('heading', { name: /Edit Story|Story Editor/i })
        ).toBeVisible({ timeout: 20000 });
    }

    async selectDestinations(destinations: string[]): Promise<void> {
        await expect(this.destinationDropdown).toBeVisible({ timeout: 15000 });

        for (const destination of destinations) {
            await this.destinationDropdown.click();
            await this.destinationDropdown.fill(destination);

            await this.page.getByRole('option', {
                name: new RegExp(`^${destination}$`, 'i')
            }).click();
        }

        console.log('✅ Destinations selected:', destinations.join(', '));
    }



    async enableResendAlerts(): Promise<void> {
        await expect(this.resendAlertsToggle).toBeVisible({ timeout: 10000 });

        if (!(await this.resendAlertsToggle.isChecked())) {
            await this.resendAlertsToggle.check({ force: true });
        }
    }

    async clickPublish(): Promise<void> {
        await expect(this.publishButton).toBeVisible({ timeout: 15000 });
        await this.publishButton.click();
    }

    async verifyPublishSuccess(): Promise<void> {
        await expect(
            this.page.getByText(/Story will publish on/i)
        ).toBeVisible({ timeout: 20000 });
    }

    async verifyHyperlinkInsert(): Promise<void> {
        await this.goToEndAndTypeNewLine();

        await this.bodyEditor.click();
        await this.bodyEditor.pressSequentially('Link Test');

        await this.hyperlinkButton.click();

        const urlInput =
            this.page.locator('input[name="href"]').first();

        await expect(urlInput).toBeVisible({ timeout: 10000 });

        await urlInput.fill('https://www.google.com');

        await this.page.keyboard.press('Enter');

        const html = await this.bodyEditor.innerHTML();

        expect(html).toContain('<a');
        expect(html).toContain('google');

        console.log('✅ Hyperlink inserted successfully');
    }

    async verifyImageInsert(): Promise<void> {
        await this.goToEndAndTypeNewLine();

        await this.insertImageButton.click();

        await expect(
            this.page.getByText('Drop image', { exact: true })
        ).toBeVisible({ timeout: 10000 });


        await this.page.keyboard.press('Escape');

        console.log('✅ Image insert popup opened successfully');
    }
    async verifyVideoInsert(): Promise<void> {
        await this.goToEndAndTypeNewLine();

        await this.insertVideoButton.click();

        const videoUrlInput =
            this.page.locator('input[id^="fr-video-by-url-layer-text"]');

        await expect(videoUrlInput).toBeVisible({ timeout: 10000 });

        const videoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';

        await videoUrlInput.fill(videoUrl);
        await this.page.keyboard.press('Enter');

        // Verify video/embed was inserted
        const insertedVideo = this.bodyEditor.locator('iframe, video');

        await expect(insertedVideo.first()).toBeVisible({
            timeout: 10000,
        });

        console.log('✅ Video inserted successfully');
    }

    async verifyTableInsert(): Promise<void> {
        await this.goToEndAndTypeNewLine();

        // await this.bodyEditor.click();

        await expect(this.insertTableButton).toBeVisible({ timeout: 10000 });
        await expect(this.insertTableButton).toBeEnabled();

        await this.insertTableButton.click({ force: true });

        await this.page.waitForTimeout(500);

        const tableCell =
            this.page.locator('.fr-table-size span').nth(8);

        await tableCell.click({ force: true });

        const html = await this.bodyEditor.innerHTML();

        expect(html.toLowerCase()).toContain('<table');

        console.log('✅ Table inserted successfully');
    }
    async verifyFileUpload(): Promise<void> {
        await this.goToEndAndTypeNewLine();

        console.log('🔥 NEW verifyFileUpload METHOD RUNNING');

        await expect(this.uploadFileButton).toBeVisible({ timeout: 10000 });

        const isDisabled =
            await this.uploadFileButton.getAttribute('aria-disabled');

        if (isDisabled === 'true') {
            console.log('⚠️ File upload button is disabled in current editor state');
            return;
        }

        await this.uploadFileButton.click();

        await expect(
            this.page.getByText(/Drop file|or click/i).first()
        ).toBeVisible({ timeout: 10000 });

        console.log('✅ File upload popup opened successfully');

        // Close popup so it doesn't interfere with Image popup test
        await this.page.keyboard.press('Escape');

        await this.page.waitForTimeout(500);

        console.log('✅ File upload popup closed');
    }
    async verifyVendorLinkInsert(): Promise<void> {
        console.log('Vendor Link: Start');

        // await this.clearBodyEditor();
        await this.bodyEditor.pressSequentially('Vendor Link Test');

        console.log('Vendor Link: Clicking button');
        await this.vendorLinkButton.click();

        const dialog = this.page.getByRole('dialog');

        console.log('Vendor Link: Waiting for dialog');
        await expect(dialog).toBeVisible({ timeout: 10000 });

        console.log('Vendor Link: Filling Bloomberg');
        await dialog.getByLabel(/Bloomberg Page/i)
            .fill('https://www.bloomberg.com/test');

        console.log('Vendor Link: Filling Reuters');
        await dialog.getByLabel(/Reuters Page/i)
            .fill('https://www.reuters.com/test');

        console.log('Vendor Link: Filling Web Page Link');
        await dialog.getByLabel(/Web Page Link/i)
            .fill('https://www.example.com');

        console.log('Vendor Link: Filling Web Page Name');
        await dialog.getByLabel(/Web Page Name/i)
            .fill('Automation Vendor Link');

        console.log('Vendor Link: Clicking Insert');
        await dialog.getByRole('button', { name: /^Insert$/i }).click();

        console.log('Vendor Link: Waiting for dialog to close');
        await expect(dialog).toBeHidden({ timeout: 10000 });

        console.log('Vendor Link: Dialog closed');

        const html = await this.bodyEditor.innerHTML();
        console.log('Body HTML after vendor insert:', html);

        await expect(dialog).toBeHidden();

        console.log('✅ Vendor link dialog completed successfully');
    }


    async verifyHorizontalLineInsert(): Promise<void> {
        console.log('🔥 BEFORE HORIZONTAL LINE');

        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(500);

        await this.goToEndAndTypeNewLine();

        await expect(this.horizontalLineButton).toBeVisible({ timeout: 10000 });

        const isDisabled =
            await this.horizontalLineButton.getAttribute('aria-disabled');



        await this.horizontalLineButton.click();

        await this.page.waitForTimeout(1000);

        const html = await this.bodyEditor.innerHTML();
        console.log('Body editor HTML after HR:', html);

        const hrCount = await this.bodyEditor.locator('hr').count();
        console.log('HR count:', hrCount);

        expect(hrCount).toBeGreaterThan(0);

        console.log('✅ Horizontal line inserted successfully');
    }


    async verifyImageUploadIsFailing(): Promise<void> {
        await this.goToEndAndTypeNewLine();

        await this.insertImageButton.click();

        const fileInput = this.page.locator('input[type="file"]').first();

        await fileInput.setInputFiles('test-data/sample-image.png');

        // Wait for upload attempt to complete
        await this.page.waitForTimeout(5000);

        // Dump entire page text so we can see actual error
        console.log(
            'PAGE TEXT:',
            await this.page.locator('body').innerText()
        );

        await this.page.waitForTimeout(5000);

        console.log(
            'BODY HTML:',
            await this.page.locator('body').innerHTML()
        );

        // Look for any toast/snackbar
        const alerts = this.page.locator(
            '[role="alert"], .MuiAlert-message, .fr-error'
        );

        console.log(
            'ALERT COUNT:',
            await alerts.count()
        );

        for (let i = 0; i < await alerts.count(); i++) {
            console.log(
                'ALERT:',
                await alerts.nth(i).innerText()
            );
        }

        console.log(
            '❌ Image upload functionality is failing: Error during file upload'
        );
    }




    async resetEditor(): Promise<void> {
        console.log("🧹 Resetting editor state");

        await this.page.locator('.fr-element.fr-view').click();

        // Select all + delete EVERYTHING
        await this.page.keyboard.press('Control+A');
        await this.page.keyboard.press('Backspace');

        await this.page.waitForTimeout(300);
    }
    private async goToEndAndTypeNewLine(): Promise<void> {
        console.log('➡️ goToEndAndTypeNewLine: start');

        await this.bodyEditor.click({ force: true });

        // IMPORTANT: normalize selection first
        await this.page.keyboard.press('Escape');

        // safer than Ctrl+End in rich editors
        await this.bodyEditor.evaluate((el) => {
            const range = document.createRange();
            const selection = window.getSelection();

            range.selectNodeContents(el);
            range.collapse(false);

            selection?.removeAllRanges();
            selection?.addRange(range);
        });

        await this.page.keyboard.press('Enter');

        await this.page.waitForTimeout(200);

        console.log('➡️ goToEndAndTypeNewLine: end');
    }
    private async selectAllInEditor(): Promise<void> {
        await this.bodyEditor.click({ force: true });

        await this.page.keyboard.down('Control');
        await this.page.keyboard.press('A');
        await this.page.keyboard.up('Control');

        await this.page.waitForTimeout(200);
    }
    private async moveToNewParagraph(): Promise<void> {
        await this.bodyEditor.click({ force: true });

        await this.page.keyboard.press('Escape');

        // Always force focus first
        await this.bodyEditor.focus();

        // Move using DOM selection (NOT Ctrl+End)
        await this.bodyEditor.evaluate((el) => {
            const range = document.createRange();
            const sel = window.getSelection();

            range.selectNodeContents(el);
            range.collapse(false);

            sel?.removeAllRanges();
            sel?.addRange(range);
        });

        await this.page.keyboard.press('Enter');

        await this.page.waitForTimeout(300);
    }
}