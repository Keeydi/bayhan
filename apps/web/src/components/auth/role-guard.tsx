'use client'

import React from 'react'
import { useRole } from '@hooks/use-auth'

interface RoleGuardProps extends React.PropsWithChildren {
    roles: string | string[]
    fallback?: React.ReactNode
}

export function RoleGuard({ roles, children, fallback = null }: RoleGuardProps) {
    const role = useRole()

    const allowedRoles = Array.isArray(roles) ? roles : [ roles ]

    if (!role || !allowedRoles.includes(role)) {
        return <>{ fallback }</>
    }

    return (
        <>{ children }</>
    )
}