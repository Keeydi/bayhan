import { Client, UnitSystem } from '@googlemaps/google-maps-services-js'
import { env } from '@utils/env'

export interface Location {
    lat: number
    lng: number
}

export interface DistanceResult {
    distance: number // in meters
    duration?: number // in seconds (if available)
}

export class GeolocationService {
    private googleMapsClient: Client

    constructor() {
        this.googleMapsClient = new Client({})
    }

    /**
     * Calculate the distance between two coordinates using Google Maps Distance Matrix API
     * This provides more accurate results than Haversine formula as it considers actual roads and terrain
     * @param origin Origin coordinates
     * @param destination Destination coordinates
     * @returns Distance in meters and duration in seconds
     */
    async calculateDistance(
        origin: Location,
        destination: Location
    ): Promise<DistanceResult> {
        try {
            const response = await this.googleMapsClient.distancematrix({
                params: {
                    origins: [ `${ origin.lat },${ origin.lng }` ],
                    destinations: [ `${ destination.lat },${ destination.lng }` ],
                    key: env.GOOGLE_MAPS_API_KEY,
                    units: UnitSystem.metric
                }
            })

            const element = response.data.rows[0]?.elements[0]

            if (!element || element.status !== 'OK') {
                throw new Error(`Distance calculation failed: ${ element?.status || 'Unknown error' }`)
            }

            return {
                distance: element.distance.value, // in meters
                duration: element.duration?.value // in seconds
            }
        } catch (error) {
            console.error('Google Maps API error:', error)
            // Fallback to Haversine formula if Google API fails
            return {
                distance: this.calculateHaversineDistance(origin, destination) * 1000 // convert km to meters
            }
        }
    }

    /**
     * Reverse geocode coordinates to get address using Google Maps Geocoding API
     * @param location Coordinates to reverse geocode
     * @returns Promise<string> Formatted address
     */
    async reverseGeocode(location: Location): Promise<string> {
        try {
            const response = await this.googleMapsClient.reverseGeocode({
                params: {
                    latlng: { lat: location.lat, lng: location.lng },
                    key: env.GOOGLE_MAPS_API_KEY
                }
            })

            const result = response.data.results[0]
            if (!result) {
                throw new Error('No address found for the given coordinates')
            }

            return result.formatted_address
        } catch (error) {
            console.error('Reverse geocoding error:', error)
            throw new Error('Failed to get address for the selected location')
        }
    }

    /**
     * Check if a volunteer is within the specified proximity of an incident using Google Maps API
     * @param volunteerLocation Volunteer's location
     * @param incidentLocation Incident location
     * @param proximityKm Maximum distance in kilometers
     * @returns Promise<boolean> True if within proximity
     */
    async isWithinProximity(
        volunteerLocation: Location,
        incidentLocation: Location,
        proximityKm: number
    ): Promise<boolean> {
        try {
            const result = await this.calculateDistance(volunteerLocation, incidentLocation)
            const distanceKm = result.distance / 1000 // convert meters to kilometers
            return distanceKm <= proximityKm
        } catch (error) {
            console.error('Error checking proximity:', error)
            // Fallback to Haversine calculation
            const distanceKm = this.calculateHaversineDistance(volunteerLocation, incidentLocation)
            return distanceKm <= proximityKm
        }
    }

    /**
     * Get multiple volunteers' distances from an incident location
     * @param incidentLocation Incident location
     * @param volunteerLocations Array of volunteer locations with IDs
     * @returns Promise<Array> Array of results with volunteer ID and distance info
     */
    async getVolunteerDistances(
        incidentLocation: Location,
        volunteerLocations: Array<{ id: string; location: Location }>
    ): Promise<Array<{ id: string; distance: number; duration?: number }>> {
        try {
            const origins = volunteerLocations.map(v => `${ v.location.lat },${ v.location.lng }`)
            const destinations = [ `${ incidentLocation.lat },${ incidentLocation.lng }` ]

            const response = await this.googleMapsClient.distancematrix({
                params: {
                    origins,
                    destinations,
                    key: env.GOOGLE_MAPS_API_KEY,
                    units: UnitSystem.metric
                }
            })

            return response.data.rows.map((row, index) => {
                const element = row.elements[0]
                const volunteerLocation = volunteerLocations[index]
                const volunteerId = volunteerLocation?.id

                if (!volunteerId) {
                    return {
                        id: 'unknown',
                        distance: 0
                    }
                }

                if (element?.status === 'OK') {
                    return {
                        id: volunteerId,
                        distance: element.distance.value, // in meters
                        duration: element.duration?.value // in seconds
                    }
                } else {
                    // Fallback to Haversine for failed calculations
                    if (!volunteerLocation) {
                        return {
                            id: volunteerId,
                            distance: 0
                        }
                    }
                    const distanceKm = this.calculateHaversineDistance(
                        volunteerLocation.location,
                        incidentLocation
                    )
                    return {
                        id: volunteerId,
                        distance: distanceKm * 1000 // convert to meters
                    }
                }
            })
        } catch (error) {
            console.error('Error getting volunteer distances:', error)
            // Fallback to individual Haversine calculations
            return volunteerLocations.map(volunteer => {
                const distanceKm = this.calculateHaversineDistance(volunteer.location, incidentLocation)
                return {
                    id: volunteer.id,
                    distance: distanceKm * 1000 // convert to meters
                }
            })
        }
    }

    /**
     * Fallback distance calculation using Haversine formula
     * @param origin Origin coordinates
     * @param destination Destination coordinates
     * @returns Distance in kilometers
     */
    private calculateHaversineDistance(origin: Location, destination: Location): number {
        const R = 6371 // Earth's radius in kilometers
        const dLat = this.toRadians(destination.lat - origin.lat)
        const dLng = this.toRadians(destination.lng - origin.lng)

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(origin.lat)) * Math.cos(this.toRadians(destination.lat)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2)

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const distance = R * c

        return distance
    }

    /**
     * Convert degrees to radians
     */
    private toRadians(degrees: number): number {
        return degrees * (Math.PI / 180)
    }
}
