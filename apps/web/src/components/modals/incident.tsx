'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Plus } from 'lucide-react'
import { ReportIncidentForm } from '@components/forms'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { useApi } from '@hooks/use-api'
import { useQueryClient } from '@tanstack/react-query'
import { type CreateIncident } from '@repo/schemas'


export function IncidentModal() {
    const [ open, setOpen ] = useState(false)
    const api = useApi()
    const queryClient = useQueryClient()

    const handleIncidentSubmit = async (data: CreateIncident) => {
        const toastId = toast.loading('Creating incident...')

        const response = await api.post('/incidents', data)

        if (response.data?.success) {
            const incidentId = response.data.data.id

            setOpen(false)
            toast.success('Incident reported successfully!', { id: toastId })

            await queryClient.invalidateQueries({ queryKey: [ 'incidents' ] })

            return { id: incidentId }
        }

        toast.error(response.data?.message || 'Failed to create incident', { id: toastId })
    }

    const handleMediaUpload = async (incidentId: string, files: File[]) => {
        const toastId = toast.loading('Uploading media...')

        const formData = new FormData()
        files.forEach(file => {
            formData.append('medias', file)
        })

        const response = await api.post(`/incidents/${ incidentId }/medias`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })

        if (response.data?.success) {
            toast.success(`${ files.length } media file(s) uploaded successfully!`, { id: toastId })
            await queryClient.invalidateQueries({ queryKey: [ 'incidents' ] })
            return
        }

        toast.error(response.data?.message || 'Failed to upload media', { id: toastId })
    }

    return (
        <Dialog open={ open } onOpenChange={ setOpen }>
            <DialogTrigger asChild>
                <Button className='gap-2'>
                    <Plus className='h-4 w-4' />
                    Report Incident
                </Button>
            </DialogTrigger>
            <DialogContent className='lg:min-w-6xl max-h-[95vh] flex flex-col p-0'>
                <DialogHeader className='flex-shrink-0 p-6 pb-0'>
                    <DialogTitle className='text-xl'>Report New Incident</DialogTitle>
                </DialogHeader>
                <div className='flex-1 overflow-y-auto p-6 pt-4'>
                    <ReportIncidentForm
                        onSubmit={ handleIncidentSubmit }
                        onMediaUpload={ handleMediaUpload }
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}