import { BaseErrorException } from "./base-error.exception";

export class BadRequestException extends BaseErrorException {
    constructor(message: string, validationErrors?: string[]) {
        super(400, "Bad Request", message, validationErrors);
    }
}