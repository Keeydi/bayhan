import 'express'
import { Response as ResponseObject } from '@utils/response'
import { z, ZodSafeParseResult, ZodType } from 'zod'
import { Server } from 'socket.io'
import { Session, User } from '@repo/database'

declare module 'express-serve-static-core' {
    interface Response {
        respond: <T>(body: ResponseObject<T>) => void;
    }

    interface Request {
        user: User;
        session: Session
        io: Server;
        parseBody: <T extends ZodType>(schema: T) => ZodSafeParseResult<z.output<T>>;
        parsedBody?: unknown;
        parsedParams?: unknown;
        parsedQuery?: unknown;
    }
}