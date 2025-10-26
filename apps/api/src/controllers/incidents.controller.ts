import { RequestHandler } from 'express'
import {
    CommonParametersSchema,
    CreateIncidentSchema,
    DeployVolunteersSchema,
    PaginatedQuerySchema
} from '@repo/schemas'
import { IncidentStatus, MediaType, VolunteerRequestStatus } from '@repo/database'
import { prisma } from '@utils/database'
import { Response } from '@utils/response'
import { validateRequest, validateRequestBody, validateRequestParams, validateRequestQuery } from '@middlewares/request'
import { StatusCodes } from 'http-status-codes'
import { geolocationService, type Location, smsService } from '@lib/external'
import { DateTime } from 'luxon'

export const getIncidents: RequestHandler = validateRequestQuery(PaginatedQuerySchema, async (req, res) => {
    const { parsedQuery } = req

    const [ incidents, meta ] = await prisma.incident
        .paginate({
            select: {
                id: true,
                title: true,
                description: true,
                severity: true,
                status: true,
                reportedBy: true,
                createdAt: true,
                updatedAt: true,
                reporter: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profile: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            }
        })
        .withPages({
            ...parsedQuery,
            includePageCount: true
        })

    res.respond(Response.success({
        message: 'Incidents retrieved successfully',
        data: {
            incidents,
            meta
        }
    }))
})

export const getIncidentById: RequestHandler = validateRequestParams(CommonParametersSchema, async (req, res) => {
    const { parsedParams: { id } } = req

    const incident = await prisma.incident.findUnique({
        where: { id },
        include: {
            medias: {
                select: {
                    media: {
                        select: {
                            id: true,
                            url: true,
                            type: true,
                            mimeType: true,
                            createdAt: true,
                            updatedAt: true
                        }
                    }
                }
            },
            reporter: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    profile: {
                        select: {
                            firstName: true,
                            lastName: true,
                            phone: true
                        }
                    }
                }
            }
        }
    })

    if (!incident) {
        return res.respond(Response.notFound({ message: 'Incident not found' }))
    }

    return res.respond(Response.success({
        message: 'Incident retrieved successfully',
        data: {
            id: incident.id,
            title: incident.title,
            description: incident.description,
            location: incident.location,
            status: incident.status,
            severity: incident.severity,
            reportedBy: incident.reportedBy,
            createdAt: incident.createdAt,
            updatedAt: incident.updatedAt,
            medias: incident.medias.map(({ media }) => ({
                id: media.id,
                url: media.url,
                type: media.type,
                mimeType: media.mimeType,
                createdAt: media.createdAt,
                updatedAt: media.updatedAt
            })),
            reporter: incident.reporter
        }
    }))
})

export const reportIncident: RequestHandler = validateRequestBody(CreateIncidentSchema, async (req, res) => {
    const { parsedBody, user } = req

    const address = await geolocationService.reverseGeocode({
        lat: parsedBody.location.lat,
        lng: parsedBody.location.lng
    })

    const incident = await prisma.incident.create({
        data: {
            ...parsedBody,
            location: {
                lat: parsedBody.location.lat,
                lng: parsedBody.location.lng,
                address: address
            },
            reportedBy: user.id
        }
    })

    return res.respond(Response.success({
        code: StatusCodes.CREATED,
        message: 'Incident reported successfully',
        data: incident
    }))

})

export const attachMediaToIncident: RequestHandler = validateRequestParams(CommonParametersSchema, async (req, res) => {
    const { parsedParams: { id }, files, user } = req

    if (!files || files.length === 0) {
        return res.respond(Response.badRequest({ message: 'No files uploaded' }))
    }

    const incident = await prisma.incident.exists({ id })

    if (!incident) {
        return res.respond(Response.notFound({ message: 'Incident not found' }))
    }

    const medias = await prisma.media.createManyAndReturn({
        data: (files as Express.MulterS3.File[]).map(file => ({
            url: `/images/${ file.key }`,
            uploadedById: user.id,
            type: MediaType.INCIDENT,
            mimeType: file.mimetype
        }))
    })

    const incidentMedias = await prisma.incidentMedia.createMany({
        data: medias.map(media => ({
            incidentId: id,
            mediaId: media.id
        }))
    })

    return res.respond(Response.success({
        code: StatusCodes.CREATED,
        message: 'Media attached to incident successfully',
        data: {
            incidentId: id,
            medias: incidentMedias.count
        }
    }))
})

export const resolveIncident: RequestHandler = validateRequestParams(CommonParametersSchema, async (req, res) => {
    const { parsedParams: { id } } = req

    const incident = await prisma.incident.findUnique({
        where: { id }
    })

    if (!incident) {
        return res.respond(Response.notFound({ message: 'Incident not found' }))
    }

    if (incident.status === IncidentStatus.RESOLVED) {
        return res.respond(Response.badRequest({ message: 'Incident already resolved' }))
    }

    const updatedIncident = await prisma.incident.update({
        where: { id },
        data: { status: IncidentStatus.RESOLVED }
    })

    return res.respond(Response.success({
        message: 'Incident resolved successfully',
        data: updatedIncident
    }))
})

// Helper function to get proximity based on severity
function getProximityForSeverity(severity: string): number | null {
    switch (severity) {
        case 'LOW': return 3
        case 'MODERATE': return 5
        case 'HIGH': return 10
        case 'CRITICAL': return null // null means all volunteers in Tarlac City
        default: return 5
    }
}

export const getIncidentLocationData: RequestHandler = validateRequest({
    params: CommonParametersSchema,
    query: DeployVolunteersSchema,
    handler: async (req, res) => {
        const { parsedParams: { id }, parsedQuery: { proximity }, user } = req

        const incident = await prisma.incident.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                location: true,
                severity: true,
                status: true
            }
        })

        if (!incident) {
            return res.respond(Response.notFound({ message: 'Incident not found' }))
        }

        if (incident.status === IncidentStatus.RESOLVED) {
            return res.respond(Response.badRequest({ message: 'Cannot deploy volunteers to a resolved incident' }))
        }

        // Use severity-based proximity
        const severityProximity = getProximityForSeverity(incident.severity)
        const effectiveProximity = severityProximity === null ? proximity : severityProximity

        const incidentLocation = incident.location as { lat: number; lng: number }
        const incidentUrl = `${ process.env.FRONTEND_URL || 'http://localhost:3000' }/incidents/${ id }`

        const volunteers = await prisma.user.findMany({
            where: {
                requests: {
                    some: {
                        status: VolunteerRequestStatus.APPROVED
                    }
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                profile: {
                    select: {
                        phone: true
                    }
                },
                locationLogs: {
                    orderBy: { timestamp: 'desc' },
                    take: 1,
                    select: {
                        latitude: true,
                        longitude: true,
                        timestamp: true
                    }
                },
                attendanceRecords: {
                    where: {
                        date: {
                            gte: DateTime.utc().startOf('day').toJSDate()
                        },
                        checkOutTime: null // Only checked in volunteers
                    },
                    select: {
                        checkInTime: true
                    }
                }
            }
        })

        const volunteersWithLocation = volunteers.filter(volunteer => {
            const hasLocation = volunteer.locationLogs.length > 0
            const hasPhone = volunteer.profile?.phone
            return hasLocation && hasPhone
        })

        if (volunteersWithLocation.length === 0) {
            return res.respond(Response.success({
                message: 'No volunteers found with location data and phone numbers',
                data: {
                    incidentId: id,
                    proximity: effectiveProximity,
                    deployed: { count: 0, volunteers: [] },
                    inactive: { count: 0, volunteers: [] },
                    notifications: { total: 0, sent: 0, failed: 0 }
                }
            }))
        }

        let volunteersToDeploy = []
        let inactiveVolunteers = []

        // For CRITICAL severity, include all Tarlac City volunteers regardless of distance
        if (severityProximity === null) {
            // For CRITICAL: Include all volunteers
            volunteersToDeploy = volunteersWithLocation
                .filter(v => v.attendanceRecords.length > 0)
                .map(v => ({
                    ...v,
                    distance: null,
                    estimatedDuration: null
                }))
            inactiveVolunteers = volunteersWithLocation
                .filter(v => v.attendanceRecords.length === 0)
                .map(v => ({
                    ...v,
                    distance: null,
                    estimatedDuration: null
                }))
        } else {
            // For LOW, MED, HIGH: Filter by proximity
            const volunteerLocations = volunteersWithLocation.map(volunteer => {
                const latestLocation = volunteer.locationLogs[0]
                if (!latestLocation) {
                    throw new Error(`No location data for volunteer ${ volunteer.id }`)
                }
                return {
                    id: volunteer.id,
                    location: {
                        lat: latestLocation.latitude,
                        lng: latestLocation.longitude
                    } as Location
                }
            })

            const distanceResults = await geolocationService.getVolunteerDistances(incidentLocation, volunteerLocations)

            for (const volunteer of volunteersWithLocation) {
                const distanceResult = distanceResults.find(d => d.id === volunteer.id)
                if (!distanceResult) continue

                const distanceKm = distanceResult.distance / 1000
                const isWithinRange = distanceKm <= effectiveProximity
                const isCheckedIn = volunteer.attendanceRecords.length > 0

                if (!isWithinRange) continue

                if (isCheckedIn) {
                    volunteersToDeploy.push({
                        ...volunteer,
                        distance: distanceKm,
                        estimatedDuration: distanceResult.duration
                    })
                    continue
                }

                inactiveVolunteers.push({
                    ...volunteer,
                    distance: distanceKm,
                    estimatedDuration: distanceResult.duration
                })
            }
        }

        return res.respond(Response.success({
            message: 'Incident location data retrieved successfully',
            data: {
                incidentId: id,
                proximity: effectiveProximity,
                volunteersToDeploy,
                inactiveVolunteers
            }
        }))
    }
})

export const deployVolunteers: RequestHandler = validateRequest({
    params: CommonParametersSchema,
    body: DeployVolunteersSchema,
    handler: async (req, res) => {
        const { parsedParams: { id: incidentId }, parsedBody: { proximity } } = req

        const incident = await prisma.incident.findUnique({
            where: { id: incidentId },
            select: {
                id: true,
                title: true,
                location: true,
                severity: true,
                status: true
            }
        })

        if (!incident) {
            return res.respond(Response.notFound({ message: 'Incident not found' }))
        }

        if (incident.status === IncidentStatus.RESOLVED) {
            return res.respond(Response.badRequest({ message: 'Cannot deploy volunteers to a resolved incident' }))
        }

        // Use severity-based proximity
        const severityProximity = getProximityForSeverity(incident.severity)
        const effectiveProximity = severityProximity === null ? proximity : severityProximity

        const incidentLocation = incident.location as { lat: number; lng: number }
        const incidentUrl = `${ process.env.FRONTEND_URL || 'http://localhost:3000' }/incidents/${ incidentId }`

        const volunteers = await prisma.user.findMany({
            where: {
                requests: {
                    some: {
                        status: VolunteerRequestStatus.APPROVED
                    }
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                profile: {
                    select: {
                        phone: true
                    }
                },
                locationLogs: {
                    orderBy: { timestamp: 'desc' },
                    take: 1,
                    select: {
                        latitude: true,
                        longitude: true,
                        timestamp: true
                    }
                },
                attendanceRecords: {
                    where: {
                        date: {
                            gte: DateTime.utc().startOf('day').toJSDate()
                        },
                        checkOutTime: null // Only checked in volunteers
                    },
                    select: {
                        checkInTime: true
                    }
                }
            }
        })

        const volunteersWithLocation = volunteers.filter(volunteer => {
            const hasLocation = volunteer.locationLogs.length > 0
            const hasPhone = volunteer.profile?.phone
            return hasLocation && hasPhone
        })

        if (volunteersWithLocation.length === 0) {
            return res.respond(Response.success({
                message: 'No volunteers found with location data and phone numbers',
                data: {
                    incidentId,
                    proximity,
                    deployed: { count: 0, volunteers: [] },
                    inactive: { count: 0, volunteers: [] },
                    notifications: { total: 0, sent: 0, failed: 0 }
                }
            }))
        }

        let deployedVolunteers = []
        let inactiveVolunteers = []
        let smsMessages = []

        // For CRITICAL severity, include all Tarlac City volunteers regardless of distance
        if (severityProximity === null) {
            // For CRITICAL: Include all volunteers in Tarlac City
            deployedVolunteers = volunteersWithLocation
                .filter(v => v.attendanceRecords.length > 0)
                .map(v => ({
                    ...v,
                    distance: null,
                    estimatedDuration: null
                }))
            
            inactiveVolunteers = volunteersWithLocation
                .filter(v => v.attendanceRecords.length === 0)
                .map(v => ({
                    ...v,
                    distance: null,
                    estimatedDuration: null
                }))
            
            // Add SMS messages for all volunteers
            for (const volunteer of volunteersWithLocation) {
                const phoneNumber = volunteer.profile?.phone
                if (volunteer.attendanceRecords.length > 0) {
                    smsMessages.push({
                        to: phoneNumber!,
                        body: smsService.createDeploymentMessage(volunteer.name, incident.title, incidentUrl)
                    })
                } else {
                    smsMessages.push({
                        to: phoneNumber!,
                        body: smsService.createInactiveVolunteerAlert(volunteer.name, incident.title)
                    })
                }
            }
        } else {
            // For LOW, MED, HIGH: Filter by proximity
            const volunteerLocations = volunteersWithLocation.map(volunteer => {
                const latestLocation = volunteer.locationLogs[0]
                if (!latestLocation) {
                    throw new Error(`No location data for volunteer ${ volunteer.id }`)
                }
                return {
                    id: volunteer.id,
                    location: {
                        lat: latestLocation.latitude,
                        lng: latestLocation.longitude
                    } as Location
                }
            })

            const distanceResults = await geolocationService.getVolunteerDistances(incidentLocation, volunteerLocations)

            for (const volunteer of volunteersWithLocation) {
                const distanceResult = distanceResults.find(d => d.id === volunteer.id)
                if (!distanceResult) continue

                const distanceKm = distanceResult.distance / 1000
                const isWithinRange = distanceKm <= effectiveProximity
                const isCheckedIn = volunteer.attendanceRecords.length > 0
                const phoneNumber = volunteer.profile?.phone

                if (!isWithinRange) continue

                if (isCheckedIn) {
                    deployedVolunteers.push({
                        ...volunteer,
                        distance: distanceKm,
                        estimatedDuration: distanceResult.duration
                    })
                    smsMessages.push({
                        to: phoneNumber!,
                        body: smsService.createDeploymentMessage(volunteer.name, incident.title, incidentUrl)
                    })

                    continue
                }

                inactiveVolunteers.push({
                    ...volunteer,
                    distance: distanceKm,
                    estimatedDuration: distanceResult.duration
                })
                smsMessages.push({
                    to: phoneNumber!,
                    body: smsService.createInactiveVolunteerAlert(volunteer.name, incident.title)
                })
            }
        }

        if (deployedVolunteers.length > 0) {
            await prisma.incidentDeployment.createMany({
                data: deployedVolunteers.map(volunteer => ({
                    incidentId: incidentId!,
                    userId: volunteer.id
                })),
                skipDuplicates: true
            })
        }

        let smsResults = { sent: 0, failed: 0 }
        if (smsMessages.length > 0) {
            smsResults = await smsService.sendBulkSMS(smsMessages)
        }

        return res.respond(Response.success({
            message: 'Volunteer deployment completed',
            data: {
                incidentId,
                proximity: effectiveProximity,
                deployed: {
                    count: deployedVolunteers.length,
                    volunteers: deployedVolunteers.map(v => ({
                        id: v.id,
                        name: v.name,
                        distance: Math.round(v.distance * 100) / 100,
                        estimatedDuration: v.estimatedDuration ? Math.round(v.estimatedDuration / 60) : null
                    }))
                },
                inactive: {
                    count: inactiveVolunteers.length,
                    volunteers: inactiveVolunteers.map(v => ({
                        id: v.id,
                        name: v.name,
                        distance: Math.round(v.distance * 100) / 100,
                        estimatedDuration: v.estimatedDuration ? Math.round(v.estimatedDuration / 60) : null
                    }))
                },
                notifications: {
                    total: smsMessages.length,
                    sent: smsResults.sent,
                    failed: smsResults.failed
                }
            }
        }))
    }
})