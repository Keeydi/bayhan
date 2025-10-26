import pino from 'pino'
import { env } from '@utils/env'

export const logger = pino({
    level: env.isProduction ? 'info' : 'debug',
    name: 'API Logger',
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname'
        },
        level: 'debug'

    }
});

export const getLogger = (name: string) => logger.child({ name })

