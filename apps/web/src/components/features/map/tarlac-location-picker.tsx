'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Button } from '@components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { Check, X } from 'lucide-react'
import { AdvancedMarker, APIProvider, Map as GoogleMap, Pin, useMap } from '@vis.gl/react-google-maps'

interface TarlacLocationPickerProps {
    onLocationSelect: (data: { lat: number; lng: number; barangay: string; address: string }) => void
    initialLocation?: { lat: number; lng: number }
    title?: string
    height?: string
    onBarangayChange: (barangay: string) => void
    selectedBarangay?: string
}

// Tarlac City bounds
const TARLAC_BOUNDS = {
    north: 15.6269,
    south: 15.4726,
    east: 120.6410,
    west: 120.5568
}

// Get barangay from coordinates using reverse geocoding
async function getBarangayFromCoordinates(lat: number, lng: number): Promise<{ barangay: string; address: string }> {
    try {
        const geocoder = new google.maps.Geocoder()
        
        return new Promise((resolve, reject) => {
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results && results.length > 0 && results[0]) {
                    const address = results[0].formatted_address || ''
                    
                    // Extract barangay from address
                    let barangay = ''
                    for (const component of results[0].address_components || []) {
                        // Look for sublocality_level_2 or sublocality which often contains barangay
                        if (component.types.includes('sublocality_level_2') || 
                            component.types.includes('sublocality')) {
                            barangay = component.long_name
                            break
                        }
                    }
                    
                    resolve({ barangay: barangay || 'Select from dropdown', address })
                } else {
                    resolve({ barangay: 'Select from dropdown', address: '' })
                }
            })
        })
    } catch (error) {
        console.error('Geocoding error:', error)
        return { barangay: 'Select from dropdown', address: '' }
    }
}

const TarlacLocationPickerContent: React.FC<TarlacLocationPickerProps> = ({
    onLocationSelect,
    initialLocation = { lat: 15.4875, lng: 120.5985 }, // Tarlac City center
    title = 'Select Your Location in Tarlac City',
    height = '400px',
    onBarangayChange,
    selectedBarangay
}) => {
    const map = useMap()
    const [currentLocation, setCurrentLocation] = useState({
        lat: initialLocation.lat,
        lng: initialLocation.lng,
        barangay: '',
        address: ''
    })
    
    const [pendingLocation, setPendingLocation] = useState<{
        lat: number
        lng: number
        barangay: string
        address: string
    } | null>(null)

    // Set map restrictions to Tarlac City bounds
    useEffect(() => {
        if (!map) return

        // Restrict map bounds
        const bounds = new google.maps.LatLngBounds(
            { lat: TARLAC_BOUNDS.south, lng: TARLAC_BOUNDS.west },
            { lat: TARLAC_BOUNDS.north, lng: TARLAC_BOUNDS.east }
        )
        map.setOptions({
            restriction: {
                latLngBounds: bounds,
                strictBounds: true
            },
            maxZoom: 17,
            minZoom: 12
        })
    }, [map])

    // Handle map clicks
    const handleMapClick = useCallback(async (event: google.maps.MapMouseEvent) => {
        if (!event.latLng) return

        const lat = event.latLng.lat()
        const lng = event.latLng.lng()

        // Check if within Tarlac City bounds
        if (lat < TARLAC_BOUNDS.south || lat > TARLAC_BOUNDS.north ||
            lng < TARLAC_BOUNDS.west || lng > TARLAC_BOUNDS.east) {
            console.warn('Selected location is outside Tarlac City bounds')
            return
        }

        // Get address and barangay
        const { barangay, address } = await getBarangayFromCoordinates(lat, lng)
        
        setPendingLocation({ lat, lng, barangay, address })
    }, [])

    useEffect(() => {
        if (!map) return

        const listener = map.addListener('click', handleMapClick)
        return () => {
            google.maps.event.removeListener(listener)
        }
    }, [map, handleMapClick])

    // Handle marker drag
    const handleMarkerDragEnd = useCallback(async (event: google.maps.MapMouseEvent) => {
        if (!event.latLng) return

        const lat = event.latLng.lat()
        const lng = event.latLng.lng()

        // Check if within Tarlac City bounds
        if (lat < TARLAC_BOUNDS.south || lat > TARLAC_BOUNDS.north ||
            lng < TARLAC_BOUNDS.west || lng > TARLAC_BOUNDS.east) {
            console.warn('Selected location is outside Tarlac City bounds')
            return
        }

        // Get address and barangay
        const { barangay, address } = await getBarangayFromCoordinates(lat, lng)
        
        setPendingLocation({ lat, lng, barangay, address })
    }, [])

    const handleConfirmLocation = () => {
        if (pendingLocation) {
            setCurrentLocation(pendingLocation)
            setPendingLocation(null)
            onLocationSelect(pendingLocation)
            onBarangayChange(pendingLocation.barangay)
        }
    }

    const handleCancelLocation = () => {
        setPendingLocation(null)
        if (map) {
            map.panTo({ lat: currentLocation.lat, lng: currentLocation.lng })
        }
    }

    const displayLocation = pendingLocation || currentLocation

    return (
        <div className='space-y-4'>
            <div className='text-sm text-muted-foreground'>
                <p className='font-medium mb-1'>{title}</p>
                <p className='text-xs'>Click anywhere on the map or drag the marker to select your location in Tarlac City</p>
            </div>

            { pendingLocation && pendingLocation.address && (
                <div className='flex flex-col gap-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md'>
                    <p className='text-sm font-medium text-blue-900 dark:text-blue-100'>
                        Selected Location:
                    </p>
                    <p className='text-xs text-blue-700 dark:text-blue-300'>
                        {pendingLocation.address}
                    </p>
                    {pendingLocation.barangay && pendingLocation.barangay !== 'Select from dropdown' && (
                        <p className='text-xs font-medium text-blue-800 dark:text-blue-200'>
                            Barangay: {pendingLocation.barangay}
                        </p>
                    )}
                    <div className='flex gap-2 mt-2'>
                        <Button size='sm' onClick={handleConfirmLocation} className='flex-1'>
                            <Check className='w-4 h-4 mr-1' />
                            Confirm
                        </Button>
                        <Button size='sm' variant='outline' onClick={handleCancelLocation} className='flex-1'>
                            <X className='w-4 h-4 mr-1' />
                            Cancel
                        </Button>
                    </div>
                </div>
            ) }

            <div className='relative w-full rounded-lg border overflow-hidden shadow-sm' style={{ height }}>
                <GoogleMap
                    defaultCenter={{ lat: currentLocation.lat, lng: currentLocation.lng }}
                    defaultZoom={13}
                    mapId='tarlac-location-picker'
                    gestureHandling='cooperative'
                    disableDefaultUI={true}
                    zoomControl={true}
                    restriction={{
                        latLngBounds: {
                            east: TARLAC_BOUNDS.east,
                            west: TARLAC_BOUNDS.west,
                            north: TARLAC_BOUNDS.north,
                            south: TARLAC_BOUNDS.south
                        },
                        strictBounds: true
                    }}
                    maxZoom={17}
                    minZoom={12}
                >
                    <AdvancedMarker
                        position={{ lat: displayLocation.lat, lng: displayLocation.lng }}
                        draggable={true}
                        onDragEnd={handleMarkerDragEnd}
                        title={displayLocation.address || 'Selected Location'}
                    >
                        <div className='relative'>
                            <Pin
                                background={pendingLocation ? '#3b82f6' : '#ef4444'}
                                borderColor={pendingLocation ? '#1e40af' : '#dc2626'}
                                glyphColor='white'
                            />
                        </div>
                    </AdvancedMarker>
                </GoogleMap>
            </div>

            {currentLocation.address && !pendingLocation && (
                <div className='text-xs text-muted-foreground'>
                    <p>Current location: {currentLocation.address}</p>
                </div>
            )}
        </div>
    )
}

export const TarlacLocationPicker: React.FC<TarlacLocationPickerProps> = ({ ...props }) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
        return (
            <div className='flex flex-col items-center justify-center h-[400px] rounded-md border bg-muted'>
                <p className='text-sm text-muted-foreground'>Google Maps API key not configured</p>
            </div>
        )
    }

    return (
        <APIProvider apiKey={apiKey} libraries={['marker']}>
            <TarlacLocationPickerContent {...props} />
        </APIProvider>
    )
}

