'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Button } from '@components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { Check, MapPin, X } from 'lucide-react'
import { AdvancedMarker, APIProvider, Map as GoogleMap, Pin, useMap } from '@vis.gl/react-google-maps'
import { LocationSearch } from './location-search'


interface AddressMapProps {
    onLocationSelect: (location: { lat: number; lng: number; address: string }) => void
    initialLocation?: { lat: number; lng: number }
    initialAddress?: string
    title?: string
    height?: string
}

const AddressMapContent: React.FC<AddressMapProps> = ({
    onLocationSelect,
    initialLocation = { lat: 14.5995, lng: 120.9842 },
    initialAddress = '',
    title = 'Select Location',
    height = '400px'
}) => {
    const map = useMap()
    const [ currentLocation, setCurrentLocation ] = useState({
        lat: initialLocation.lat,
        lng: initialLocation.lng,
        address: initialAddress
    })
    const [ pendingLocation, setPendingLocation ] = useState<{
        lat: number
        lng: number
        address: string
    } | null>(null)

    // Handle location selection from search
    const handleLocationSelect = useCallback((location: { lat: number; lng: number; address: string }) => {
        setPendingLocation(location)
    }, [])

    // Handle marker drag
    const handleMarkerDragEnd = useCallback(async (event: google.maps.MapMouseEvent) => {
        if (!event.latLng) return

        const lat = event.latLng.lat()
        const lng = event.latLng.lng()

        const geocoder = new google.maps.Geocoder()
        await geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results?.[0]) {
                const address = results[0].formatted_address
                setPendingLocation({ lat, lng, address })
            }
        })
    }, [])

    const handleConfirmLocation = () => {
        if (pendingLocation) {
            setCurrentLocation(pendingLocation)
            setPendingLocation(null)
            onLocationSelect(pendingLocation)
        }
    }

    const handleCancelLocation = () => {
        setPendingLocation(null)
        if (map) {
            map.panTo({ lat: currentLocation.lat, lng: currentLocation.lng })
        }
    }

    const displayLocation = pendingLocation || currentLocation

    // Handle map clicks
    useEffect(() => {
        if (!map) return

        const clickListener = map.addListener('click', handleMarkerDragEnd)

        return () => {
            google.maps.event.removeListener(clickListener)
        }
    }, [ map ])

    return (
        <CardContent className='space-y-4'>
            <LocationSearch
                onLocationSelect={ handleLocationSelect }
                initialValue={ currentLocation.address }
                placeholder='Search for a location...'
            />

            { pendingLocation && (
                <div className='animate-in slide-in-from-top-2 duration-200'>
                    <div
                        className='flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800'>
                        <div className='flex-shrink-0 mt-1'>
                            <div
                                className='w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center'>
                                <MapPin className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                            </div>
                        </div>
                        <div className='flex-1 min-w-0'>
                            <h4 className='font-semibold text-blue-900 dark:text-blue-100 text-sm'>
                                Confirm Location Selection
                            </h4>
                            <p className='text-blue-700 dark:text-blue-300 text-sm mt-1 line-clamp-2'>
                                { pendingLocation.address }
                            </p>
                            <div className='flex items-center gap-2 mt-3'>
                                <Button
                                    size='sm'
                                    onClick={ handleConfirmLocation }
                                    className='h-8 bg-blue-600 hover:bg-blue-700 text-white'
                                >
                                    <Check className='h-3 w-3 mr-2' />
                                    Confirm Location
                                </Button>
                                <Button
                                    size='sm'
                                    variant='outline'
                                    onClick={ handleCancelLocation }
                                    className='h-8'
                                >
                                    <X className='h-3 w-3 mr-2' />
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ) }

            <div className='relative w-full rounded-lg border overflow-hidden shadow-sm' style={ { height } }>
                <GoogleMap
                    defaultCenter={ { lat: currentLocation.lat, lng: currentLocation.lng } }
                    defaultZoom={ 15 }
                    mapId='address-selection-map'
                    gestureHandling='cooperative'
                    disableDefaultUI={ true }
                    zoomControl={ true }
                    styles={ [
                        {
                            featureType: 'poi',
                            elementType: 'labels',
                            stylers: [ { visibility: 'off' } ]
                        }
                    ] }
                >
                    <AdvancedMarker
                        position={ { lat: displayLocation.lat, lng: displayLocation.lng } }
                        draggable={ true }
                        onDragEnd={ handleMarkerDragEnd }
                        title={ displayLocation.address || 'Selected Location' }
                    >
                        <div className='relative'>
                            <Pin
                                background={ pendingLocation ? '#3b82f6' : '#ef4444' }
                                borderColor={ pendingLocation ? '#1e40af' : '#dc2626' }
                                glyphColor='white'
                            />
                        </div>
                    </AdvancedMarker>
                </GoogleMap>
            </div>

            { currentLocation.address && (
                <div className='rounded-lg bg-background p-4 space-y-3'>
                    <div className='flex items-start gap-3'>
                        <div className='flex-shrink-0 mt-0.5'>
                            <div className='w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center'>
                                <MapPin className='h-4 w-4 text-primary' />
                            </div>
                        </div>
                        <div className='flex-1 min-w-0'>
                            <h4 className='font-semibold text-sm'>Selected Location</h4>
                            <p className='text-sm text-muted-foreground mt-1 line-clamp-2'>
                                { currentLocation.address }
                            </p>
                        </div>
                    </div>
                    <div className='flex items-center justify-between text-xs text-muted-foreground pt-2 border-t'>
                        <span>Latitude: { currentLocation.lat.toFixed(6) }</span>
                        <span>Longitude: { currentLocation.lng.toFixed(6) }</span>
                    </div>
                </div>
            ) }

            <div className='text-xs text-muted-foreground bg-background p-3 rounded-lg'>
                <strong>Instructions:</strong> Search for a location above, click anywhere on the map, or drag the
                marker to select a new address. Use arrow keys to navigate search results and press Enter to select. Use
                the navigation button to detect your current location automatically.
            </div>
        </CardContent>
    )
}

export const AddressMap: React.FC<AddressMapProps> = (props) =>{
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'demo-key'

    if (!apiKey || apiKey === 'demo-key') {
        return (
            <Card className='border-dashed'>
                <CardHeader>
                    <CardTitle className='flex items-center gap-3'>
                        <div className='w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center'>
                            <MapPin className='h-5 w-5 text-primary' />
                        </div>
                        { props.title || 'Select Location' }
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div
                        className='flex items-center justify-center h-96 bg-background rounded-lg border-2 border-dashed'>
                        <div className='text-center space-y-4 max-w-sm'>
                            <div
                                className='w-16 h-16 mx-auto bg-background rounded-xl flex items-center justify-center'>
                                <MapPin className='h-8 w-8 text-slate-400' />
                            </div>
                            <div>
                                <h3 className='font-semibold text-sm'>Google Maps API Required</h3>
                                <p className='text-xs text-muted-foreground mt-1'>
                                    Please configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables to
                                    enable the map functionality.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className='border-none gap-2'>
            <CardHeader className='mb-6'>
                <CardTitle className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center'>
                        <MapPin className='h-5 w-5 text-primary' />
                    </div>
                    { props.title || 'Location Selection' }
                </CardTitle>
            </CardHeader>
            <APIProvider apiKey={ apiKey } libraries={ [ 'places', 'marker' ] }>
                <AddressMapContent { ...props } />
            </APIProvider>
        </Card>
    )
}