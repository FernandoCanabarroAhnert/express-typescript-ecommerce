import { BaseErrorException } from "./base-error.exception";

export class ConflictException extends BaseErrorException {
    constructor(message: string) {
        super(409, "Conflict", message);
    }
}