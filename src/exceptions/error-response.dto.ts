export class ErrorResponseDto extends Error {
    constructor(
        public status: number,
        public error: string,
        public message: string,
        public validationErrors?: string[]
    ) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
    }
}