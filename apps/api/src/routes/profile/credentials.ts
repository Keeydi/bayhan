import middlewares from '@middlewares'
import { getCredentials, uploadCredentials } from '@controllers/profile.controller'
import { credentials } from '@utils/multer'
import { MediaType } from '@repo/database'

export const get = [
    middlewares.authorize('profile', 'read'),
    getCredentials
]

export const post = [
    middlewares.authorize('profile', 'write'),
    credentials.fields([
        { name: MediaType.CERTIFICATION, maxCount: 1 },
        { name: MediaType.ACCREDITATION, maxCount: 1 }
    ]),
    uploadCredentials
]