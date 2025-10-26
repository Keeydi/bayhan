'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { type CreateIncident, CreateIncidentSchema } from '@repo/schemas'
import { Button } from '@components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { Textarea } from '@components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select'
import { AddressMap } from '@components/features'
import { ImagePicker } from './image-picker'
import { cn } from '@lib/utils'

type FormData = CreateIncident

interface ReportIncidentFormProps {
    onSubmit?: (data: FormData) => Promise<any>
    onMediaUpload?: (incidentId: string, files: File[]) => Promise<void>
    className?: string
}

export const ReportIncidentForm: React.FC<ReportIncidentFormProps> = ({ onSubmit, onMediaUpload, className }) => {
    const [ isSubmitting, setIsSubmitting ] = useState(false)
    const [ selectedFiles, setSelectedFiles ] = useState<File[]>([])
    const [ isLocationSelected, setIsLocationSelected ] = useState(false)
    const [ locationError, setLocationError ] = useState<string | null>(null)

    const form = useForm({
        resolver: zodResolver(CreateIncidentSchema),
        defaultValues: {
            title: '',
            description: undefined,
            location: {
                lat: 14.5995,
                lng: 120.9842
            },
            severity: 'MODERATE' as const,
            status: 'OPEN' as const
        }
    })

    const handleFilesChange = (files: File[]) => {
        setSelectedFiles(files)
    }

    const isDefaultLocation = (lat: number, lng: number) => {
        const defaultLat = 14.5995
        const defaultLng = 120.9842
        return Math.abs(lat - defaultLat) < 0.0001 && Math.abs(lng - defaultLng) < 0.0001
    }

    const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
        const isDefault = isDefaultLocation(location.lat, location.lng)
        setIsLocationSelected(!isDefault)
        setLocationError(isDefault ? 'Please select a specific location for the incident' : null)

        form.setValue('location', {
            lat: location.lat,
            lng: location.lng
        })
    }

    const handleSubmit = async (data: FormData) => {
        if (!onSubmit) {
            console.warn('No onSubmit handler provided to ReportIncidentForm')
            return
        }

        // Check if location has been selected
        if (!isLocationSelected || isDefaultLocation(data.location.lat, data.location.lng)) {
            setLocationError('Please select a specific location for the incident')
            return
        }

        setIsSubmitting(true)
        setLocationError(null)

        try {
            const result = await onSubmit(data)
            const incidentId = result?.id

            if (selectedFiles.length > 0 && onMediaUpload && incidentId) {
                await onMediaUpload(incidentId, selectedFiles)
            }

            form.reset()
            setSelectedFiles([])
            setIsLocationSelected(false)
        } catch (error) {
            console.error('Error submitting incident:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className={ cn('space-y-6', className) }>
            <Form { ...form }>
                <form onSubmit={ form.handleSubmit(handleSubmit) } className='space-y-6'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>

                        <div className='space-y-6 w-full'>
                            {/* First Row - Title and Severity */ }
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <FormField
                                    control={ form.control }
                                    name='title'
                                    render={ ({ field }) => (
                                        <FormItem>
                                            <FormLabel>Incident Title</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder='Enter incident title'
                                                    { ...field }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    ) }
                                />

                                <FormField
                                    control={ form.control }
                                    name='severity'
                                    render={ ({ field }) => (
                                        <FormItem>
                                            <FormLabel>Severity Level</FormLabel>
                                            <Select onValueChange={ field.onChange } defaultValue={ field.value }>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select severity level' />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value='LOW'>Low</SelectItem>
                                                    <SelectItem value='MODERATE'>Moderate</SelectItem>
                                                    <SelectItem value='HIGH'>High</SelectItem>
                                                    <SelectItem value='CRITICAL'>Critical</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    ) }
                                />
                            </div>

                            {/* Second Row - Description (full width) */ }
                            <FormField
                                control={ form.control }
                                name='description'
                                render={ ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder='Describe the incident in detail...'
                                                className='min-h-[100px]'
                                                { ...field }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ) }
                            />

                            {/* Media Attachment Section */ }
                            <div className='space-y-2'>
                                <div className='space-y-1'>
                                    <p className='text-bold'>Media Attachments</p>
                                    <p className='text-sm text-muted-foreground'>
                                        Upload images related to this incident (optional)
                                    </p>
                                </div>

                                <ImagePicker
                                    onFilesChange={ handleFilesChange }
                                    maxFiles={ 5 }
                                    disabled={ isSubmitting }
                                />
                            </div>
                        </div>

                        {/* Location Selection */ }
                        <FormField
                            control={ form.control }
                            name='location'
                            render={ ({ field }) => (
                                <FormItem>
                                    <FormLabel>Incident Location</FormLabel>
                                    <FormControl>
                                        <div>
                                            <AddressMap
                                                onLocationSelect={ handleLocationSelect }
                                                initialLocation={ {
                                                    lat: field.value.lat,
                                                    lng: field.value.lng
                                                } }
                                                title='Select Incident Location'
                                                height='400px'
                                            />
                                            { locationError && (
                                                <p className='text-sm text-destructive mt-1'>{ locationError }</p>
                                            ) }
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            ) }
                        />
                    </div>

                    {/* Submit Button */ }
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
                                    Reporting...
                                </>
                            ) : (
                                'Report Incident'
                            ) }
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
