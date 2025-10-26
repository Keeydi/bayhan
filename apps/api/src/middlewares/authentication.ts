import { RequestHandler } from 'express'
import { Response } from '@utils/response'
import { Action, Resource } from '@repo/auth'
import { auth } from '@src/lib/auth'
import { fromNodeHeaders } from 'better-auth/node'
import { Session, User } from '@repo/database'
import { Role } from '@src/types/user'

export const authenticate: RequestHandler = async (req, res, next) => {
    const result = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) })

    if (!result) {
        return res.respond(Response.unauthorized({ message: 'Authentication required' }))
    }

    const { user, session } = result

    req.user = user as User
    req.session = session as Session

    next()
}

export const authorize = <T extends Resource>(resource: T, action: Action<T> | Action<T>[]): RequestHandler[] => {
    return [
        authenticate,
        async (req, res, next) => {
            const { user } = req

            if (!user.role) {
                return res.respond(Response.forbidden({ message: 'Permission denied' }))
            }

            const actions = Array.isArray(action) ? action : [ action ]

            const { error, success: hasPermission } = await auth.api.userHasPermission({
                body: {
                    userId: user.id,
                    role: user.role as typeof Role[keyof typeof Role],
                    permissions: { [resource]: actions }
                }
            })

            if (error) {
                return res.respond(Response.error({ message: 'Authorization error', error }))
            }

            if (!hasPermission) {
                return res.respond(Response.forbidden({ message: 'Permission denied' }))
            }

            next()
        }
    ]
}
