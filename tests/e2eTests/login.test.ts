import { usersCredentials } from "../../src/utils/usersCredentials";
import { errorMessages } from "../../src/utils/errorMessages";
import { expect, test } from "../fixtures";

test.describe('Login', () => {
    test('should login with valid credentials', 
        {tag: ['@smoke', '@regression']}, 
        async ({ loginPage }) => {
        await loginPage.login(usersCredentials.standardUser.username, usersCredentials.standardUser.password);
        await expect(loginPage.currentPage, 'User should be on the inventory page').toHaveURL('/inventory.html');
    })
})

test.describe('Negative login scenarios', () => {
    test('should show error for locked out user', 
        {tag: ['@regression']}, 
        async ({ loginPage }) => {
        await loginPage.login(usersCredentials.lockedOutUser.username, usersCredentials.lockedOutUser.password);
        const errorMessage = await loginPage.getErrorMessage();
        await expect(loginPage.currentPage, 'User should be on the login page').toHaveURL('');
        expect(errorMessage, 'Error message should be displayed').toContain(errorMessages.lockedOutUser);
    });

    const negativeLoginScenarios = [
        {
            testName: 'empty credentials',
            username: '',
            password: '',
            errorMessage: errorMessages.emptyUsername
        },
        {
            testName: 'empty password',
            username: usersCredentials.standardUser.username,
            password:  '',
            errorMessage: errorMessages.emptyPassword
        },
        {
            testName: 'empty username',
            username: '',
            password: usersCredentials.standardUser.password,
            errorMessage: errorMessages.emptyUsername
        },
        {
            testName: 'invalid username',
            username: 'invalid_username',
            password: usersCredentials.standardUser.password,
            errorMessage: errorMessages.invalidUsernameOrPassword
        },
        {
            testName: 'invalid password',
            username: usersCredentials.standardUser.username,
            password: 'invalid_password',
            errorMessage: errorMessages.invalidUsernameOrPassword
        },
    ];

    for (const scenario of negativeLoginScenarios) {
        test(`should show error for ${scenario.testName}`, 
            {tag: ['@regression']}, 
            async ({ loginPage }) => {
            await loginPage.login(scenario.username, scenario.password);
            const errorMessage = await loginPage.getErrorMessage();
            await expect(loginPage.currentPage, 'User should be on the login page').toHaveURL('');
            expect(errorMessage, 'Error message should be displayed').toContain(scenario.errorMessage);
        });
    }
});