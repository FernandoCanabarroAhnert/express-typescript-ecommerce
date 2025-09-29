import { BaseErrorException } from "./base-error.exception";

export class NotFoundException extends BaseErrorException {
    constructor(message: string) {
        super(404, "Not Found", message);
    }
}