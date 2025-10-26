import middlewares from '@middlewares'
import { resolveIncident } from '@controllers/incidents.controller'

export const patch = [
    middlewares.authorize('incident', 'update'),
    resolveIncident
]