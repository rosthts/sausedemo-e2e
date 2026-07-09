import { Page } from "@playwright/test";
import { LoginPage } from "./pages/loginPage";
import { InventoryPage } from "./pages/inventoryPage";
import { usersCredentials } from "./utils/usersCredentials";
import { CartPage } from "./pages/cartPage";

export class PageManager {
    private _loginPage?: LoginPage;
    private _inventoryPage?: InventoryPage;
    private _cartPage?: CartPage
        
    constructor(private page: Page) {}
        
        get loginPage(): LoginPage {
          if (!this._loginPage) this._loginPage = new LoginPage(this.page);
          return this._loginPage;
        }

        get inventoryPage(): InventoryPage {
          if (!this._inventoryPage) this._inventoryPage = new InventoryPage(this.page);
          return this._inventoryPage;
        }

        get cartPage(): CartPage {
          if (!this._cartPage) this._cartPage = new CartPage(this.page);
          return this._cartPage;
        }

        async loginAs(user: keyof typeof usersCredentials) {
          await this.loginPage.open();
          await this.loginPage.login(usersCredentials[user].username, usersCredentials[user].password);
        }
}