import { expect, test } from "../fixtures";

test.describe('Cart', () => {
    test('should add item to cart', async ({ pages }) => {
        await pages.loginAs('standardUser');
        const itemNames = await pages.inventoryPage.getInventoryItemNames();
        const itemName = itemNames[0];
        await pages.inventoryPage.addToCartByItemName(itemName);
        await pages.inventoryPage.goToCartPage();
        const cartItemNames = await pages.cartPage.getCartItemNames();
        expect(cartItemNames, `Cart item names should be ${itemName}`).toEqual([itemName]);
    });
});