import { Locator, Page } from "@playwright/test";

export class CartBadge {
    public readonly shoppingCartBadge: Locator;
    public readonly shoppingCartLink: Locator;

    constructor(private page: Page) {
        this.shoppingCartBadge = page.getByTestId('shopping-cart-badge');
        this.shoppingCartLink = page.getByTestId('shopping-cart-link');
    }

    async getShoppingCartBadgeText(): Promise<string> {
        const text = await this.shoppingCartBadge.innerText();
        return text.trim();
    }

    async goToCartPage() {
        await this.shoppingCartLink.click();
    }
}