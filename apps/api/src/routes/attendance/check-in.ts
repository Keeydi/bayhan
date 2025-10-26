import middlewares from '@middlewares'
import { checkIn } from '@controllers/attendance.controller'

export const post = [
    middlewares.authorize('attendance', 'write'),
    checkIn
]