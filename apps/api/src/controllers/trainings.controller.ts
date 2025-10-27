import { RequestHandler } from 'express'
import {
    CommonParametersSchema,
    CreateTrainingProgramSchema,
    PaginatedQuerySchema,
    UpdateTrainingProgramSchema
} from '@repo/schemas'
import { MediaType, TrainingProgramStatus } from '@repo/database'
import { prisma } from '@utils/database'
import { Response } from '@utils/response'
import { validateRequest, validateRequestBody, validateRequestParams, validateRequestQuery } from '@middlewares/request'
import { StatusCodes } from 'http-status-codes'
import { geolocationService } from '@src/lib/external'

export const getTrainings: RequestHandler = validateRequestQuery(PaginatedQuerySchema, async (req, res) => {
    const { parsedQuery, user } = req

    const [ result, meta ] = await prisma.trainingProgram
        .paginate({
            include: {
                participants: {
                    select: { user: { select: { id: true } } }
                }
            }
        })
        .withPages({
            ...parsedQuery,
            includePageCount: true
        })

    const trainings = result.map(training => ({
        ...training,
        participantCount: training.participants.length,
        isParticipating: training.participants.some(participant => participant.user.id === user.id),
        participants: undefined
    }))

    res.respond(Response.success({
        message: 'Training programs retrieved successfully',
        data: {
            trainings,
            meta
        }
    }))
})

export const getTrainingById: RequestHandler = validateRequestParams(CommonParametersSchema, async (req, res) => {
    const { id } = req.parsedParams
    const { user } = req

    const training = await prisma.trainingProgram.findUnique({
        where: { id },
        include: {
            medias: {
                select: {
                    media: {
                        select: { url: true }
                    }
                }
            },
            participants: {
                select: {
                    user: {
                        select: {
                            id: true,
                            email: true,
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
            }
        }
    })

    if (!training) {
        return res.respond(Response.notFound({
            message: 'Training program not found'
        }))
    }

    const isParticipating = training.participants.some(participant => participant.user.id === user.id)

    res.respond(Response.success({
        message: 'Training program retrieved successfully',
        data: {
            ...training,
            medias: training.medias.map(({ media: { url } }) => url),
            participants: training.participants.map(({ user }) => ({
                id: user.id,
                firstName: user.profile?.firstName,
                lastName: user.profile?.lastName,
                email: user.email,
                phone: user.profile?.phone
            })),
            isParticipating
        }
    }))
})

export const createTrainingProgram: RequestHandler = validateRequestBody(CreateTrainingProgramSchema, async (req, res) => {
    const { parsedBody: data } = req

    const address = await geolocationService.reverseGeocode({
        lat: data.location.lat,
        lng: data.location.lng
    })

    // Use startDate as the main date field for backward compatibility
    const trainingData = {
        ...data,
        date: data.startDate || data.date,
        location: { ...data.location, address }
    }

    const training = await prisma.trainingProgram.create({ data: trainingData })

    res.respond(Response.success({
        code: StatusCodes.CREATED,
        message: 'Training program created successfully',
        data: training
    }))
})

export const attachMediaToTraining: RequestHandler = validateRequestParams(CommonParametersSchema, async (req, res) => {
    const { parsedParams: { id }, files, user } = req

    if (!files || files.length === 0) {
        return res.respond(Response.badRequest({ message: 'No files uploaded' }))
    }

    const trainingProgram = await prisma.trainingProgram.exists({ id })

    if (!trainingProgram) {
        return res.respond(Response.notFound({ message: 'Training not found' }))
    }

    const medias = await prisma.media.createManyAndReturn({
        data: (files as Express.MulterS3.File[]).map(file => ({
            url: `/images/${ file.filename }`,
            uploadedById: user.id,
            type: MediaType.TRAINING,
            mimeType: file.mimetype
        }))
    })

    const trainingProgramMedias = await prisma.trainingProgramMedia.createMany({
        data: medias.map(media => ({
            trainingProgramId: id,
            mediaId: media.id
        }))
    })

    return res.respond(Response.success({
        code: StatusCodes.CREATED,
        message: 'Media attached to training program successfully',
        data: {
            incidentId: id,
            medias: trainingProgramMedias.count
        }
    }))
})

export const updateTrainingProgram: RequestHandler = validateRequest({
    params: CommonParametersSchema,
    body: UpdateTrainingProgramSchema,
    handler: async (req, res) => {
        const { parsedParams: { id }, parsedBody: data } = req

        const existingTraining = await prisma.trainingProgram.findUnique({ where: { id } })

        if (!existingTraining) {
            return res.respond(Response.notFound({
                message: 'Training program not found'
            }))
        }

        const updatedTraining = await prisma.trainingProgram.update({
            where: { id },
            data
        })

        res.respond(Response.success({
            message: 'Training program updated successfully',
            data: updatedTraining
        }))
    }
})

export const deleteTrainingProgram: RequestHandler = validateRequestParams(CommonParametersSchema, async (req, res) => {
    const { id } = req.parsedParams

    const existingTraining = await prisma.trainingProgram.findUnique({ where: { id } })

    if (!existingTraining) {
        return res.respond(Response.notFound({
            message: 'Training program not found'
        }))
    }

    await prisma.trainingProgram.delete({ where: { id } })

    res.respond(Response.success({
        message: 'Training program deleted successfully'
    }))
})

export const joinTrainingProgram: RequestHandler = validateRequestParams(CommonParametersSchema, async (req, res) => {
    const { parsedParams: { id }, user } = req
    const userId = user.id
    
    // Get the training program with participant count
    const training = await prisma.trainingProgram.findUnique({
        where: { id },
        include: {
            participants: true
        }
    })

    if (!training) {
        return res.respond(Response.notFound({
            message: 'Training program not found'
        }))
    }

    const isAlreadyJoined = training.participants.some(p => p.userId === userId)

    if (isAlreadyJoined) {
        return res.respond(Response.badRequest({
            message: 'You have already joined this training program'
        }))
    }

    // Check if training program has reached maximum participants
    const participantCount = training.participants.length
    if (training.maxParticipants && participantCount >= training.maxParticipants) {
        return res.respond(Response.badRequest({
            message: 'Training program has reached maximum number of participants'
        }))
    }

    await prisma.trainingProgram.update({
        where: { id },
        data: {
            participants: {
                create: { userId }
            }
        }
    })

    // Check if the program is now full and send SMS notifications
    const updatedTraining = await prisma.trainingProgram.findUnique({
        where: { id },
        include: {
            participants: {
                include: {
                    user: {
                        include: {
                            profile: true
                        }
                    }
                }
            }
        }
    })

    console.log('Training capacity check:', {
        maxParticipants: updatedTraining?.maxParticipants,
        currentParticipants: updatedTraining?.participants.length,
        trainingTitle: training.title
    })

    if (updatedTraining && updatedTraining.maxParticipants && 
        updatedTraining.participants.length >= updatedTraining.maxParticipants) {
        // Notify all participants that the program is full
        const { smsService } = await import('@src/lib/external')
        const messages = updatedTraining.participants
            .map(participant => ({
                to: participant.user.profile?.phone,
                body: `The training program "${training.title}" has reached its maximum capacity of ${training.maxParticipants} participants. You are confirmed as a participant.`
            }))
            .filter((msg): msg is { to: string; body: string } => !!msg.to)

        console.log('SMS notifications to send:', {
            totalParticipants: updatedTraining.participants.length,
            messagesWithPhone: messages.length,
            participantPhones: messages.map(m => m.to)
        })

        if (messages.length > 0) {
            const result = await smsService.sendBulkSMS(messages)
            console.log('SMS sending result:', result)
        } else {
            console.warn('No SMS sent: participants do not have phone numbers')
        }
    } else {
        console.log('Training not at capacity yet or maxParticipants not set')
    }

    res.respond(Response.success({ message: 'Successfully joined the training program' }))
})

export const leaveTrainingProgram: RequestHandler = validateRequestParams(CommonParametersSchema, async (req, res) => {
    const { parsedParams: { id }, user: { id: userId } } = req

    const training = await prisma.trainingProgram.exists({ id })

    if (!training) {
        return res.respond(Response.notFound({
            message: 'Training program not found'
        }))
    }

    const isJoined = await prisma.trainingProgram.findFirst({ where: { id, participants: { some: { userId } } } })

    if (!isJoined) {
        return res.respond(Response.badRequest({
            message: 'You are not a participant of this training program'
        }))
    }

    await prisma.trainingProgram.update({
        where: { id },
        data: {
            participants: {
                deleteMany: { userId }
            }
        }
    })

    res.respond(Response.success({ message: 'Participation left successfully' }))
})

export const completeTrainingProgram: RequestHandler = validateRequestParams(CommonParametersSchema, async (req, res) => {
    const { parsedParams: { id } } = req

    const training = await prisma.trainingProgram.findUnique({ where: { id } })

    if (!training) {
        return res.respond(Response.notFound({ message: 'Training program not found' }))
    }

    await prisma.trainingProgram.update({
        where: { id },
        data: {
            status: TrainingProgramStatus.FINISHED
        }
    })

    res.respond(Response.success({ message: 'Training program marked as finished successfully' }))
})
export const cancelTrainingProgram: RequestHandler = validateRequestParams(CommonParametersSchema, async (req, res) => {

    const { parsedParams: { id } } = req

    const training = await prisma.trainingProgram.findUnique({ where: { id } })

    if (!training) {
        return res.respond(Response.notFound({ message: 'Training program not found' }))
    }

    await prisma.trainingProgram.update({
        where: { id },
        data: {
            status: TrainingProgramStatus.CANCELLED
        }
    })

    res.respond(Response.success({ message: 'Training program cancelled successfully' }))
})
