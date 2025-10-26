import { z, ZodType } from 'zod'
import { NextFunction, Request, RequestHandler, Response as ExpressResponse } from 'express'
import { ErrorCode, Response } from '@utils/response'
import { Server } from 'socket.io'

export interface TypedRequest<TParams extends ZodType, TQuery extends ZodType, TBody extends ZodType> extends Request {
    parsedParams: z.infer<TParams>
    parsedQuery: z.infer<TQuery>
    parsedBody: z.infer<TBody>
}

export type TypedRequestHandler<TParams extends ZodType, TQuery extends ZodType, TBody extends ZodType> = (
    req: TypedRequest<TParams, TQuery, TBody>,
    res: ExpressResponse,
    next: NextFunction
) => void | Promise<void>

export const requestMiddleware: RequestHandler = (req, res, next) => {
    req.parseBody = <T extends ZodType>(schema: T) => schema.safeParse(req.body)
    next()
}

const EmptySchema = z.object({})
type EmptySchemaType = typeof EmptySchema

export interface ValidateRequestOptions<TParams extends ZodType, TQuery extends ZodType, TBody extends ZodType> {
    params?: TParams
    query?: TQuery
    body?: TBody
    handler: TypedRequestHandler<TParams, TQuery, TBody>
}

export const validateRequest = <
    TParams extends ZodType = EmptySchemaType,
    TQuery extends ZodType = EmptySchemaType,
    TBody extends ZodType = EmptySchemaType
>({
    params = EmptySchema as unknown as TParams,
    query = EmptySchema as unknown as TQuery,
    body = EmptySchema as unknown as TBody,
    handler
}: ValidateRequestOptions<TParams, TQuery, TBody>): RequestHandler => {
    return async (req, res, next) => {
        const paramsResult = params.safeParse(req.params || {})

        if (!paramsResult.success) {
            return res.respond(Response.badRequest({
                message: 'Invalid parameters',
                error: paramsResult.error?.issues
            }))
        }

        const queryResult = query.safeParse(req.query || {})
        if (!queryResult.success) {
            return res.respond(Response.badRequest({
                message: 'Invalid query parameters',
                error: queryResult.error?.issues
            }))
        }

        const bodyResult = body.safeParse(req.body || {})
        if (!bodyResult.success) {
            return res.respond(Response.badRequest({
                message: 'Invalid request body',
                error: bodyResult.error?.issues,
                errorCode: ErrorCode.VALIDATION_ERROR
            }))
        }

        req.parsedParams = paramsResult.data
        req.parsedQuery = queryResult.data
        req.parsedBody = bodyResult.data

        await handler(req as TypedRequest<TParams, TQuery, TBody>, res, next)
    }
}

export const validateRequestBody = <TBody extends ZodType>(bodySchema: TBody, handler: TypedRequestHandler<EmptySchemaType, EmptySchemaType, TBody>): RequestHandler => {
    return validateRequest({
        body: bodySchema,
        handler
    })
}

export const validateRequestParams = <TParams extends ZodType>(paramsSchema: TParams, handler: TypedRequestHandler<TParams, EmptySchemaType, EmptySchemaType>): RequestHandler => {
    return validateRequest({
        params: paramsSchema,
        handler
    })
}

export const validateRequestQuery = <TQuery extends ZodType>(querySchema: TQuery, handler: TypedRequestHandler<EmptySchemaType, TQuery, EmptySchemaType>): RequestHandler => {
    return validateRequest({
        query: querySchema,
        handler
    })
}

export const addIoToRequest = (io: Server): RequestHandler => (req, res, next) => {
    req.io = io

    next()
}