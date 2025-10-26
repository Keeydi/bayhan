import { authenticate, authorize } from './authentication'
import { errorHandler } from './error'
import { requestLogger } from './request-logger'
import { responseMiddleware } from './response'
import {
    requestMiddleware,
    validateRequest,
    validateRequestBody,
    validateRequestParams,
    validateRequestQuery,
    addIoToRequest
} from './request'


export default {
    authenticate,
    authorize,
    errorHandler,
    requestLogger,
    responseMiddleware,
    requestMiddleware,
    validateRequestBody,
    validateRequestParams,
    validateRequestQuery,
    validateRequest,
    addIoToRequest
}