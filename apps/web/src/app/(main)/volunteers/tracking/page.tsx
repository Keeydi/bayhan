import React from 'react'
import { Card } from '@components/ui/card'
import { AttendanceActions, TrackedVolunteers, TrackingMap } from '@components/features'
import { PermissionGuard } from '@components/auth'

export default async function Page() {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    return (
        <div className='space-y-4'>
            <PermissionGuard resource='attendance' action='write'>
                <AttendanceActions />
            </PermissionGuard>

            <PermissionGuard resource='volunteer' action='read'>
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
                    <Card className='p-4 lg:col-span-2 border-none'>
                        <TrackingMap
                            apiKey={ apiKey }
                            useLiveTracking
                        />
                    </Card>

                    <TrackedVolunteers
                        incidentId='123'
                        useLiveTracking
                    />
                </div>
            </PermissionGuard>
        </div>
    )
}
