import { z } from 'zod'

const VolunteerTypeEnum = z.enum([
    'TYPE_1_SEARCH_RESCUE',
    'TYPE_2_EVACUATION_MOBILITY',
    'TYPE_3_WASAR',
    'TYPE_4_NOT_CERTIFIED'
])

export const CreateProfileSchema = z.object({
    firstName: z.string()
        .min(1, 'First name is required')
        .max(50, 'First name must be less than 50 characters'),
    lastName: z.string()
        .min(1, 'Last name is required')
        .max(50, 'Last name must be less than 50 characters'),
    phone: z.string()
        .min(1, 'Phone number is required'),
    birthDate: z.string().datetime({ message: 'Invalid date format' }),
    volunteerType: VolunteerTypeEnum.optional(),
    address: z.object({
        street: z.union([z.string(), z.null()]).optional(),
        barangay: z.union([z.string(), z.null()]).optional(),
        city: z.string().min(1, 'City is required'),
        state: z.string().min(1, 'State is required'),
        zipCode: z.string().min(1, 'Zip code is required')
    })
})

const UpdateProfileSchemaBase = z.object({
    firstName: z.string()
        .min(1, 'First name is required')
        .max(50, 'First name must be less than 50 characters')
        .optional(),
    lastName: z.string()
        .min(1, 'Last name is required')
        .max(50, 'Last name must be less than 50 characters')
        .optional(),
    email: z.email('Invalid email address')
        .max(100, 'Email must be less than 100 characters')
        .optional(),
    phone: z.string()
        .min(10, 'Phone number must be at least 10 characters long')
        .max(15, 'Phone number must be less than 15 characters')
        .optional()
}).refine(data => Object.keys(data).length > 0, 'At least one field must be provided for update');

export const UpdateProfileSchema = UpdateProfileSchemaBase
    .transform((data) => Object.fromEntries(
        Object.entries(data).filter(([ _, value ]) => value !== undefined)
    ) as Partial<z.infer<typeof UpdateProfileSchemaBase>>)


export const UpdatePasswordSchema = z.object({
    currentPassword: z.string().min(6, 'Current password must be at least 6 characters long'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters long')
})


export type CreateProfile = z.infer<typeof CreateProfileSchema>
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>
export type UpdatePassword = z.infer<typeof UpdatePasswordSchema>