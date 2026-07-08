import { test as base } from "@playwright/test";
import { LoginPage } from "../../src/pages/loginPage";
import { InventoryPage } from "../../src/pages/inventoryPage";
import { usersCredentials } from "../../src/utils/usersCredentials";

type Fixtures = {
    loginPage: LoginPage;
    inventoryPage: InventoryPage;
}

export const test = base.extend<Fixtures>({
    loginPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await loginPage.open();
        await use(loginPage);
    },

    inventoryPage: async ({ page, loginPage }, use) => {
        await loginPage.login(
            usersCredentials.standardUser.username,
            usersCredentials.standardUser.password
        );
        const inventoryPage = new InventoryPage(page);
        await use(inventoryPage);
    },
});

export { expect } from '@playwright/test'