'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { Textarea } from '@components/ui/textarea'
import { AddressMap } from '@components/features'
import { ImagePicker } from './image-picker'
import { cn } from '@lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    CreateTrainingProgram,
    CreateTrainingProgramSchema,
    UpdateTrainingProgram,
    UpdateTrainingProgramSchema
} from '@repo/schemas'
import { useParams, useRouter } from 'next/navigation'
import { useApi } from '@hooks/use-api'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select'

interface TrainingProgramFormProps {
    initialData?: Partial<CreateTrainingProgram>
    onSubmit?: (data: CreateTrainingProgram | UpdateTrainingProgram) => void | Promise<void>
    edit?: boolean
    className?: string
}

export const TrainingProgramForm: React.FC<TrainingProgramFormProps> = ({
    onSubmit,
    initialData,
    edit = false,
    className
}) => {
    const params = useParams()
    const router = useRouter()
    const api = useApi()
    const [ selectedFiles, setSelectedFiles ] = useState<File[]>([])
    const queryClient = useQueryClient()
    const schema = edit ? UpdateTrainingProgramSchema : CreateTrainingProgramSchema

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            title: initialData?.title || '',
            description: initialData?.description || '',
            date: initialData?.date || new Date().toISOString(), // Store ISO format for schema validation
            startDate: initialData?.startDate || new Date().toISOString(),
            endDate: initialData?.endDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            location: initialData?.location || {
                lat: 14.5995,
                lng: 120.9842
            },
            facilitator: initialData?.facilitator || '',
            maxParticipants: initialData?.maxParticipants || undefined,
            requiredVolunteerType: initialData?.requiredVolunteerType || undefined
        }
    })

    const handleFilesChange = (files: File[]) => {
        setSelectedFiles(files)
    }

    const handleSubmit = async (data: CreateTrainingProgram | UpdateTrainingProgram) => {
        const toastId = toast.loading(edit ? 'Updating training program...' : 'Creating training program...')

        // Sync date field to startDate for backward compatibility
        const submitData = {
            ...data,
            date: data.startDate
        }

        let result
        let trainingId

        if (edit) {
            const { id } = params
            if (!id) {
                toast.error('Training ID is required for editing', { id: toastId })
                return
            }

            const response = await api.put(`/trainings/${ id }`, submitData)
            result = response.data
            trainingId = id as string
        } else {
            const response = await api.post('/trainings', submitData)
            result = response.data
            trainingId = result?.id
        }

        if (selectedFiles.length > 0 && trainingId) {
            const formData = new FormData()
            selectedFiles.forEach(file => {
                formData.append('medias', file)
            })

            await api.post(`/trainings/${ trainingId }/medias`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
        }

        if (onSubmit) {
            await onSubmit(data)
        }

        if (!result?.success) {
            toast.error(result?.message || 'An error occurred', { id: toastId })
            return
        }

        toast.success(edit ? 'Training program updated successfully!' : 'Training program created successfully!', { id: toastId })

        form.reset()
        setSelectedFiles([])
        router.refresh()
        await queryClient.invalidateQueries({ queryKey: [ 'training-programs' ] })

        if (!edit && trainingId) {
            router.push(`/trainings/${ trainingId }`)
        }
    }

    if (edit && !initialData) {
        throw new Error('Initial data is required for edit mode')
    }

    const isSubmitting = form.formState.isSubmitting

    return (
        <div className={ cn('space-y-6', className) }>
            <Form { ...form }>
                <form onSubmit={ form.handleSubmit(handleSubmit) } className='space-y-6'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>

                        <div className='space-y-6 w-full'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <FormField
                                    control={ form.control }
                                    name='title'
                                    rules={ { required: 'Title is required' } }
                                    render={ ({ field }) => (
                                        <FormItem>
                                            <FormLabel>Training Program Title</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder='Enter training program title'
                                                    { ...field }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    ) }
                                />

                                <FormField
                                    control={ form.control }
                                    name='facilitator'
                                    render={ ({ field }) => (
                                        <FormItem>
                                            <FormLabel>Trainer</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder='Enter Trainer name'
                                                    { ...field }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    ) }
                                />
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <FormField
                                    control={ form.control }
                                    name='startDate'
                                    rules={ { required: 'Start date is required' } }
                                    render={ ({ field }) => (
                                        <FormItem>
                                            <FormLabel>Start Date & Time</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type='datetime-local'
                                                    value={ field.value ? new Date(field.value).toISOString().slice(0, 16) : '' }
                                                    onChange={ (e) => field.onChange(new Date(e.target.value).toISOString()) }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    ) }
                                />

                                <FormField
                                    control={ form.control }
                                    name='endDate'
                                    rules={ { required: 'End date is required' } }
                                    render={ ({ field }) => (
                                        <FormItem>
                                            <FormLabel>End Date & Time</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type='datetime-local'
                                                    value={ field.value ? new Date(field.value).toISOString().slice(0, 16) : '' }
                                                    onChange={ (e) => field.onChange(new Date(e.target.value).toISOString()) }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    ) }
                                />
                            </div>

                            <FormField
                                control={ form.control }
                                name='date'
                                rules={ { required: 'Date is required' } }
                                render={ ({ field }) => (
                                    <FormItem className='hidden'>
                                        <FormControl>
                                            <Input
                                                type='hidden'
                                                value={ field.value }
                                            />
                                        </FormControl>
                                    </FormItem>
                                ) }
                            />

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <FormField
                                    control={ form.control }
                                    name='maxParticipants'
                                    render={ ({ field }) => (
                                        <FormItem>
                                            <FormLabel>Maximum Number of Participants</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type='number'
                                                    placeholder='Enter maximum participants'
                                                    value={ field.value || '' }
                                                    onChange={ (e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined) }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    ) }
                                />

                                <FormField
                                    control={ form.control }
                                    name='requiredVolunteerType'
                                    render={ ({ field }) => (
                                        <FormItem>
                                            <FormLabel>Required Volunteer Type</FormLabel>
                                            <Select onValueChange={ field.onChange } value={ field.value || '' }>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select volunteer type' />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value='TYPE_1_SEARCH_RESCUE'>Type 1: Search & Rescue</SelectItem>
                                                    <SelectItem value='TYPE_2_EVACUATION_MOBILITY'>Type 2: Evacuation & Mobility</SelectItem>
                                                    <SelectItem value='TYPE_3_WASAR'>Type 3: WASAR</SelectItem>
                                                    <SelectItem value='TYPE_4_NOT_CERTIFIED'>Type 4: Not Certified</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    ) }
                                />
                            </div>

                            <FormField
                                control={ form.control }
                                name='description'
                                render={ ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder='Describe the training program in detail...'
                                                className='min-h-[100px]'
                                                { ...field }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ) }
                            />

                            <div className='space-y-2'>
                                <div className='space-y-1'>
                                    <p className='text-bold'>Media Attachments</p>
                                    <p className='text-sm text-muted-foreground'>
                                        Upload images related to this training program (optional)
                                    </p>
                                </div>

                                <ImagePicker
                                    onFilesChange={ handleFilesChange }
                                    maxFiles={ 5 }
                                    disabled={ isSubmitting }
                                />
                            </div>
                        </div>

                        <FormField
                            control={ form.control }
                            name='location'
                            rules={ { required: 'Location is required' } }
                            render={ ({ field }) => (
                                <FormItem>
                                    <FormLabel>Training Location</FormLabel>
                                    <FormControl>
                                        <AddressMap
                                            onLocationSelect={ (location) => {
                                                field.onChange({
                                                    lat: location.lat,
                                                    lng: location.lng
                                                })
                                            } }
                                            initialLocation={ field.value && {
                                                lat: field.value.lat,
                                                lng: field.value.lng
                                            } }
                                            title='Select Training Location'
                                            height='400px'
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            ) }
                        />
                    </div>


                    <div className='flex justify-end space-x-2 pt-4'>
                        <Button
                            type='submit'
                            disabled={ isSubmitting }
                            className='min-w-[120px]'
                        >
                            { isSubmitting ? (
                                <>
                                    <div
                                        className='w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2' />
                                    { edit ? 'Updating...' : 'Creating...' }
                                </>
                            ) : (
                                edit ? 'Update Training' : 'Create Training'
                            ) }
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
