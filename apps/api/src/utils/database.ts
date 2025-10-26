import { DatabaseClient } from '@repo/database'
import { env } from '@utils/env'

export const client = DatabaseClient.getInstance(env.DATABASE_URL)
export const prisma: ReturnType<typeof DatabaseClient.getClient> = DatabaseClient.getClient()