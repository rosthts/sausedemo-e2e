import { Page } from "@playwright/test";

export abstract class BasePage {
    constructor(protected page: Page) {
    }

    abstract open(): Promise<void>;

    get currentPage() {
        return this.page;
    }
}