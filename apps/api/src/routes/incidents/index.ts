import middlewares from '@middlewares'
import { getIncidents, reportIncident } from '@controllers/incidents.controller'

export const get = [
    middlewares.authorize('incident', 'read'),
    getIncidents
]

export const post = [
    middlewares.authorize('incident', 'write'),
    reportIncident
]