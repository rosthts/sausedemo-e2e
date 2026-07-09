import { test as base } from "@playwright/test";
import { PageManager } from "../../src/pageManager";

type Fixtures = {
    pages: PageManager;
}

export const test = base.extend<Fixtures>({

    pages: async ({ page }, use) => {
        const pages = new PageManager(page);
        await use(pages);
    }
});

export { expect } from '@playwright/test'