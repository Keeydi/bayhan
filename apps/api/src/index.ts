import { env } from '@utils/env'
import { logger } from '@utils/logging'
import { createServer } from '@src/server'

const server = await createServer();

server.listen(env.PORT, () => {
    logger.info(`Server is running on http://localhost:${ env.PORT }`);
});
