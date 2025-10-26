'use client'

import React, { useState } from 'react'
import { DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { ImagePicker } from './image-picker'
import { cn } from '@lib/utils'

interface AttachMediaProps {
    onSubmit?: (files: File[]) => void
    maxFiles?: number
    className?: string
}

export function AttachMedia({ onSubmit, maxFiles = 5, className }: AttachMediaProps) {
    const [ selectedFiles, setSelectedFiles ] = useState<File[]>([])
    const [ isUploading, setIsUploading ] = useState(false)

    const handleFilesChange = (files: File[]) => {
        setSelectedFiles(files)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedFiles.length === 0) return

        setIsUploading(true)
        try {
            if (onSubmit) {
                await onSubmit(selectedFiles)
            } else {
                // TODO: Replace with API integration
                console.log('Selected files:', selectedFiles)
            }
        } catch (error) {
            console.error('Error uploading files:', error)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className={ cn('space-y-4', className) }>
            <DialogHeader>
                <DialogTitle>Attach media</DialogTitle>
                <DialogDescription>
                    Upload images related to this incident. Maximum { maxFiles } files allowed.
                </DialogDescription>
            </DialogHeader>

            <form onSubmit={ handleSubmit } className='space-y-4'>
                <ImagePicker
                    onFilesChange={ handleFilesChange }
                    maxFiles={ maxFiles }
                    disabled={ isUploading }
                />

                <DialogFooter>
                    <DialogClose asChild>
                        <Button type='button' variant='outline'>Cancel</Button>
                    </DialogClose>
                    <Button
                        type='submit'
                        disabled={ selectedFiles.length === 0 || isUploading }
                        className='min-w-[120px]'
                    >
                        { isUploading ? (
                            <>
                                <div
                                    className='w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2' />
                                Uploading...
                            </>
                        ) : (
                            `Upload ${ selectedFiles.length > 0 ? `(${ selectedFiles.length })` : '' }`
                        ) }
                    </Button>
                </DialogFooter>
            </form>
        </div>
    )
}


