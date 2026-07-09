export const config = {
    baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',
    timeout: Number(process.env.TIMEOUT ?? 30_000),
};