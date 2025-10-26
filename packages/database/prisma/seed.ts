import * as process from 'node:process'
import * as path from 'node:path'
import * as fs from 'node:fs'
import { DatabaseClient } from '../src'
import { pino } from 'pino'

const { DATABASE_URL } = process.env

if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set')
}

DatabaseClient.getInstance(DATABASE_URL) // Initialize the client
const prisma = DatabaseClient.getClient()

const logger = pino({
    name: 'prisma',
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname'
        }
    }
})

interface SeederOptions {
    clear?: boolean
    upsertKey?: string | string[]
    dependencies?: string[]
    order?: number
}

interface Seeder {
    model: string
    data: Record<string, any>[]
    options?: SeederOptions
}

interface ProcessedSeeder extends Seeder {
    fileName: string
    filePath: string
}

class DatabaseSeeder {
    private readonly seeders: ProcessedSeeder[] = []
    private readonly seedersPath: string

    constructor(private readonly environment: string) {
        this.seedersPath = path.join(__dirname, 'seeders', environment)
        this.loadSeeders()
    }

    async seed(): Promise<void> {
        logger.info(`Starting database seeding for environment ${ DATABASE_URL }`)

        const orderedSeeders = this.determineSeedingOrder()

        logger.info('Seeding order:')
        orderedSeeders.forEach((seeder, index) => {
            const deps = seeder.options?.dependencies?.length
                ? ` (depends on: ${ seeder.options.dependencies.join(', ') })`
                : ''
            logger.info(`   ${ index + 1 }. ${ seeder.model }${ deps }`)
        })

        logger.info('')

        for (const seeder of orderedSeeders) {
            logger.info(`Seeding model "${ seeder.model }" from file "${ seeder.fileName }"...`)
            await this.seedModel(seeder)
            logger.info(`Finished seeding model "${ seeder.model }"`)
            logger.info('')
        }

        logger.info('All seeders have been processed')
    }

    private loadSeeders(): void {
        if (!fs.existsSync(this.seedersPath)) {
            throw new Error(`Seeders directory for environment "${ this.environment }" does not exist`)
        }

        const files = fs.readdirSync(this.seedersPath)
            .filter(file => file.endsWith('.json'))

        if (files.length === 0) {
            throw new Error(`No seeder files found in ${ this.seedersPath }`)
        }

        for (const file of files) {
            const filePath = path.join(this.seedersPath, file)
            const fileContent = fs.readFileSync(filePath, 'utf-8')

            try {
                const seeder: Seeder = JSON.parse(fileContent)
                const model = seeder.model || this.singularizeModelName(file.replace('.json', ''))

                this.seeders.push({
                    ...seeder,
                    fileName: file,
                    filePath,
                    model
                })
            } catch (error) {
                throw new Error(`Invalid JSON in seeder file "${ file }": ${ error }`)
            }
        }

        logger.info(`Found ${ this.seeders.length } seeder(s) for environment "${ this.environment }"`)
    }

    private singularizeModelName(name: string): string {
        const rules = [
            { regex: /ies$/, replacement: 'y' },
            { regex: /ses$/, replacement: 's' },
            { regex: /s$/, replacement: '' }
        ]

        for (const rule of rules) {
            if (rule.regex.test(name)) {
                return name.replace(rule.regex, rule.replacement)
            }
        }

        return name
    }

    private getPrismaModel(modelName: string) {
        const model = (prisma as any)[modelName]

        if (!model) {
            throw new Error(`Prisma model "${ modelName }" does not exist`)
        }

        return model
    }

    private validateDependencies(): void {
        const modelNames = new Set(this.seeders.map(s => s.model))

        for (const seeder of this.seeders) {
            const dependencies = seeder.options?.dependencies ?? []

            for (const dep of dependencies) {
                if (modelNames.has(dep)) continue

                throw new Error(`Model "${ seeder.model }" depends on "${ dep }", but no seeder found for "${ dep }"`)
            }
        }
    }

    private topologicalSort(): ProcessedSeeder[] {
        this.validateDependencies()

        const visited = new Set<string>()
        const visiting = new Set<string>()
        const result: ProcessedSeeder[] = []
        const seederMap = new Map(this.seeders.map(s => [ s.model, s ]))

        const visit = (modelName: string): void => {
            if (visited.has(modelName)) return

            if (visiting.has(modelName)) {
                throw new Error(`Circular dependency detected involving model "${ modelName }"`)
            }

            const seeder = seederMap.get(modelName)
            if (!seeder) return

            visiting.add(modelName)

            const dependencies = seeder.options?.dependencies ?? []
            for (const dep of dependencies) {
                visit(dep)
            }

            visiting.delete(modelName)
            visited.add(modelName)
            result.push(seeder)
        }

        for (const seeder of this.seeders) {
            visit(seeder.model)
        }

        return result
    }

    private determineSeedingOrder(): ProcessedSeeder[] {
        let orderedSeeders: ProcessedSeeder[]

        try {
            orderedSeeders = this.topologicalSort()
            logger.info('Dependency resolution successful')
        } catch (error) {
            console.warn('Dependency resolution failed, falling back to order/alphabetical sorting')
            console.warn(`   Error: ${ error instanceof Error ? error.message : error }`)

            orderedSeeders = [ ...this.seeders ].sort((a, b) => {
                const orderA = a.options?.order ?? 0
                const orderB = b.options?.order ?? 0

                if (orderA !== orderB) {
                    return orderA - orderB
                }

                return a.model.localeCompare(b.model)
            })
        }

        orderedSeeders.sort((a, b) => {
            const orderA = a.options?.order
            const orderB = b.options?.order

            if (orderA !== undefined && orderB !== undefined) {
                return orderA - orderB
            }

            if (orderA !== undefined) return -1
            if (orderB !== undefined) return 1

            return 0
        })

        return orderedSeeders
    }

    private buildWhereClause(record: Record<string, any>, upsertKey: string | string[] | undefined): Record<string, any> {
        if (Array.isArray(upsertKey)) {
            return upsertKey.reduce((acc, key) => {
                if (record[key] !== undefined) {
                    acc[key] = record[key]
                }
                return acc
            }, {} as Record<string, any>)
        }

        const key = upsertKey ?? 'id'
        return record[key] !== undefined ? { [key]: record[key] } : {}
    }

    private async seedModel({ model: modelName, data, options }: ProcessedSeeder): Promise<void> {
        const model = this.getPrismaModel(modelName)
        const { clear = false, upsertKey } = options ?? {}

        if (clear) {
            logger.info(`Clearing existing data from model "${ modelName }"...`)
            await model.deleteMany()
        }

        let successCount = 0
        let errorCount = 0

        // @ts-ignore
        for (const [ index, record ] of data.entries()) {
            const whereClause = this.buildWhereClause(record, upsertKey)

            try {
                if (Object.keys(whereClause).length > 0) {
                    await model.upsert({
                        where: whereClause,
                        update: record,
                        create: record
                    })
                } else {
                    await model.create({
                        data: record
                    })
                }
                successCount++
            } catch (error) {
                errorCount++
                logger.error(error, `❌ Error seeding record ${ index + 1 } in ${ modelName }:`)
                logger.error(record, `   Record:`)

                if (error instanceof Error && error.message.includes('Foreign key constraint')) {
                    logger.error(`💥 Foreign key constraint failed - check your seeding order and dependencies`)
                }
            }
        }

        logger.info(`   Processed ${ data.length } records: ${ successCount } successful, ${ errorCount } failed`)
    }
}

async function main(): Promise<void> {
    const env = process.env.NODE_ENV ?? 'development'
    const seeder = new DatabaseSeeder(env)
    await seeder.seed()
}

main()
    .then(() => {
        logger.info('Seeding completed successfully')
        process.exit(0)
    })