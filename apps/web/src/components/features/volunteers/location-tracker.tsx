'use client'

import React, { useEffect, useRef, useState } from 'react'
import { getTodayAttendance } from '@actions/attendance'
import { toast } from 'sonner'
import { ChevronUp, MapPin, MapPinOff } from 'lucide-react'
import { DragHandle, DragProvider } from '@contexts/drag'
import { Corners, Draggable } from '@components/ui/draggable'
import { useApi } from '@hooks/use-api'
import { AxiosInstance } from 'axios'

interface LocationTrackerProps {
    debug?: boolean
}

interface LocationData {
    latitude: number
    longitude: number
    accuracy: number
    timestamp: Date
}

// Function to send location updates to the API
const sendLocationUpdate = async ({ latitude, longitude }: LocationData, api: AxiosInstance) => {
    try {
        const response = await api.post('/locations', { latitude, longitude })

        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${ response.status }`)
        }

        const result = response.data
        console.log('Location update sent successfully:', result)
    } catch (error) {
        console.error('Failed to send location update:', error)
    }
}

export const LocationTracker: React.FC<LocationTrackerProps> = ({ debug }) => {
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const watchIdRef = useRef<number | null>(null)
    const hasShownStartToast = useRef(false)
    const [ locationData, setLocationData ] = useState<LocationData | null>(null)
    const [ isTracking, setIsTracking ] = useState(false)
    const [ attendanceStatus, setAttendanceStatus ] = useState<string>('Unknown')
    const [ isCollapsed, setIsCollapsed ] = useState(true)
    const [ position, setPosition ] = useState<Corners>('bottom-right')
    const api = useApi()

    const getCornerPosition = (corner: Corners) => {
        const padding = 20
        const isRight = corner.includes('right')
        const isBottom = corner.includes('bottom')

        return {
            [isRight ? 'right' : 'left']: padding,
            [isBottom ? 'bottom' : 'top']: padding
        }
    }

    const startTracking = () => {
        if (watchIdRef.current !== null) return

        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser')
            return
        }

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords
                const newLocationData: LocationData = {
                    latitude,
                    longitude,
                    accuracy,
                    timestamp: new Date()
                }

                // Update debug state
                setLocationData(newLocationData)
                setIsTracking(true)

                // Show success toast only once when tracking starts
                if (!hasShownStartToast.current) {
                    toast.success('Location tracking started')
                    hasShownStartToast.current = true
                }

                sendLocationUpdate(newLocationData, api)
            },
            (error) => {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        toast.error('Location permission denied. Please enable location access in your browser settings.')
                        stopTracking()
                        break
                    case error.POSITION_UNAVAILABLE:
                        toast.error('Location information unavailable. Please check your device settings.')
                        break
                    case error.TIMEOUT:
                        toast.warning('Location request timed out. Retrying...')
                        break
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 1000,
                maximumAge: 0
            }
        )
    }

    const stopTracking = () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current)
            watchIdRef.current = null
            hasShownStartToast.current = false
            setIsTracking(false)
            toast.info('Location tracking stopped')
        }
    }

    const checkAttendanceAndTrack = async () => {
        const attendance = await getTodayAttendance()

        if (attendance && attendance.hasCheckedIn && !attendance.hasCheckedOut) {
            // User is checked in, start tracking
            setAttendanceStatus('Checked In')
            startTracking()
        } else if (attendance && attendance.hasCheckedOut) {
            // User is checked out
            setAttendanceStatus('Checked Out')
            stopTracking()
        } else {
            // User is not checked in
            setAttendanceStatus('Not Checked In')
            stopTracking()
        }
    }

    useEffect(() => {
        // Initial check
        checkAttendanceAndTrack()

        // Set up periodic checking
        intervalRef.current = setInterval(checkAttendanceAndTrack, 1000 * 60) // Check every minute

        // Cleanup on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
            stopTracking()
        }
    }, [])

    if (!debug) {
        return null
    }

    return (
        <DragProvider>
            <Draggable
                position={ position }
                setPosition={ setPosition }
                padding={ 16 }
                dragHandleSelector='[data-drag-handle]'
                style={ {
                    position: 'fixed',
                    zIndex: 50,
                    ...getCornerPosition(position)
                } }
            >
                { isCollapsed ? (
                    <DragHandle
                        className='w-9 h-9 rounded-full bg-black/80 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 relative'
                        onClick={ () => setIsCollapsed(false) }
                    >
                        <div
                            className={ `absolute top-0 right-0 w-2 h-2 rounded-full ${ isTracking ? 'bg-green-400' : 'bg-gray-400'
                            }` } />
                        { isTracking ? (
                            <MapPin
                                className='text-green-400'
                                size={ 14 }
                            />
                        ) : (
                            <MapPinOff
                                className='text-gray-400'
                                size={ 14 }
                            />
                        ) }
                    </DragHandle>
                ) : (
                    <div
                        className='bg-black/80 backdrop-blur-sm text-white rounded-lg shadow-lg font-mono text-sm max-w-sm border border-white/20'>
                        <DragHandle className='flex items-center justify-between p-3 border-b border-white/20'>
                            <div className='flex items-center gap-2'>
                                { isTracking ? (
                                    <MapPin
                                        className='text-green-400'
                                        size={ 16 }
                                    />
                                ) : (
                                    <MapPinOff
                                        className='text-gray-400'
                                        size={ 16 }
                                    />
                                ) }
                                <span className='font-bold text-green-400'>
                                    Location Tracker
                                </span>
                            </div>
                            <button
                                onClick={ () => setIsCollapsed(true) }
                                className='p-1 hover:bg-white/10 rounded transition-colors'
                            >
                                <ChevronUp className='text-gray-400' size={ 14 } />
                            </button>
                        </DragHandle>

                        {/* Content */ }
                        <div className='p-3 space-y-2'>
                            <div>
                                <span className='text-gray-400'>Status:</span>
                                <span className={ `ml-2 ${ isTracking ? 'text-green-400' : 'text-red-400' }` }>
                                    { isTracking ? 'TRACKING' : 'STOPPED' }
                                </span>
                            </div>

                            <div>
                                <span className='text-gray-400'>Attendance:</span>
                                <span className='ml-2 text-yellow-400'>{ attendanceStatus }</span>
                            </div>

                            { locationData && (
                                <>
                                    <div>
                                        <span className='text-gray-400'>Latitude:</span>
                                        <span className='ml-2 text-blue-400'>
                                            { locationData.latitude.toFixed(6) }
                                        </span>
                                    </div>

                                    <div>
                                        <span className='text-gray-400'>Longitude:</span>
                                        <span className='ml-2 text-blue-400'>
                                            { locationData.longitude.toFixed(6) }
                                        </span>
                                    </div>

                                    <div>
                                        <span className='text-gray-400'>Accuracy:</span>
                                        <span className='ml-2 text-purple-400'>
                                            { locationData.accuracy.toFixed(1) }m
                                        </span>
                                    </div>

                                    <div>
                                        <span className='text-gray-400'>Last Update:</span>
                                        <span className='ml-2 text-gray-300'>
                                            { locationData.timestamp.toLocaleTimeString() }
                                        </span>
                                    </div>
                                </>
                            ) }

                            { !locationData && (
                                <div className='text-gray-500 italic'>
                                    No location data available
                                </div>
                            ) }
                        </div>
                    </div>
                ) }
            </Draggable>
        </DragProvider>
    )
}