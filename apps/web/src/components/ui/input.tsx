import * as React from 'react'

import { cn } from '@lib/utils'
import { FileText, Upload, X } from 'lucide-react'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
    return (
        <input
            type={ type }
            data-slot='input'
            className={ cn(
                'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                className
            ) }
            { ...props }
        />
    )
}

interface FileInputProps {
    id?: string
    accept?: string
    maxSize?: number // in MB
    error?: boolean
    placeholder?: string
    description?: string
    className?: string
    disabled?: boolean
    name?: string
    value?: File | null
    onChange?: (file: File | null) => void
    onBlur?: () => void
}

export function FileInput({
    id,
    accept = '.pdf',
    maxSize = 10,
    error = false,
    placeholder = 'Click to upload',
    description = 'PDF files only, max 10MB',
    className,
    disabled = false,
    name,
    value: file,
    onChange,
    onBlur
}: FileInputProps) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null
        onChange?.(selectedFile)
        onBlur?.()

        e.target.value = ''
    }

    const handleRemoveFile = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        onChange?.(null)
        onBlur?.()
    }

    const inputId = id || `file-input-${ name || Math.random().toString(36).substr(2, 9) }`

    const formatFileSize = (bytes: number): string => {
        return (bytes / 1024 / 1024).toFixed(2)
    }

    return (
        <div
            className={ cn(
                'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
                error ? 'border-destructive' : 'border-border hover:border-primary',
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                className
            ) }
        >
            <input
                type='file'
                accept={ accept }
                onChange={ handleFileChange }
                className='hidden'
                id={ inputId }
                name={ name }
                disabled={ disabled }
            />

            <label htmlFor={ disabled ? undefined : inputId }
                   className={ disabled ? 'cursor-not-allowed' : 'cursor-pointer' }>
                <div className='flex flex-col items-center space-y-2'>
                    { file ? (
                        <>
                            <div className='relative'>
                                <FileText className='w-8 h-8 text-primary' />
                                { !disabled && (
                                    <button
                                        type='button'
                                        onClick={ handleRemoveFile }
                                        className='absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/80 transition-colors'
                                        aria-label='Remove file'
                                    >
                                        <X className='w-3 h-3' />
                                    </button>
                                ) }
                            </div>
                            <p className='text-sm font-medium break-all max-w-full'>
                                { file.name }
                            </p>
                            <p className='text-xs text-muted-foreground'>
                                { formatFileSize(file.size) } MB
                            </p>
                        </>
                    ) : (
                        <>
                            <Upload className='w-8 h-8 text-muted-foreground' />
                            <p className='text-sm font-medium'>
                                { placeholder }
                            </p>
                            <p className='text-xs text-muted-foreground'>
                                { description }
                            </p>
                        </>
                    ) }
                </div>
            </label>
        </div>
    )
}

export { Input }
