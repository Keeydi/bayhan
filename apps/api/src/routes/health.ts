import { Handler } from 'express'

export const get: Handler = async (req, res) => {
    return res.json({
        status: 'ok',
        method: req.method,
        timestamp: new Date().toISOString()
    });
}