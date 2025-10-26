import { getVolunteers } from '@controllers/volunteers.controller'
import middlewares from '@middlewares'

export const get = [
    middlewares.authorize('volunteer', 'read'),
    getVolunteers
]