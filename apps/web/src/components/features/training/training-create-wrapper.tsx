'use client'

import { TrainingCreate } from '@components/features'
import { PermissionGuard } from '@components/auth'
import { RoleGuard } from '@components/auth/role-guard'

export function TrainingCreateWrapper() {
    return (
        <PermissionGuard resource='training' action='write'>
            <RoleGuard roles={ ['cdrrmo'] }>
                <TrainingCreate />
            </RoleGuard>
        </PermissionGuard>
    )
}

