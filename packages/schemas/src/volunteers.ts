import { z } from 'zod'

export const RejectVolunteerSchema = z.object({ reason: z.string().min(1, 'Reason is required') })

export type RejectVolunteer = z.infer<typeof RejectVolunteerSchema>