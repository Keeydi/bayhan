import { z } from 'zod'
import { LocationSchema, PaginatedQuerySchema } from './common'

export const CreateIncidentSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required').optional(),
    location: LocationSchema,
    type: z.enum([ 'FLOODING', 'LAHAR_FLOW', 'EARTHQUAKE', 'OTHER' ]).optional(),
    severity: z.enum([ 'LOW', 'MED', 'HIGH', 'CRITICAL' ]).default('MED'),
    status: z.enum([ 'OPEN', 'RESOLVED' ]).default('OPEN')
})

export const IncidentQuerySchema = PaginatedQuerySchema.extend({
    type: z.enum([ 'FLOODING', 'LAHAR_FLOW', 'EARTHQUAKE', 'OTHER' ]).optional()
})

export const DeployVolunteersSchema = z.object({
    proximity: z.coerce.number().min(0.1, 'Proximity must be at least 0.1 km').max(100, 'Proximity cannot exceed 100 km').default(5)
})

export type CreateIncident = z.infer<typeof CreateIncidentSchema>
export type DeployVolunteers = z.infer<typeof DeployVolunteersSchema>
export type IncidentQuery = z.infer<typeof IncidentQuerySchema>
