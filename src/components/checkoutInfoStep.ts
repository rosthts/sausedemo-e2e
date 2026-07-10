import { Locator, Page } from "@playwright/test";

export class CheckoutInfoStep {
    public readonly firstNameInput: Locator;
    public readonly lastNameInput: Locator;
    public readonly postalCodeInput: Locator;
    public readonly continueButton: Locator;
    public readonly cancelButton: Locator;
    constructor(private page: Page) {
        this.firstNameInput = page.getByTestId('firstName');
        this.lastNameInput = page.getByTestId('lastName');
        this.postalCodeInput = page.getByTestId('postalCode');
        this.continueButton = page.getByRole('button', { name: 'Continue' });
        this.cancelButton = page.getByRole('button', { name: 'Cancel' });

    }

    async fillCheckoutInfo(firstName: string, lastName: string, postalCode: string) {
        await this.firstNameInput.fill(firstName);
        await this.lastNameInput.fill(lastName);
        await this.postalCodeInput.fill(postalCode);
    }

    async clickContinueButton() {
        await this.continueButton.click();
    }

    async clickCancelButton() {
        await this.cancelButton.click();
    }
}   