'use client'

import { IncidentModal } from '@components/modals'
import { PermissionGuard } from '@components/auth'
import { RoleGuard } from '@components/auth/role-guard'

export function IncidentModalWrapper() {
    return (
        <PermissionGuard resource='incident' action='write'>
            <RoleGuard roles={ ['cdrrmo'] }>
                <IncidentModal />
            </RoleGuard>
        </PermissionGuard>
    )
}

