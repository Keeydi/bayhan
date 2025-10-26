import { RequestHandler } from 'express'
import { User, VolunteerRequest, VolunteerRequestStatus } from '@repo/database'
import { prisma } from '@utils/database'
import { CommonParametersSchema, PaginatedQuerySchema, RejectVolunteerSchema } from '@repo/schemas'
import { Response } from '@utils/response'
import { validateRequest, validateRequestParams, validateRequestQuery } from '@middlewares/request'
import { Role } from '@src/types/user'

export const getVolunteers: RequestHandler = validateRequestQuery(PaginatedQuerySchema, async (req, res) => {
    const { parsedQuery: query } = req

    const [ volunteers, meta ] = await prisma.user
        .paginate({
            where: { role: Role.VOLUNTEER },
            omit: { role: true },
            include: {
                profile: {
                    select: {
                        firstName: true,
                        lastName: true,
                        phone: true
                    }
                }
            }
        })
        .withPages({
            ...query,
            includePageCount: true
        })

    res.respond(Response.success({
        message: 'Volunteers retrieved successfully',
        data: {
            volunteers,
            meta
        }
    }))
})

export const getVolunteer: RequestHandler = validateRequestParams(CommonParametersSchema, async (req, res) => {
    const { parsedParams: { id } } = req

    const volunteer = await prisma.user.findUnique({
        where: { id, role: Role.VOLUNTEER },
        omit: { role: true },
        include: {
            requests: {
                select: {
                    id: true,
                    createdAt: true,
                    updatedAt: true,
                    reason: true,
                    status: true,
                    updater: { select: { id: true, name: true } }
                }
            },
            certifications: {
                omit: {
                    userId: true,
                    createdAt: true,
                    updatedAt: true
                }
            }
        }
    })

    if (!volunteer) {
        return res.respond(Response.notFound({ message: 'Volunteer not found' }))
    }

    res.respond(Response.success({
        message: 'Volunteer retrieved successfully',
        data: volunteer
    }))
})

export const deleteVolunteer: RequestHandler = validateRequestParams(CommonParametersSchema, async (req, res) => {
    const { parsedParams: { id } } = req

    const volunteer = await prisma.user.findUnique({
        where: { id, role: Role.VOLUNTEER },
        omit: { role: true }
    })

    if (!volunteer) {
        return res.respond(Response.notFound({ message: 'Volunteer not found' }))
    }

    await prisma.user.delete({ where: { id } })

    res.respond(Response.success({
        message: 'Volunteer deleted successfully',
        data: volunteer
    }))
})

// Volunteer Requests
export const getVolunteerRequests: RequestHandler = validateRequestQuery(PaginatedQuerySchema, async (req, res) => {
    const { parsedQuery: query } = req

    const [ requests, meta ] = await prisma.volunteerRequest
        .paginate({
            include: {
                user: {
                    select: {
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
            ...query,
            includePageCount: true
        })

    res.respond(Response.success({
        message: 'Volunteer requests retrieved successfully',
        data: {
            requests,
            meta
        }
    }))
})

export const getVolunteerRequest: RequestHandler = validateRequestParams(CommonParametersSchema, async (req, res) => {
    const { parsedParams: { id } } = req

    const request = await prisma.volunteerRequest.findUnique({
        where: { id },
        omit: { userId: true, updatedBy: true },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    profile: {
                        select: {
                            firstName: true,
                            lastName: true,
                            phone: true,
                            birthDate: true
                        }
                    },
                    address: {
                        select: { fullAddress: true }
                    },
                    uploadedMedias: {
                        where: {
                            type: {
                                in: [ 'ACCREDITATION', 'CERTIFICATION' ]
                            }
                        },
                        omit: { uploadedById: true }
                    }
                }
            },
            updater: {
                select: {
                    id: true,
                    name: true,
                    createdAt: true
                }
            }
        }
    })

    if (!request) {
        return res.respond(Response.notFound({ message: 'Volunteer request not found' }))
    }

    res.respond(Response.success({
        message: 'Volunteer request retrieved successfully',
        data: request
    }))
})

const handleVolunteerRequest = async (
    req: Parameters<RequestHandler>[0],
    res: Parameters<RequestHandler>[1],
    update: (request: VolunteerRequest, user: Omit<User, 'password'>, parsedBody?: any) => Promise<Omit<VolunteerRequest, 'userId' | 'updatedBy'>>,
    successMessage: string
) => {
    const { user, parsedBody, parsedParams: { id } } = req as any // fix typing

    const request = await prisma.volunteerRequest.findUnique({ where: { id } })

    if (!request) {
        return res.respond(Response.notFound({ message: 'Volunteer request not found' }))
    }

    if (request.status !== VolunteerRequestStatus.PENDING) {
        return res.respond(Response.badRequest({ message: 'Volunteer request is already processed' }))
    }

    const updatedRequest = await update(request, user, parsedBody)

    res.respond(Response.success({
        message: successMessage,
        data: updatedRequest
    }))
}

export const approveVolunteerRequest: RequestHandler = validateRequestParams(CommonParametersSchema, (req, res) => handleVolunteerRequest(
    req, res,
    async (request, user) => await prisma.volunteerRequest.update({
        where: { id: request.id },
        data: {
            status: VolunteerRequestStatus.APPROVED,
            user: { update: { role: Role.VOLUNTEER } },
            updater: { connect: { id: user.id } }
        },
        include: { user: true },
        omit: { userId: true, updatedBy: true }
    }),
    'Volunteer request approved successfully'
))

export const rejectVolunteerRequest: RequestHandler = validateRequest({
    params: CommonParametersSchema,
    body: RejectVolunteerSchema,
    handler: (req, res) => handleVolunteerRequest(
        req,
        res,
        async (request, user, parsedBody) => await prisma.volunteerRequest.update({
            where: { id: request.id },
            data: {
                reason: parsedBody.reason,
                status: VolunteerRequestStatus.REJECTED,
                updater: { connect: { id: user.id } }
            },
            include: { user: true },
            omit: { userId: true, updatedBy: true }
        }),
        'Volunteer request rejected successfully'
    )
})

export const deleteVolunteerRequest: RequestHandler = validateRequestParams(CommonParametersSchema, async (req, res) => {
    const { data } = CommonParametersSchema.safeParse(req.params)
    const { id } = data || { id: '' }

    const request = await prisma.volunteerRequest.findUnique({ where: { id } })

    if (!request) {
        return res.respond(Response.notFound({ message: 'Volunteer request not found' }))
    }

    if (request.status !== VolunteerRequestStatus.PENDING) {
        return res.respond(Response.badRequest({ message: 'Only pending volunteer requests can be deleted' }))
    }

    await prisma.volunteerRequest.delete({ where: { id } })

    res.respond(Response.success({ message: 'Volunteer request deleted successfully' }))
})