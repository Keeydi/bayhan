import middlewares from '@middlewares'
import { deleteVolunteer, getVolunteer } from '@controllers/volunteers.controller'

export const get = [
    middlewares.authorize('volunteer', 'read'),
    getVolunteer
]

export const del = [
    middlewares.authorize('volunteer', 'delete'),
    deleteVolunteer
]