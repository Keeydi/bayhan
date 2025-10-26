import middlewares from '@middlewares'
import { cancelTrainingProgram } from '@controllers/trainings.controller'

export const patch = [
    middlewares.authorize('training', 'update'),
    cancelTrainingProgram
]