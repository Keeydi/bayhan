import { createLocationLog, getLocationLogs } from '@controllers/locations.controller'
import middlewares from '@middlewares'

export const get = [
    middlewares.authorize('location', 'read'),
    getLocationLogs
]

export const post = [
    middlewares.authorize('location', 'write'),
    createLocationLog
]