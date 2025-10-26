import { prisma } from '@utils/database'
import { env } from '@utils/env'
import { createAuth } from '@repo/auth'

export const auth = createAuth({
    prisma,
    frontendUrl: env.FRONTEND_URL,
    cookieDomain: env.COOKIE_DOMAIN,
    isProduction: env.NODE_ENV === 'production',
    resendApiKey: env.RESEND_API_KEY
})