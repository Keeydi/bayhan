import React from 'react'
import { IncidentsTable } from '@components/tables'
import { PermissionGuard } from '@components/auth'
import { IncidentModal } from '@components/modals'
import { hasPermission } from '@actions/auth'
import { forbidden } from 'next/navigation'
import { Metadata } from 'next'


export const metadata: Metadata = { title: 'Incidents' }

export default async function Page() {
    const permitted = await hasPermission({ resource: 'incident', action: 'read' })

    if (!permitted) {
        forbidden()
    }

    return (
        <div className='container mx-auto'>
            <div className='flex items-center justify-between mb-6'>
                <div>
                    <h1 className='text-2xl font-bold'>Incidents</h1>
                    <p className='text-muted-foreground'>Manage and track emergency incidents</p>
                </div>

                <PermissionGuard resource='incident' action='write'>
                    <IncidentModal />
                </PermissionGuard>
            </div>

            <PermissionGuard resource='incident' action='read'>
                <IncidentsTable />
            </PermissionGuard>
        </div>
    )
}
