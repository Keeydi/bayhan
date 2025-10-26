import middlewares from '@middlewares'
import { checkOut } from '@controllers/attendance.controller'

export const post = [
    middlewares.authorize('attendance', 'write'),
    checkOut
]