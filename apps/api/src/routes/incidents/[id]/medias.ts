import middlewares from '@middlewares'
import { image } from '@utils/multer'
import { attachMediaToIncident } from '@controllers/incidents.controller'

export const post = [
    middlewares.authorize('incident', 'update'),
    image.array('medias', 5),
    attachMediaToIncident
]