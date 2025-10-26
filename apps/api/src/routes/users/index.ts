import middlewares from '@middlewares'
import { createUser, getAllUsers } from '@controllers/users.controller'

export const get = [ middlewares.authorize('user', 'read'), getAllUsers ]

export const post = [ middlewares.authorize('user', 'write'), createUser ]
