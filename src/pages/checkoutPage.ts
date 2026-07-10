import { Locator, Page } from "@playwright/test";
import { CheckoutInfoStep } from "../components/checkoutInfoStep";
import { CheckoutOverviewStep } from "../components/checkoutOverviewStep";
import { BasePage } from "./basePage";

export class CheckoutPage extends BasePage {
    public readonly checkoutInfoStep: CheckoutInfoStep;
    public readonly checkoutOverviewStep: CheckoutOverviewStep;
    public readonly successMessage: Locator;
    constructor(page: Page) {
        super(page);
        this.checkoutInfoStep = new CheckoutInfoStep(page);
        this.checkoutOverviewStep = new CheckoutOverviewStep(page);
        this.successMessage = page.getByTestId('complete-header');
    }

    async open() {
        await this.page.goto('/checkout-step-one.html');
    }
}