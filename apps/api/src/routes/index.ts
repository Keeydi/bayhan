import { Handler } from 'express'
import { Response } from '@utils/response'

export const get: Handler = async (req, res) => {
    res.respond(Response.success({ message: 'Welcome to the API!' }))
}