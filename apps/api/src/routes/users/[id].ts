import middlewares from '@middlewares'
import { deleteUserById, getUserById, updateUser } from '@controllers/users.controller'

export const get = [ middlewares.authorize('user', 'read'), getUserById ]

export const put = [ middlewares.authorize('user', 'update'), updateUser ]

export const del = [ middlewares.authorize('user', 'delete'), deleteUserById ]
