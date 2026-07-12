import { expect, test } from "../fixtures"

test.describe('Users API', () => {
    test('should get user by id', async ({ api }) => {
        const user = await api.usersApi.getUserById({ id: 1 });
        expect(user.id).toBe(1);
    });
});