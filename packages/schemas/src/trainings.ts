import { z } from 'zod'
import { LocationSchema } from './common'

const VolunteerTypeEnum = z.enum([
    'TYPE_1_SEARCH_RESCUE',
    'TYPE_2_EVACUATION_MOBILITY',
    'TYPE_3_WASAR',
    'TYPE_4_NOT_CERTIFIED'
])

export const CreateTrainingProgramSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required').optional(),
    date: z.iso.datetime({ error: 'Invalid date format' }), // Keep for backward compatibility
    startDate: z.iso.datetime({ error: 'Invalid start date format' }),
    endDate: z.iso.datetime({ error: 'Invalid end date format' }),
    location: LocationSchema,
    facilitator: z.string().min(1, 'Trainer is required').optional(),
    maxParticipants: z.number().int().min(1, 'Maximum participants must be at least 1').optional(),
    requiredVolunteerType: VolunteerTypeEnum.optional()
}).refine(data => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'End date must be after start date',
    path: ['endDate']
})

export const UpdateTrainingProgramSchema = CreateTrainingProgramSchema
    .partial()
    .refine(data => Object.keys(data).length > 0, { message: 'At least one field must be provided for update' })

export type CreateTrainingProgram = z.infer<typeof CreateTrainingProgramSchema>
export type UpdateTrainingProgram = z.infer<typeof UpdateTrainingProgramSchema>
