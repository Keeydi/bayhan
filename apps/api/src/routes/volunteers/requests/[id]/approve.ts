import middlewares from '@middlewares'
import { approveVolunteerRequest } from '@controllers/volunteers.controller'

export const patch = [
    middlewares.authorize('volunteer', 'manage'),
    approveVolunteerRequest
]