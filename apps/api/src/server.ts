import express from 'express';
import { router } from 'express-file-routing'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url';
import middlewares from '@middlewares'
import cors from 'cors';
import cookieParser from 'cookie-parser'
import * as http from 'node:http'
import { Server } from 'socket.io'
import { setupSocket } from '@utils/socket'
import { env } from '@utils/env'
import { toNodeHandler } from 'better-auth/node'
import { auth } from '@lib/auth'

export const createServer = async () => {
    const app = express();
    const server = http.createServer(app)
    const io = new Server(
        server,
        {
            cors: {
                origin: '*',
                methods: [ 'GET', 'POST' ]
            }
        }
    )

    app.set('trust proxy', true)

    app.use(middlewares.responseMiddleware);
    app.use(middlewares.addIoToRequest(io));
    app.use(middlewares.requestMiddleware);
    app.use(middlewares.requestLogger)

    app.use(cookieParser());
    
    // In development, allow multiple localhost origins
    const allowedOrigins = env.NODE_ENV === 'development' 
        ? /^http:\/\/localhost:\d+$/
        : env.FRONTEND_URL;
    
    app.use(cors({
        origin: allowedOrigins,
        methods: [ 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS' ],
        credentials: true
    }))

    app.all('/auth/*any', toNodeHandler(auth))

    app.use(express.json());

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    app.use('/', await router({ directory: path.join(__dirname, 'routes') }));

    app.use(middlewares.errorHandler);

    setupSocket(io)

    return server
}
