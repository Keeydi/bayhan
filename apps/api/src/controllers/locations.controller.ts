import { RequestHandler } from 'express'
import { validateRequestBody } from '@middlewares/request'
import { CreateLocationLogSchema } from '@repo/schemas'
import { SocketActions } from '@utils/socket'
import { Response } from '@utils/response'
import { StatusCodes } from 'http-status-codes'
import { prisma } from '@utils/database'
import { Role } from '@src/types/user'

export const getLocationLogs: RequestHandler = async (req, res) => {
    const { user } = req

    const latestTimestamps = await prisma.locationLog.groupBy({
        by: [ 'userId' ],
        where: user.role === Role.VOLUNTEER ? { userId: user.id } : undefined,
        _max: {
            timestamp: true
        }
    })

    const locationLogs = await Promise.all(
        latestTimestamps.map(async ({ userId, _max }) => {
            const log = await prisma.locationLog.findFirst({
                where: {
                    userId,
                    timestamp: _max.timestamp!
                },
                include: {
                    user: {
                        select: {
                            image: true,
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

            if (!log) return null

            const latestDeployment = await prisma.incidentDeployment.findFirst({
                where: { userId },
                orderBy: { createdAt: 'desc' }
            })

            const name = log.user?.profile
                ? `${ log.user.profile.firstName } ${ log.user.profile.lastName }`.trim()
                : `Volunteer ${ userId.slice(-4) }`

            const { user: _, ...logData } = log

            return {
                ...logData,
                name,
                profileImage: log.user?.image || null,
                incidentId: latestDeployment?.incidentId || null
            }
        })
    )

    const filteredLogs = locationLogs.filter((log): log is NonNullable<typeof log> => log !== null)

    res.respond(Response.success({
        message: 'Location logs successfully retrieved',
        data: filteredLogs
    }))
}

export const createLocationLog: RequestHandler = validateRequestBody(CreateLocationLogSchema, async (req, res) => {
    const { user, parsedBody: data, io } = req

    const locationLog = await prisma.locationLog.create({
        data: {
            userId: user.id,
            ...data
        }
    })

    const userProfile = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
            profile: {
                select: {
                    firstName: true,
                    lastName: true
                }
            }
        }
    })

    const latestDeployment = await prisma.incidentDeployment.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
    })

    const name = userProfile?.profile
        ? `${ userProfile.profile.firstName } ${ userProfile.profile.lastName }`.trim()
        : `Volunteer ${ user.id.slice(-4) }`

    const socketData = {
        ...data,
        userId: user.id,
        name,
        profileImage: user.image || null,
        incidentId: latestDeployment?.incidentId || '123'
    }

    if (latestDeployment) {
        io.to(`incident_${ latestDeployment.incidentId }`).emit(SocketActions.LOCATION_UPDATE, socketData)
    }

    io.emit(SocketActions.LOCATION_UPDATE, socketData)

    res.respond(Response.success({
        code: StatusCodes.CREATED,
        message: 'Location log created successfully',
        data: locationLog
    }))
})