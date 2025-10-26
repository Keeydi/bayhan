'use client'

import React from 'react'
import { Action, Resource } from '@repo/auth'
import { useCheckPermission } from '@hooks/use-auth'

interface PermissionGuardProps<T extends Resource> extends React.PropsWithChildren {
    resource: T
    action: Action<T> | Action<T>[]
    fallback?: React.ReactNode
}

export function PermissionGuard<T extends Resource>({
    resource,
    action,
    children,
    fallback = null
}: PermissionGuardProps<T>) {
    const { hasPermission, loading } = useCheckPermission(resource, action)

    // Show fallback while loading or if user doesn't have permission
    if (loading) {
        return <>{fallback}</>
    }

    if (!hasPermission) {
        return <>{fallback}</>
    }

    return (
        <>{children}</>
    )
}