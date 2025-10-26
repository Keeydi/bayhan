import middlewares from '@middlewares'
import { leaveTrainingProgram } from '@controllers/trainings.controller'

export const patch = [
    middlewares.authorize('training', 'participate'),
    leaveTrainingProgram
]