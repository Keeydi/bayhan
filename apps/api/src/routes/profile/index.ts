import middlewares from '@middlewares'
import { createProfile, getProfile, updateProfile } from '@controllers/profile.controller'

export const get = [
    middlewares.authorize('profile', 'read'),
    getProfile
]

export const post = [
    middlewares.authorize('profile', 'write'),
    createProfile
]

export const patch = [
    middlewares.authorize('profile', 'write'),
    updateProfile
]
