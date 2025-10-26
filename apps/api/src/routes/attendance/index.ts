import middlewares from '@middlewares'
import { getTodayAttendance } from '@controllers/attendance.controller'

export const get = [
    middlewares.authorize('attendance', 'read'),
    getTodayAttendance
]
