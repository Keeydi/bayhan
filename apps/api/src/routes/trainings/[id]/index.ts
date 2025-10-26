import middlewares from '@middlewares'
import { deleteTrainingProgram, getTrainingById, updateTrainingProgram } from '@controllers/trainings.controller'

export const get = [
    middlewares.authorize('training', 'read'),
    getTrainingById
]

export const patch = [
    middlewares.authorize('training', 'update'),
    updateTrainingProgram
]

export const del = [
    middlewares.authorize('training', 'delete'),
    deleteTrainingProgram
]

