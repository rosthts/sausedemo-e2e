import { expect, test } from "../fixtures";

test.describe('Checkout', () => {
    test('should checkout successfully', async ({ pages}) => {
        await pages.loginAs('standardUser');
        const itemNames = await pages.inventoryPage.getInventoryItemNames();
        const itemName = itemNames[0];
        await pages.inventoryPage.addToCartByItemName(itemName);
        await pages.inventoryPage.cartBadge.goToCartPage();
        await pages.cartPage.goToCheckout();
        await pages.checkoutPage.checkoutInfoStep.fillCheckoutInfo('John', 'Doe', '12345');
        await pages.checkoutPage.checkoutInfoStep.clickContinueButton();
        await pages.checkoutPage.checkoutOverviewStep.clickFinishButton();
        await expect(pages.checkoutPage.successMessage, 'Success message is visible').toBeVisible();
    });
});