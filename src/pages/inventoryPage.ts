import { Locator, Page } from "@playwright/test";
import { BasePage } from "./basePage";
import { SortOption, SortOptions } from "../utils/sortOptions";
import { ItemNotFoundError } from "../errors/itemNotFoundError";
import { CartPage } from "./cartPage";

export class InventoryPage extends BasePage {

    public readonly inventoryItem: Locator;
    public readonly inventoryDropdown: Locator;
    public readonly inventoryItemName: Locator;
    public readonly inventoryItemPrice: Locator;
    public readonly shoppingCartBadge: Locator;
    public readonly shoppingCartLink: Locator;

    constructor(page: Page) {
        super(page);
        this.inventoryItem = page.getByTestId('inventory-item');
        this.inventoryDropdown = page.getByTestId('product-sort-container');
        this.inventoryItemName = page.getByTestId('inventory-item-name');
        this.inventoryItemPrice = page.getByTestId('inventory-item-price');
        this.shoppingCartBadge = page.getByTestId('shopping-cart-badge');
        this.shoppingCartLink = page.getByTestId('shopping-cart-link');
    }

    async open() {
        await this.page.goto('/inventory.html');
    }

    async sortBy(sortOption: SortOption) {
        await this.inventoryDropdown.selectOption(sortOption);
    }

    async getInventoryItemNames(): Promise<string[]> {
        return await this.inventoryItemName.allInnerTexts();
    }

    async getInventoryItemPrices(): Promise<number[]> {
        const prices = await this.inventoryItemPrice.allInnerTexts();
        return prices.map((price) =>
            Number(price.replace('$', '').trim())
        );
    }

    async addToCartByItemName(itemName: string) {
        const item = this.inventoryItem.filter({ hasText: itemName });
        if ((await item.count()) === 0) {
            throw new ItemNotFoundError(`Item with name ${itemName} not found`);
        }
        await item.getByRole('button', { name: 'Add to cart' }).click();
    }

    async getShoppingCartBadgeText(): Promise<string> {
        const text = await this.shoppingCartBadge.innerText();
        return text.trim();
    }

    async goToCartPage() {
        await this.shoppingCartLink.click();
    }

}