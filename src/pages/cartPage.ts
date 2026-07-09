import { Locator, Page } from "@playwright/test";
import { BasePage } from "./basePage";
import { ItemNotFoundError } from "../errors/itemNotFoundError";

export class CartPage extends BasePage {
    public readonly cartItemName: Locator;
    public readonly checkoutButton: Locator;
    constructor(page: Page) {
        super(page);
        this.cartItemName = page.getByTestId('inventory-item-name');
        this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
    }

    async open() {
        await this.page.goto('/cart.html');
    }

    async getCartItemNames(): Promise<string[]> {
        return await this.cartItemName.allInnerTexts();
    }

    async removeItemByName(itemName: string) {
        const item = this.cartItemName.filter({ hasText: itemName });
        if ((await item.count()) === 0) {
            throw new ItemNotFoundError(`Item with name ${itemName} not found`);
        }
        await item.getByRole('button', { name: 'Remove' }).click();
    }

    async goToCheckout() {
        await this.checkoutButton.click();
    }


}