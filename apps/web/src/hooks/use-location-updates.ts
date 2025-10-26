'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSocket } from './use-socket'

export interface LocationUpdate {
    userId: string
    name: string
    profileImage?: string | null
    latitude: number
    longitude: number
    incidentId?: string
    timestamp: string
}

export interface VolunteerLocation {
    id: string
    name: string
    status: 'active' | 'inactive' | 'on-mission'
    lat: number
    lng: number
    lastUpdated: string
    profilePhoto?: string
}

interface UseLocationUpdatesOptions {
    incidentId?: string
    subscribeToIncident?: boolean
}

interface UseLocationUpdatesReturn {
    locations: Map<string, LocationUpdate>
    volunteers: VolunteerLocation[]
    isConnected: boolean
    subscribeToIncident: (incidentId: string) => void
    unsubscribeFromIncident: (incidentId: string) => void
}

// Socket action constants (matching the API)
const SocketActions = {
    LOCATION_UPDATE: 'location_update',
    INCIDENT_SUBSCRIPTION: 'incident_subscription'
} as const

export function useLocationUpdates(options: UseLocationUpdatesOptions = {}): UseLocationUpdatesReturn {
    const { incidentId, subscribeToIncident: shouldSubscribe = false } = options
    const {
        socket,
        isConnected,
        emit,
        on,
        off
    } = useSocket({ socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL! })
    const [ locations, setLocations ] = useState<Map<string, LocationUpdate>>(new Map())
    const [ volunteers, setVolunteers ] = useState<VolunteerLocation[]>([])

    const handleLocationUpdate = useCallback((data: LocationUpdate) => {
        setLocations(prev => {
            const newMap = new Map(prev)
            newMap.set(data.userId, {
                ...data,
                timestamp: new Date().toISOString()
            })
            return newMap
        })
    }, [])

    const subscribeToIncident = useCallback((targetIncidentId: string) => {
        if (isConnected) {
            emit(SocketActions.INCIDENT_SUBSCRIPTION, {
                incidentId: targetIncidentId,
                action: 'follow'
            })
            console.log(`Subscribed to incident: ${ targetIncidentId }`)
        }
    }, [ isConnected, emit ])

    const unsubscribeFromIncident = useCallback((targetIncidentId: string) => {
        if (isConnected) {
            emit(SocketActions.INCIDENT_SUBSCRIPTION, {
                incidentId: targetIncidentId,
                action: 'unfollow'
            })
            console.log(`Unsubscribed from incident: ${ targetIncidentId }`)
        }
    }, [ isConnected, emit ])

    useEffect(() => {
        const volunteerLocations: VolunteerLocation[] = Array.from(locations.values()).map(location => ({
            id: location.userId,
            name: location.name,
            status: 'active' as const,
            lat: location.latitude,
            lng: location.longitude,
            lastUpdated: location.timestamp,
            profilePhoto: location.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ location.userId }`
        }))

        setVolunteers(volunteerLocations)
    }, [ locations ])

    useEffect(() => {
        if (socket) {
            on(SocketActions.LOCATION_UPDATE, handleLocationUpdate)

            on(SocketActions.INCIDENT_SUBSCRIPTION, (data: { incidentId: string; action: string }) => {
                console.log(`Incident subscription ${ data.action }:`, data.incidentId)
            })

            return () => {
                off(SocketActions.LOCATION_UPDATE, handleLocationUpdate)
                off(SocketActions.INCIDENT_SUBSCRIPTION)
            }
        }
    }, [ socket, on, off, handleLocationUpdate ])

    useEffect(() => {
        if (incidentId && shouldSubscribe && isConnected) {
            subscribeToIncident(incidentId)

            return () => {
                unsubscribeFromIncident(incidentId)
            }
        }
    }, [ incidentId, shouldSubscribe, isConnected, subscribeToIncident, unsubscribeFromIncident ])

    return {
        locations,
        volunteers,
        isConnected,
        subscribeToIncident,
        unsubscribeFromIncident
    }
}
