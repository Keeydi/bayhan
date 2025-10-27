import { RequestHandler } from 'express'
import { prisma } from '@utils/database'
import { Response } from '@utils/response'
import { validateRequestBody, validateRequestQuery } from '@middlewares/request'
import { CreateProfileSchema, PaginatedQuerySchema, UpdateProfileSchema } from '@repo/schemas'
import { MediaType } from '@repo/database'
import { z } from 'zod'
import { s3Service } from '@lib/external'
import { env } from '@utils/env'

export const createProfile = validateRequestBody(CreateProfileSchema, async (req, res) => {
    const { user: { id }, parsedBody: data } = req

    const user = await prisma.user.findFirst({
        where: { id },
        select: { profile: true }
    })

    if (!user) {
        return res.respond(Response.error({ message: 'User not found' })) // This should never happen
    }

    if (user.profile) {
        return res.respond(Response.badRequest({ message: 'Profile already exists' }))
    }

    const { address, ...profileData } = data

    const profile = await prisma.user.update({
        where: { id },
        data: {
            profile: { create: profileData },
            address: { create: address },
            requests: { create: {} }
        },
        select: {
            profile: {
                omit: {
                    userId: true,
                    createdAt: true,
                    updatedAt: true
                }
            },
            address: {
                omit: {
                    userId: true,
                    createdAt: true,
                    updatedAt: true
                }
            }
        }
    })

    res.respond(Response.success({
        message: 'Profile created successfully',
        data: profile
    }))
})

export const getProfile: RequestHandler = async (req, res) => {
    const { user: { id } } = req

    const omit = { userId: true, createdAt: true, updatedAt: true }

    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            profile: { omit },
            address: { omit },
            requests: {
                orderBy: { createdAt: 'desc' },
                take: 1,
                select: {
                    id: true,
                    status: true,
                    createdAt: true
                }
            }
        }
    })

    if (!user?.profile) {
        return res.respond(Response.notFound({ message: 'Profile not found' }))
    }

    // Check if user has uploaded credentials
    const credentials = await prisma.media.findMany({
        where: {
            uploadedById: id,
            type: { in: [ MediaType.ACCREDITATION, MediaType.CERTIFICATION ] }
        },
        select: {
            type: true
        }
    })

    const hasCredentials = credentials.length > 0
    const uploadedCredentialTypes = credentials.map(c => c.type)

    res.respond(Response.success({
        message: 'Profile retrieved successfully',
        data: {
            profile: user.profile,
            address: user.address,
            request: user.requests[0] || null,
            hasCredentials,
            uploadedCredentialTypes
        }
    }))
}

export const updateProfile = validateRequestBody(UpdateProfileSchema, async (req, res) => {
    const { user: { id }, parsedBody: data } = req

    const user = await prisma.user.findFirst({
        where: { id },
        select: { profile: true }
    })

    if (!user?.profile) {
        return res.respond(Response.notFound({ message: 'Profile not found' }))
    }

    // Update profile with provided data
    const updatedProfile = await prisma.profile.update({
        where: { userId: id },
        data: data,
        omit: {
            userId: true,
            createdAt: true,
            updatedAt: true
        }
    })

    res.respond(Response.success({
        message: 'Profile updated successfully',
        data: updatedProfile
    }))
})

export const uploadCredentials: RequestHandler = async (req, res) => {
    const { user: { id } } = req

    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        return res.respond(Response.badRequest({ message: 'No files uploaded' }));
    }

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
        return res.respond(Response.notFound({ message: 'User not found' }));
    }

    const hasUploadedCredentials = await prisma.media.findFirst({
        where: {
            uploadedById: user.id,
            type: { in: [ MediaType.ACCREDITATION, MediaType.ACCREDITATION ] }
        }
    });

    if (hasUploadedCredentials) {
        return res.respond(Response.badRequest({ message: 'Credentials already uploaded' }));
    }

    const files = req.files as { [field: string]: Express.MulterS3.File[] };

    const data = Object.entries(files).flatMap(([ field, fileArray ]) => fileArray.map(file => ({
        url: `/credentials/${ file.key }`,
        uploadedById: user.id,
        type: field as MediaType,
        mimeType: file.mimetype
    })));

    await prisma.media.createMany({ data });

    res.respond(Response.success({ message: 'Credentials uploaded successfully' }));
}

export const getCredentials: RequestHandler = validateRequestQuery(PaginatedQuerySchema, async (req, res) => {
    const { user: { id }, parsedQuery: query } = req

    const [ credentials, meta ] = await prisma.media.paginate({
        where: {
            uploadedById: id,
            type: { in: [ MediaType.CERTIFICATION, MediaType.ACCREDITATION ] }
        },
        omit: {
            id: true,
            uploadedById: true,
            createdAt: true,
            updatedAt: true
        }
    }).withPages({
        ...query,
        includePageCount: true
    })

    res.respond(Response.success({
        message: 'Credentials retrieved successfully',
        data: {
            credentials,
            meta
        }
    }))
})


export const uploadAvatar: RequestHandler = async (req, res) => {
    const file = req.file as Express.MulterS3.File

    if (!file) {
        return res.respond(Response.badRequest({ message: 'No file uploaded' }))
    }

    return res.respond(Response.success({
        message: 'Avatar uploaded successfully',
        data: { url: `/images/${ file.key }` }
    }))
}

export const deleteAvatar: RequestHandler = validateRequestQuery(z.object({ key: z.string().min(1) }), async (req, res) => {
    const { parsedQuery: { key } } = req

    const response = await s3Service.del(key, env.AWS_S3_IMAGES_BUCKET)

    res.respond(Response.success({
        message: 'Avatar deleted successfully',
        data: response
    }))
})