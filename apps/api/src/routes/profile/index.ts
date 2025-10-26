import middlewares from '@middlewares'
import { createProfile, getProfile } from '@controllers/profile.controller'

export const get = [
    middlewares.authorize('profile', 'read'),
    getProfile
]

export const post = [
    middlewares.authorize('profile', 'write'),
    createProfile
]
