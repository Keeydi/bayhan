import { env } from '@utils/env'
import { logger } from '@utils/logging'
import type { ErrorRequestHandler, RequestHandler } from 'express'
import { Response } from '@utils/response'

const unexpectedRequest: RequestHandler = (_req, res) => {
    res.respond(Response.notFound())
}

const addErrorToRequestLog: ErrorRequestHandler = (err, _req, res, next) => {
    res.locals.err = err

    if (err instanceof SyntaxError) {
        return res.respond(Response.badRequest({ message: err.message }))
    }

    logger.error(err, `${ err }`)

    res.respond(Response.error({ error: (env.isProduction ? err.message : err) ?? 'An unexpected error occurred' }))

    next(err)
}

export const errorHandler = [ unexpectedRequest, addErrorToRequestLog ]