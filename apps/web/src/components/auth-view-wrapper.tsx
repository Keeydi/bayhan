'use client'

import { AuthView } from '@daveyplate/better-auth-ui'

export function AuthViewWrapper({ path }: { path: string }) {
    return <AuthView path={ path } />
}