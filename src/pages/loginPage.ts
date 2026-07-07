import { Locator, Page } from "@playwright/test";
import { BasePage } from "./basePage";

export class LoginPage extends BasePage {
    public readonly usernameInput: Locator;
    public readonly passwordInput: Locator;
    public readonly loginButton: Locator;
    private readonly errorMessage: Locator;

    constructor(page: Page) {
        super(page);
        this.usernameInput = page.getByTestId('username');
        this.passwordInput = page.getByTestId('password');
        this.loginButton = page.getByTestId('login-button');
        this.errorMessage = page.getByTestId('error');
    }

    async open() {
        await this.page.goto('');
    }

    async fillUsername(username: string) {
        await this.usernameInput.fill(username);
    }

    async fillPassword(password: string) {
        await this.passwordInput.fill(password);
    }

    async clickLogin() {
        await this.loginButton.click();
    }

    async login(username: string, password: string) {
        await this.fillUsername(username);
        await this.fillPassword(password);
        await this.clickLogin();
    }

    async getErrorMessage(): Promise<string> {
        return await this.errorMessage.innerText();
    }
}