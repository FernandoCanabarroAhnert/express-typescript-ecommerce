import { BaseErrorException } from "./base-error.exception"

export class ForbiddenException extends BaseErrorException {
    constructor(message: string) {
        super(403, "Forbidden", message);
    }
}