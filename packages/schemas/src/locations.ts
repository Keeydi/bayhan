import { z } from 'zod'

export const CreateLocationLogSchema = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
})

export type CreateLocationLog = z.infer<typeof CreateLocationLogSchema>