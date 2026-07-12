import { APIRequestContext } from "@playwright/test";
import { API } from "./types";

export class UsersApiClient {
    constructor(private readonly request: APIRequestContext) {}

    async getUserById(data: {id: number}): Promise<API.GetUserResponse> {
        const response = await this.request.get(`/users/${data.id}`);
        return response.json();
    }
}