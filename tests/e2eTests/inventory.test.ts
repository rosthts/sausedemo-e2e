import { SortOptions } from "../../src/utils/sortOptions";
import { expect, test } from "../fixtures";

test.describe('Inventory', () => {
    test('should sort inventory items by price low to high', async ({ inventoryPage }) => {
        await inventoryPage.sortBy(SortOptions.PRICE_LOW_TO_HIGH);
        const actualPrices = await inventoryPage.getInventoryItemPrices();
        const expectedPrices = [...actualPrices].sort((a, b) => a - b);
        expect(actualPrices, 'Prices should be sorted in ascending order').toEqual(expectedPrices);
    });

    test('should sort inventory items by name A to Z', async ({ inventoryPage }) => {
        await inventoryPage.sortBy(SortOptions.NAME_A_TO_Z);
        const actualNames = await inventoryPage.getInventoryItemNames();
        const expectedNames = [...actualNames].sort((a, b) => a.localeCompare(b));
        expect(actualNames, 'Names should be sorted in ascending order').toEqual(expectedNames);
    });

    test('should add item to cart', async ({ inventoryPage }) => {
        await test.step('Add item to cart', async () => {
            await inventoryPage.addToCartByItemName('Sauce Labs Backpack');
            const actualText = await inventoryPage.getShoppingCartBadgeText();
            expect(actualText, 'Shopping cart badge text should be 1').toEqual('1');
        });
        await test.step('Verify shopping cart badge text', async () => {
            await inventoryPage.addToCartByItemName('Sauce Labs Bolt T-Shirt');
            const actualText = await inventoryPage.getShoppingCartBadgeText();
            expect(actualText, 'Shopping cart badge text should be 2').toEqual('2');
        });
    });

});

   