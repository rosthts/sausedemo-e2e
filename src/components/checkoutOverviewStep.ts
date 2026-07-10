import { Locator, Page } from "@playwright/test";

export class CheckoutOverviewStep {
    public readonly finishButton: Locator;
    public readonly cancelButton: Locator;
    public readonly totalPrice: Locator;


    constructor(private page: Page) {
        this.finishButton = page.getByRole('button', { name: 'Finish' });
        this.cancelButton = page.getByRole('button', { name: 'Cancel' });
        this.totalPrice = page.getByTestId('totalPrice');
    }

    async clickFinishButton() {
        await this.finishButton.click();
    }

    async clickCancelButton() {
        await this.cancelButton.click();
    }

    async getTotalPrice(): Promise<string> {
       const totalPrice = await this.totalPrice.innerText();
       return totalPrice.replace('Total: $', '').trim();
    }
}