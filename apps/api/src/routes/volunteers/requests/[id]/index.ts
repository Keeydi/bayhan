import middlewares from '@middlewares'
import { deleteVolunteerRequest, getVolunteerRequest } from '@controllers/volunteers.controller'

export const get = [
    middlewares.authorize('volunteer', 'read'),
    getVolunteerRequest
]

export const del = [
    middlewares.authorize('volunteer', 'delete'),
    deleteVolunteerRequest
]