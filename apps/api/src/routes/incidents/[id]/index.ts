import middlewares from '@middlewares'
import { getIncidentById } from '@controllers/incidents.controller'

export const get = [
    middlewares.authorize('incident', 'read'),
    getIncidentById
]
