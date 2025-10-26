import { RequestHandler } from 'express'
import { CommonParametersSchema, PaginatedQuerySchema } from '@repo/schemas'
import { validateRequest, validateRequestBody, validateRequestParams, validateRequestQuery } from '@middlewares/request'
import { z } from 'zod'

export const getAllUsers: RequestHandler = validateRequestQuery(PaginatedQuerySchema, async (req, res) => {
    // const { parsedQuery: query } = req
    //
    // const [ users, meta ] = await prisma.user
    //     .paginate({ omit: { password: true } })
    //     .withPages({
    //         ...query,
    //         includePageCount: true
    //     })
    //
    // res.respond(Response.success({
    //     message: 'Users retrieved successfully',
    //     data: {
    //         users,
    //         meta
    //     }
    // }))
})

export const getUserById: RequestHandler = validateRequestParams(CommonParametersSchema, async (req, res) => {
    // const { parsedParams: { id } } = req
    //
    // const data = await prisma.user.findUnique({
    //     where: { id },
    //     omit: { password: true },
    //     include: {
    //         address: {
    //             omit: {
    //                 id: true,
    //                 userId: true,
    //                 createdAt: true,
    //                 updatedAt: true
    //             }
    //         },
    //         uploadedMedias: {
    //             where: { type: { in: [ MediaType.ACCREDITATION, MediaType.CERTIFICATION ] } },
    //             omit: { id: true, uploadedById: true, createdAt: true, updatedAt: true }
    //         }
    //     }
    // })
    //
    // if (!data) {
    //     return res.respond(Response.notFound({ message: 'User not found' }))
    // }
    //
    // const { uploadedMedias: credentials, ...user } = data
    //
    // res.respond(Response.success({
    //     message: 'User retrieved successfully',
    //     data: {
    //         ...user,
    //         credentials
    //     }
    // }))
})

export const createUser: RequestHandler = validateRequestBody(z.object({}), async (req, res) => {
    // const { parsedBody: data } = req
    //
    // const existingUser = await prisma.user.findUnique({ where: { email: data.email }, omit: { password: true } })
    //
    // if (existingUser) {
    //     return res.respond(Response.badRequest({ message: 'User with this email already exists' }))
    // }
    //
    // const newUser = await prisma.user.create({
    //     data: {
    //         ...data,
    //         address: { create: data.address }
    //     },
    //     omit: { password: true }
    // })
    //
    // res.respond(Response.success({
    //     message: 'User created successfully',
    //     data: newUser
    // }))
})

export const updateUser: RequestHandler = validateRequest({
    body: z.object({}),
    params: CommonParametersSchema,
    handler: async (req, res) => {
        // const { parsedBody: data, parsedParams: { id } } = req
        //
        // const userExists = await prisma.user.findUnique({ where: { id }, omit: { password: true } })
        //
        // if (!userExists) {
        //     return res.respond(Response.notFound({ message: 'User not found' }))
        // }
        //
        // const updatedUser = await prisma.user.update({
        //     where: { id },
        //     data: {
        //         ...data,
        //         address: { update: data.address }
        //     },
        //     omit: { password: true }
        // })
        //
        // res.respond(Response.success({
        //     message: 'User updated successfully',
        //     data: updatedUser
        // }))
    }
})

export const deleteUserById: RequestHandler = validateRequestParams(CommonParametersSchema, async (req, res) => {
    // const { parsedParams: { id } } = req
    //
    // const userExists = await prisma.user.findUnique({ where: { id }, omit: { password: true } })
    //
    // if (!userExists) {
    //     return res.respond(Response.notFound({ message: 'User not found' }))
    // }
    //
    // const user = await prisma.user.delete({ where: { id }, omit: { password: true } })
    //
    // res.respond(Response.success({
    //     message: 'User deleted successfully',
    //     data: user
    // }))
})
