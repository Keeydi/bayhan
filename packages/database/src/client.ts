import { Prisma, PrismaClient as Client } from '../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg'
import { pagination } from 'prisma-extension-pagination'
import { address, user } from './extensions'

const createClient = (connectionString: string) => {
    const adapter = new PrismaPg({ connectionString })
    return new Client({ adapter })
        .$extends(pagination())
        .$extends(user)
        .$extends(address)
        // global extension
        .$extends({
            model: {
                $allModels: {
                    async exists<T>(this: T, where: Prisma.Args<T, 'findFirst'>['where']): Promise<boolean> {
                        const context = Prisma.getExtensionContext(this)
                        const result = await (context as any).findFirst({ where })
                        return result !== null
                    }
                }
            }
        })
}

type PrismaClient = ReturnType<typeof createClient>


// TODO: Add connection checking before returning the client
export class DatabaseClient {
    private static instance: DatabaseClient
    private client: PrismaClient

    private constructor(databaseUrl: string) {
        this.client = createClient(databaseUrl)
    }

    public static getInstance(databaseUrl: string): DatabaseClient {
        if (!DatabaseClient.instance) {
            DatabaseClient.instance = new DatabaseClient(databaseUrl)
        }
        return DatabaseClient.instance
    }

    public static getClient(): ReturnType<typeof createClient> {
        if (!DatabaseClient.instance) {
            throw new Error('DatabaseClient is not initialized. Call getInstance(databaseUrl) first.')
        }
        return DatabaseClient.instance.client
    }
}