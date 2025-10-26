import middlewares from '@middlewares'
import { joinTrainingProgram } from '@controllers/trainings.controller'

export const patch = [
    middlewares.authorize('training', 'participate'),
    joinTrainingProgram
]