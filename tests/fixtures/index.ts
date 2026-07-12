import { test as base } from "@playwright/test";
import { PageManager } from "../../src/pageManager";
import { ApiManager } from "../../src/apiManager";

type Fixtures = {
    pages: PageManager;
    api: ApiManager;
}

export const test = base.extend<Fixtures>({

    pages: async ({ page }, use) => {
        const pages = new PageManager(page);
        await use(pages);
    },

    api: async ({ request }, use) => {
        const api = new ApiManager(request);
        await use(api);
    },
});

export { expect } from '@playwright/test'