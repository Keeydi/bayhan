'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@hooks/use-auth'

interface AuthGuardProps extends React.PropsWithChildren {
    redirectTo?: string
    fallback?: React.ReactNode
}

export function AuthGuard({ redirectTo, children, fallback = null }: AuthGuardProps) {
    const router = useRouter()
    const { isLoading, isAuthenticated } = useAuth()

    useEffect(() => {
        if (isLoading || isAuthenticated || !redirectTo) return

        router.push(redirectTo)

    }, [ isLoading, isAuthenticated, redirectTo, router ]);

    if (isLoading) {
        return <>{ fallback }</>
    }

    if (!isAuthenticated) {
        return redirectTo ? <>{ fallback }</> : null
    }

    return (
        <>{ children }</>
    )
}