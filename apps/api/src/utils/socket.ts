import { Server } from 'socket.io'
import { LocationLog } from '@repo/database'
import { logger } from '@utils/logging'

interface IncidentSubscription {
    incidentId: string;
    action: 'follow' | 'unfollow';
}


export enum SocketActions {
    INCIDENT_SUBSCRIPTION = 'incident_subscription',
    LOCATION_UPDATE = 'location_update'
}

export const setupSocket = (io: Server) => {
    io.on('connection', socket => {
        logger.info(`Socket connected: ${ socket.id }`);

        socket.on(SocketActions.INCIDENT_SUBSCRIPTION, ({ incidentId, action }: IncidentSubscription) => {
            const room = `incident_${ incidentId }`

            switch (action) {
                case 'follow':
                    socket.join(room)
                    socket.emit(SocketActions.INCIDENT_SUBSCRIPTION, { incidentId, action: 'followed' })
                    break
                case 'unfollow':
                    socket.leave(room)
                    socket.emit(SocketActions.INCIDENT_SUBSCRIPTION, { incidentId, action: 'unfollowed' })
                    break
                default:
                    socket.emit('error', { message: 'Invalid action' })
            }
        })

        socket.on('disconnect', () => {
            logger.info(`Socket disconnected: ${ socket.id }`);
        })
    })
}