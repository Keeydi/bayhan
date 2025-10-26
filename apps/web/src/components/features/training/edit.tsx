'use client'

import React from 'react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@components/ui/dialog'
import { TrainingProgramForm } from '@components/forms'
import { UpdateTrainingProgram } from '@repo/schemas'

interface TrainingEditProps {
    program: Partial<UpdateTrainingProgram>
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export const TrainingEdit: React.FC<TrainingEditProps> = ({ program, open, onOpenChange }) => {
    return (
        <Dialog open={ open } onOpenChange={ onOpenChange }>
            <DialogContent className='lg:min-w-6xl max-h-[95vh] flex flex-col p-0'>
                <DialogHeader className='flex-shrink-0 p-6 pb-0'>
                    <DialogTitle className='text-xl'>Edit Training Program</DialogTitle>
                </DialogHeader>
                <div className='flex-1 overflow-y-auto p-6 pt-4'>
                    <TrainingProgramForm initialData={ program } edit />
                </div>
            </DialogContent>
        </Dialog>
    )
}