import { getDashboard } from '@controllers/dashboard.controller'
import middlewares from '@middlewares'

export const get = [
    middlewares.authorize('dashboard', 'read'),
    getDashboard
]
