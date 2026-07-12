import { APIRequestContext } from "@playwright/test";
import { UsersApiClient } from "./api/usersApiClient";

export class ApiManager {
    private _usersApi?: UsersApiClient;

    constructor(private readonly request: APIRequestContext) {}

    get usersApi(): UsersApiClient {
        if (!this._usersApi) this._usersApi = new UsersApiClient(this.request);
        return this._usersApi!;
    }
}