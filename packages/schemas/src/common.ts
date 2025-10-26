import { z } from 'zod'

export const PaginatedQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10)
})

export const CommonParametersSchema = z.object({
    id: z.union([
        z.literal(':id'),
        z.cuid(),
        z.string().min(1)
    ]).default(':id')
})

export const LocationSchema = z.object({
    lat: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
    lng: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180')
})

export type PaginatedQuery = z.infer<typeof PaginatedQuerySchema>
export type CommonParameters = z.infer<typeof CommonParametersSchema>
export type Location = z.infer<typeof LocationSchema>