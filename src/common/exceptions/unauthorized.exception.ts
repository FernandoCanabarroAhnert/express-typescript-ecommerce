import { BaseErrorException } from "./base-error.exception";

export class UnauthorizedException extends BaseErrorException {
    constructor(message: string) {
        super(401, "Unauthorized", message);
    }
}