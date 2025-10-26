import { RequestHandler } from 'express'
import { Response } from '@utils/response'

export const responseMiddleware: RequestHandler = (req, res, next) => {
    res.respond = <T>(body: Response<T>) => {
        let sanitizedBody = Object.fromEntries(Object.entries(body).filter(([ _, v ]) => v !== undefined));
        res.status(body.code).json(sanitizedBody);
    }

    next()
}