import middlewares from '@middlewares'
import { completeTrainingProgram } from '@controllers/trainings.controller'

export const patch = [
    middlewares.authorize('training', 'update'),
    completeTrainingProgram
]