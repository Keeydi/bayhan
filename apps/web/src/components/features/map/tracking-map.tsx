'use client'

import React from 'react'
import { APIProvider, Map as GoogleMap } from '@vis.gl/react-google-maps'
import { CustomVolunteerMarker } from '@components/features'
import { useLocationUpdates, type VolunteerLocation } from '@hooks/use-location-updates'
import { Wifi, WifiOff } from 'lucide-react'

interface TrackingMapProps {
    apiKey?: string
    incidentId?: string
    useLiveTracking?: boolean
}

export function TrackingMap({ apiKey, incidentId, useLiveTracking = true }: TrackingMapProps) {
    const { volunteers, isConnected } = useLocationUpdates({
        incidentId,
        subscribeToIncident: useLiveTracking && !!incidentId
    })

    if (!apiKey) {
        return (
            <div className='flex flex-col items-center justify-center h-[600px] rounded-md border bg-muted'>
                <p className='text-sm text-muted-foreground'>Google Maps API key not configured</p>
            </div>
        )
    }

    return (
        <APIProvider apiKey={ apiKey } libraries={ [ 'marker' ] }>
            <div className='w-full h-[600px] rounded-md overflow-hidden border relative'>
                { useLiveTracking && (
                    <div className='absolute top-4 right-4 z-10'>
                        <div
                            className='w-8 h-8 rounded-full bg-background backdrop-blur-sm border border-white/20 flex items-center justify-center'>
                            { isConnected ? (
                                <Wifi className='h-4 w-4 text-green-800 dark:text-green-500 animate-pulse' />
                            ) : (
                                <WifiOff className='h-4 w-4 text-destructive' />
                            ) }
                        </div>
                    </div>
                ) }


                <GoogleMap
                    defaultCenter={ { lat: 14.5995, lng: 120.9842 } }
                    defaultZoom={ 12 }
                    mapId='volunteers-tracking-map'
                    gestureHandling='cooperative'
                    disableDefaultUI={ true }
                    zoomControl={ true }
                >
                    { volunteers.map(v => (
                        <CustomVolunteerMarker
                            key={ v.id }
                            volunteer={ v }
                            onClick={ (volunteer: VolunteerLocation) => {
                                console.log('Clicked volunteer:', volunteer.name)
                            } }
                        />
                    )) }
                </GoogleMap>
            </div>
        </APIProvider>
    )
}
