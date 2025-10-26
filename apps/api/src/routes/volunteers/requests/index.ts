import middlewares from '@middlewares'
import { getVolunteerRequests } from '@controllers/volunteers.controller'

export const get = [
    middlewares.authorize('volunteer', 'read'),
    getVolunteerRequests
]