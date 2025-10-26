import middlewares from '@middlewares'
import { rejectVolunteerRequest } from '@controllers/volunteers.controller'

export const patch = [
    middlewares.authorize('volunteer', 'manage'),
    rejectVolunteerRequest
]