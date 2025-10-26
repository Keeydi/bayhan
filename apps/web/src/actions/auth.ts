'use server'

import { cookies } from 'next/headers'
import { auth } from '@lib/auth'
import { redirect as next } from 'next/navigation'
import { Action, Resource } from '@repo/auth'

interface GetSessionOptions {
    redirect?: string | boolean
}

const getCookies = async () => {
    const cookieStore = await cookies()
    return cookieStore
        .getAll()
        .map((cookie) => `${ cookie.name }=${ cookie.value }`)
        .join('; ')
}

const authGetSession = async () => {
    const cookie = await getCookies()
    return auth.getSession({ fetchOptions: { headers: { Cookie: cookie } } })
}

type SessionResult = Awaited<ReturnType<typeof authGetSession>>
type GuaranteedSessionResult = { data: NonNullable<SessionResult['data']>, error: SessionResult['error'] }

export async function getSession(): Promise<GuaranteedSessionResult>
export async function getSession(options: { redirect: string | true }): Promise<GuaranteedSessionResult>
export async function getSession(options: { redirect: false }): Promise<SessionResult>
export async function getSession(options: GetSessionOptions = {}): Promise<SessionResult | GuaranteedSessionResult> {
    const { redirect = '/auth/login' } = options

    const { data, error } = await authGetSession()

    if (error) throw error

    if (!data && redirect) {
        return next(typeof redirect === 'string' ? redirect : '/auth/login')
    }

    return { data, error }
}

interface HasPermissionOptions<T extends Resource> {
    userId?: string
    resource: T,
    action: Action<T> | Action<T>[]
}

// TODO: optimize to reduce calls, use a context or a global store to cache permissions
export const hasPermission = async <T extends Resource>({ userId, resource, action }: HasPermissionOptions<T>) => {
    const actions = Array.isArray(action) ? action : [ action ]
    const cookie = await getCookies()

    let currentUserId = userId
    if (!currentUserId) {
        const { data: sessionData } = await authGetSession()
        if (!sessionData?.user?.id) {
            return false
        }
        currentUserId = sessionData.user.id
    }

    const { data, error } = await auth.admin.hasPermission({
        userId: currentUserId,
        permissions: { [resource]: actions },
        fetchOptions: { headers: { Cookie: cookie } }
    })

    if (!data) return false

    if (error || data.error) throw error

    return data.success
}