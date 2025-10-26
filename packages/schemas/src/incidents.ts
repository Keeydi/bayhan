import { z } from 'zod'
import { LocationSchema } from './common'

export const CreateIncidentSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required').optional(),
    location: LocationSchema,
    severity: z.enum([ 'LOW', 'MODERATE', 'HIGH', 'CRITICAL' ]).default('MODERATE'),
    status: z.enum([ 'OPEN', 'RESOLVED' ]).default('OPEN')
})

export const DeployVolunteersSchema = z.object({
    proximity: z.coerce.number().min(0.1, 'Proximity must be at least 0.1 km').max(100, 'Proximity cannot exceed 100 km').default(5)
})

export type CreateIncident = z.infer<typeof CreateIncidentSchema>
export type DeployVolunteers = z.infer<typeof DeployVolunteersSchema>
