import { deleteAvatar, uploadAvatar } from '@controllers/profile.controller'
import { image } from '@utils/multer'

export const post = [
    image.single('avatar'),
    uploadAvatar
]


export const del = deleteAvatar