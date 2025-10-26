import middlewares from '@middlewares'
import { createTrainingProgram, getTrainings } from '@controllers/trainings.controller'

export const get = [
    middlewares.authorize('training', 'read'),
    getTrainings
]

export const post = [
    middlewares.authorize('training', 'write'),
    createTrainingProgram
]