'use client'

import React, { useRef, useState } from 'react'
import { Button } from '@components/ui/button'
import { Label } from '@components/ui/label'
import { Upload, X, AlertCircle } from 'lucide-react'
import { cn } from '@lib/utils'

interface FilePreview {
    file: File
    preview: string
    id: string
}

interface ImagePickerProps {
    onFilesChange: (files: File[]) => void
    maxFiles?: number
    className?: string
    accept?: string
    disabled?: boolean
}

export function ImagePicker({
    onFilesChange,
    maxFiles = 5,
    className,
    accept = 'image/*',
    disabled = false
}: ImagePickerProps) {
    const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([])
    const [errorMessage, setErrorMessage] = useState<string>('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || [])
        const newFiles: FilePreview[] = []
        let rejectedCount = 0
        let invalidTypeCount = 0

        // Clear any previous error messages
        setErrorMessage('')

        files.forEach(file => {
            // Check if we've reached the max files limit
            if (selectedFiles.length + newFiles.length >= maxFiles) {
                rejectedCount++
                return
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                invalidTypeCount++
                return
            }

            const preview = URL.createObjectURL(file)
            newFiles.push({
                file,
                preview,
                id: Math.random().toString(36).slice(2, 9)
            })
        })

        // Set appropriate error messages
        if (rejectedCount > 0 && invalidTypeCount > 0) {
            setErrorMessage(
                `Cannot upload ${rejectedCount} file(s) - maximum ${maxFiles} files allowed. ${invalidTypeCount} file(s) rejected - only images are allowed.`
            )
        } else if (rejectedCount > 0) {
            setErrorMessage(
                `Cannot upload ${rejectedCount} file(s) - maximum ${maxFiles} files allowed.`
            )
        } else if (invalidTypeCount > 0) {
            setErrorMessage(
                `${invalidTypeCount} file(s) rejected - only images are allowed.`
            )
        }

        // Only update if we have new valid files
        if (newFiles.length > 0) {
            const updatedFiles = [...selectedFiles, ...newFiles]
            setSelectedFiles(updatedFiles)
            onFilesChange(updatedFiles.map(f => f.file))
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }

        // Clear error message after 5 seconds
        if (rejectedCount > 0 || invalidTypeCount > 0) {
            setTimeout(() => setErrorMessage(''), 5000)
        }
    }

    const removeFile = (id: string) => {
        // Clear error message when removing files
        setErrorMessage('')

        setSelectedFiles(prev => {
            const fileToRemove = prev.find(f => f.id === id)
            if (fileToRemove) {
                URL.revokeObjectURL(fileToRemove.preview)
            }
            const updatedFiles = prev.filter(f => f.id !== id)
            onFilesChange(updatedFiles.map(f => f.file))
            return updatedFiles
        })
    }

    const openFileDialog = () => {
        if (!disabled && selectedFiles.length < maxFiles) {
            fileInputRef.current?.click()
        }
    }

    const isAtMaxCapacity = selectedFiles.length >= maxFiles

    return (
        <div className={cn('space-y-3 select-none', className)}>
            {/* Error Message */}
            {errorMessage && (
                <div className='flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg'>
                    <AlertCircle className='h-4 w-4 text-destructive flex-shrink-0' />
                    <p className='text-sm text-destructive'>{errorMessage}</p>
                </div>
            )}

            {/* File Input Area */}
            <div
                className={cn(
                    'border-2 border-dashed rounded-lg p-4 text-center transition-colors',
                    isAtMaxCapacity || disabled
                        ? 'border-muted-foreground/25 opacity-50 cursor-not-allowed'
                        : 'border-muted-foreground/25 cursor-pointer hover:border-muted-foreground/50'
                )}
                onClick={openFileDialog}
            >
                <Upload className='h-6 w-6 mx-auto mb-2 text-muted-foreground' />
                {isAtMaxCapacity ? (
                    <>
                        <p className='text-sm text-muted-foreground mb-1'>
                            Maximum files reached
                        </p>
                        <p className='text-xs text-muted-foreground'>
                            Remove files to upload more
                        </p>
                    </>
                ) : (
                    <>
                        <p className='text-sm text-muted-foreground mb-1'>
                            Click to upload or drag and drop
                        </p>
                        <p className='text-xs text-muted-foreground'>
                            Images up to 5MB each (max {maxFiles} files)
                        </p>
                    </>
                )}
            </div>

            <input
                ref={fileInputRef}
                type='file'
                accept={accept}
                multiple
                onChange={handleFileSelect}
                className='hidden'
                disabled={disabled || isAtMaxCapacity}
            />

            {/* File Previews */}
            {selectedFiles.length > 0 && (
                <div className='space-y-2'>
                    <p className={cn(
                        'text-sm',
                        isAtMaxCapacity ? 'text-amber-600 font-medium' : 'text-muted-foreground'
                    )}>
                        Selected files ({selectedFiles.length}/{maxFiles})
                        {isAtMaxCapacity && ' - Maximum reached'}
                    </p>
                    <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                        {selectedFiles.map((filePreview) => (
                            <div key={filePreview.id} className='relative group'>
                                <div className='aspect-video rounded-lg overflow-hidden bg-muted'>
                                    <img
                                        src={filePreview.preview}
                                        alt={filePreview.file.name}
                                        className='w-full h-full object-cover'
                                    />
                                </div>
                                <Button
                                    type='button'
                                    variant='destructive'
                                    size='sm'
                                    className='absolute -top-2 -right-2 h-5 w-5 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
                                    onClick={() => removeFile(filePreview.id)}
                                    disabled={disabled}
                                >
                                    <X className='h-3 w-3' />
                                </Button>
                                <p className='text-xs text-muted-foreground mt-1 truncate'>
                                    {filePreview.file.name}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}