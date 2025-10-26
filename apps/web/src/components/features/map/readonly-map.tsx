'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { MapPin } from 'lucide-react'
import { AdvancedMarker, APIProvider, Map as GoogleMap, Pin } from '@vis.gl/react-google-maps'
import React from 'react'

interface ReadOnlyMapProps {
    lat: number
    lng: number
    address?: string
    title?: string
    height?: string
}

function ReadOnlyMapContent({ lat, lng, address, title = 'Location', height = '300px' }: ReadOnlyMapProps) {
    return (
        <CardContent className='space-y-4 border-none'>
            <div className='w-full rounded-lg border overflow-hidden' style={ { height } }>
                <GoogleMap
                    defaultCenter={ { lat, lng } }
                    defaultZoom={ 15 }
                    mapId='readonly-map'
                    gestureHandling='cooperative'
                    disableDefaultUI={ true }
                    zoomControl={ true }
                >
                    <AdvancedMarker
                        position={ { lat, lng } }
                        title={ address || title }
                    >
                        <Pin />
                    </AdvancedMarker>
                </GoogleMap>
            </div>

            { address && (
                <div className='text-sm text-muted-foreground'>
                    <p className='font-medium'>{ address }</p>
                    <p className='text-xs'>
                        { lat.toFixed(6) }, { lng.toFixed(6) }
                    </p>
                </div>
            ) }
        </CardContent>
    )
}

export const ReadOnlyMap: React.FC<ReadOnlyMapProps> = (props) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
        return (
            <Card className='border-none'>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <MapPin className='h-5 w-5' />
                        { props.title || 'Location' }
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='flex items-center justify-center h-96 bg-muted rounded-lg'>
                        <div className='text-center'>
                            <MapPin className='h-12 w-12 mx-auto mb-3 opacity-50' />
                            <p className='text-sm text-muted-foreground'>Google Maps API key not configured</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className='border-none'>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <MapPin className='h-5 w-5' />
                    { props.title || 'Location' }
                </CardTitle>
            </CardHeader>
            <APIProvider apiKey={ apiKey } libraries={ [ 'marker' ] }>
                <ReadOnlyMapContent { ...props } />
            </APIProvider>
        </Card>
    )
}