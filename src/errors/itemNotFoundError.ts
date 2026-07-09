import { AppError } from "./appError";

export class ItemNotFoundError extends AppError {
    constructor(message: string) {
        super(message);
        this.name = 'ItemNotFoundError';
    }
}