import middlewares from '@middlewares'
import { image } from '@utils/multer'
import { attachMediaToTraining } from '@controllers/trainings.controller'

export const post = [
    middlewares.authorize('training', 'update'),
    image.array('medias', 5),
    attachMediaToTraining
]