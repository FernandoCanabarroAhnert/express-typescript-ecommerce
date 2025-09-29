export class BaseErrorException extends Error {
    constructor(
        public status: number,
        public error: string,
        public message: string,
        public validationErrors?: string[]
    ) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            status: this.status,
            error: this.error,
            message: this.message
        };
    }
}