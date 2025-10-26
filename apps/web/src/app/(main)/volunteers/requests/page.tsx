import RequestsTable from '@components/tables/requests'
import React from 'react'
import { hasPermission } from '@actions/auth'
import { forbidden } from 'next/navigation'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Volunteer Requests' }

export default async function Page() {
    const permitted = await hasPermission({ resource: 'volunteer', action: 'read' })

    if (!permitted) {
        forbidden()
    }

    return (
        <div className='container mx-auto'>
            <div className='mb-6'>
                <h1 className='text-2xl font-bold'>Volunteer Requests</h1>
                <p className='text-muted-foreground'>Review and manage volunteer applications</p>
            </div>

            <RequestsTable />
        </div>
    )
}