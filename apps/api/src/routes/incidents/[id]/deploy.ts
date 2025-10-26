import middlewares from '@middlewares'
import { deployVolunteers } from '@controllers/incidents.controller'

export const post = [
    middlewares.authorize('incident', 'deploy'),
    deployVolunteers
]