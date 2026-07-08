import { Locator, Page } from "@playwright/test";
import { BasePage } from "./basePage";
import { SortOption, SortOptions } from "../utils/sortOptions";

export class InventoryPage extends BasePage {

    public readonly inventoryList: Locator;
    public readonly inventoryDropdown: Locator;
    public readonly inventoryItemName: Locator;
    public readonly inventoryItemPrice: Locator;

    constructor(page: Page) {
        super(page);
        this.inventoryList = page.getByTestId('inventory-list');
        this.inventoryDropdown = page.getByTestId('product-sort-container');
        this.inventoryItemName = page.getByTestId('inventory-item-name');
        this.inventoryItemPrice = page.getByTestId('inventory-item-price');
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
}