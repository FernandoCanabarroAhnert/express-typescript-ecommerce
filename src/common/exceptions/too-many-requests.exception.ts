import { BaseErrorException } from "./base-error.exception";

export class TooManyRequestsException extends BaseErrorException {
    constructor(message: string) {
        super(429, "Too Many Requests", message);
    }
}