import middlewares from '@middlewares'
import { getIncidentLocationData } from '@controllers/incidents.controller'

export const get = [
    middlewares.authorize('location', 'read'),
    getIncidentLocationData
]