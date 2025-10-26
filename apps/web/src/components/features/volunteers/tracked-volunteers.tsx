'use client'

import React, { useState } from 'react'
import { Card } from '@components/ui/card'
import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import { Clock, RefreshCw, Users, Wifi, WifiOff } from 'lucide-react'
import { useLocationUpdates } from '@hooks/use-location-updates'
import { cn } from '@lib/utils'
import { useRouter } from 'next/navigation'

type VolunteerStatus = 'active' | 'inactive' | 'on-mission'

function StatusBadge({ status }: { status: VolunteerStatus }) {
    const color = status === 'active'
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        : status === 'on-mission'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    return <Badge variant='secondary' className={ color }>{ status }</Badge>
}

interface TrackedVolunteersProps {
    incidentId?: string
    useLiveTracking?: boolean
}

function formatTimeAgo(timestamp: string): string {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${ Math.floor(diffInSeconds / 60) }m ago`
    if (diffInSeconds < 86400) return `${ Math.floor(diffInSeconds / 3600) }h ago`
    return `${ Math.floor(diffInSeconds / 86400) }d ago`
}

function getLocationStatus(lastUpdated: string): 'fresh' | 'stale' | 'old' {
    const now = new Date()
    const time = new Date(lastUpdated)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

    if (diffInMinutes < 5) return 'fresh'
    if (diffInMinutes < 30) return 'stale'
    return 'old'
}

export function TrackedVolunteers({ incidentId, useLiveTracking = true }: TrackedVolunteersProps) {
    const router = useRouter()
    const [ isRefreshing, setIsRefreshing ] = useState(false)
    const { volunteers, isConnected, subscribeToIncident, unsubscribeFromIncident } = useLocationUpdates({
        incidentId,
        subscribeToIncident: useLiveTracking && !!incidentId
    })

    const handleRefresh = async () => {
        setIsRefreshing(true)
        try {
            if (incidentId && useLiveTracking) {
                unsubscribeFromIncident(incidentId)
                await new Promise(resolve => setTimeout(resolve, 100))
                subscribeToIncident(incidentId)
            }

            router.refresh()
        } catch (error) {
            console.error('Failed to refresh volunteer data:', error)
        } finally {
            setTimeout(() => setIsRefreshing(false), 1000)
        }
    }

    return (
        <Card className='p-4 space-y-4 border-none'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <Users className='h-4 w-4 text-muted-foreground' />
                    <span className='text-sm font-medium'>Volunteers</span>
                    { useLiveTracking && (
                        <div className='flex items-center gap-1'>
                            { isConnected ? (
                                <Wifi className='h-3 w-3 text-green-800 dark:text-green-500 animate-pulse' />
                            ) : (
                                <WifiOff className='h-3 w-3 text-destructive' />
                            ) }
                        </div>
                    ) }
                </div>
                <Button
                    variant='ghost'
                    size='icon'
                    onClick={ handleRefresh }
                    disabled={ isRefreshing }
                    title='Refresh volunteer locations'
                    className='transition-transform duration-200'
                >
                    <RefreshCw className={ cn(
                        'h-4 w-4 transition-transform duration-300',
                        isRefreshing && 'animate-spin'
                    ) } />
                </Button>
            </div>

            <div className='space-y-3 max-h-[560px] overflow-auto pr-2'>
                { volunteers.length === 0 ? (
                    <div className='text-center py-8 text-muted-foreground'>
                        <Users className='h-8 w-8 mx-auto mb-2 opacity-50' />
                        <p className='text-sm'>No volunteers tracked</p>
                        { useLiveTracking && !isConnected && (
                            <p className='text-xs mt-1'>Connect to see live updates</p>
                        ) }
                    </div>
                ) : (
                    volunteers.map(v => {
                        const locationStatus = getLocationStatus(v.lastUpdated)
                        const timeAgo = formatTimeAgo(v.lastUpdated)

                        return (
                            <div key={ v.id }
                                 className='flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors'>
                                <div className='min-w-0 flex-1'>
                                    <div className='flex items-center gap-2'>
                                        <p className='text-sm font-medium truncate'>{ v.name }</p>
                                        <div className={ cn(
                                            'w-2 h-2 rounded-full',
                                            locationStatus === 'fresh' && 'bg-green-500',
                                            locationStatus === 'stale' && 'bg-yellow-500',
                                            locationStatus === 'old' && 'bg-red-500'
                                        ) } />
                                    </div>
                                    <p className='text-xs text-muted-foreground'>
                                        { v.lat.toFixed(4) }, { v.lng.toFixed(4) }
                                    </p>
                                    <div className='flex items-center gap-1 mt-1'>
                                        <Clock className='h-3 w-3 text-muted-foreground' />
                                        <span className='text-xs text-muted-foreground'>{ timeAgo }</span>
                                    </div>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <StatusBadge status={ v.status } />
                                </div>
                            </div>
                        )
                    })
                ) }
            </div>
        </Card>
    )
}
