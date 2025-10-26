import { createAuthClient } from 'better-auth/react'
import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins'
import { ac, roles } from './auth'

export const createClient = (url: string) => {
    return createAuthClient({
        baseURL: url,
        plugins: [
            adminClient({ ac, roles }),
            inferAdditionalFields()
        ]
    })
}