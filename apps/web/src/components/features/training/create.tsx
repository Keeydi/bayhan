'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Plus } from 'lucide-react'
import { TrainingProgramForm } from '@components/forms'

export const TrainingCreate: React.FC = () => {
    const [ isCreateModalOpen, setIsCreateModalOpen ] = useState(false)

    return (
        <Dialog open={ isCreateModalOpen } onOpenChange={ setIsCreateModalOpen }>
            <DialogTrigger asChild>
                <Button className='gap-2'>
                    <Plus className='h-4 w-4' />
                    Create Program
                </Button>
            </DialogTrigger>
            <DialogContent className='lg:min-w-6xl max-h-[95vh] flex flex-col p-0'>
                <DialogHeader className='flex-shrink-0 p-6 pb-0'>
                    <DialogTitle className='text-xl'>Create New Training Program</DialogTitle>
                </DialogHeader>
                <div className='flex-1 overflow-y-auto p-6 pt-4'>
                    <TrainingProgramForm onSubmit={ () => setIsCreateModalOpen(false) } />
                </div>
            </DialogContent>
        </Dialog>
    )
}