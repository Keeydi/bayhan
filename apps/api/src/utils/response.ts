import { StatusCodes } from 'http-status-codes';

export enum ErrorCode {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    AUTH_REQUIRED = 'AUTH_REQUIRED',
    FORBIDDEN = 'FORBIDDEN',
    NOT_FOUND = 'NOT_FOUND',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    BAD_REQUEST = 'BAD_REQUEST',
    CREDENTIALS_REQUIRED = 'CREDENTIALS_REQUIRED'
}

type BaseParams = {
    message?: string;
    code?: StatusCodes;
};

type SuccessParams<T> = BaseParams & {
    data?: T;
};

type ErrorParams = BaseParams & {
    error?: string | Record<string, string> | object;
    errorCode?: ErrorCode;
};


export class Response<T = null> {
    readonly code: StatusCodes;
    readonly success: boolean;
    readonly message: string;
    readonly data?: T;
    readonly error?: string | Record<string, string> | object;
    readonly errorCode?: ErrorCode;

    private constructor(params: {
        code: StatusCodes;
        success: boolean;
        message: string;
        data?: T;
        error?: string | Record<string, string> | object;
        errorCode?: ErrorCode;
    }) {
        this.code = params.code;
        this.success = params.success;
        this.message = params.message;
        this.data = params.data;
        this.error = params.error;
        this.errorCode = params.errorCode;
    }

    static success<T>({ data, message = 'Success', code = StatusCodes.OK }: SuccessParams<T> = {}): Response<T> {
        return new Response({ code, message, success: true, data });
    }

    static error<T = null>({
        error,
        message = 'Internal Server Error',
        code = StatusCodes.INTERNAL_SERVER_ERROR,
        errorCode = ErrorCode.INTERNAL_ERROR
    }: ErrorParams): Response<T> {
        return new Response({ code, message, success: false, error, errorCode });
    }

    static notFound<T = null>({
        message = 'Resource not found',
        code = StatusCodes.NOT_FOUND
    }: BaseParams = {}): Response<T> {
        return new Response({ code, message, success: false, errorCode: ErrorCode.NOT_FOUND });
    }

    static badRequest<T = null>({
        message = 'Bad Request',
        code = StatusCodes.BAD_REQUEST,
        error = undefined
    }: ErrorParams): Response<T> {
        return new Response({ code, message, success: false, error, errorCode: ErrorCode.BAD_REQUEST });
    }

    static unauthorized<T = null>({
        message = 'Unauthorized',
        code = StatusCodes.UNAUTHORIZED
    }: BaseParams = {}): Response<T> {
        return new Response({ code, message, success: false, errorCode: ErrorCode.AUTH_REQUIRED });
    }

    static forbidden<T = null>({
        message = 'Forbidden',
        code = StatusCodes.FORBIDDEN
    }: BaseParams = {}): Response<T> {
        return new Response({ code, message, success: false, errorCode: ErrorCode.FORBIDDEN });
    }
}
