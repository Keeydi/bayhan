'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@components/ui/card'
import { Award, Calendar, Download, Eye, FileType, MoreVertical, Shield, XCircle } from 'lucide-react'

import { Media, MediaType } from '@repo/database'
import { Badge } from '@components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@components/ui/dropdown-menu'
import { Button } from '@components//ui/button'

interface DocumentsProps {
    medias: Media[]
}

function documentTypeBadge(type: MediaType) {
    let className = ''

    switch (type) {
        case 'ACCREDITATION':
            className = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
            break
        case 'CERTIFICATION':
            className = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            break
        default:
            className = 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }

    return <Badge variant='secondary' className={ className }>{ type }</Badge>
}

function getDocumentIcon(type: MediaType) {
    return type === 'ACCREDITATION' ? Shield : Award
}

interface DocumentActionsProps {
    media: Media
}

const DocumentActions: React.FC<DocumentActionsProps> = ({ media }) => {
    const [ isViewing, setIsViewing ] = useState(false)

    const handleDownload = () => {
        const link = document.createElement('a')
        link.href = media.url
        link.download = `${ media.type.toLowerCase() }-${ media.id }.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleView = () => {
        setIsViewing(true)
    }

    const handleCloseViewer = () => {
        setIsViewing(false)
    }

    // Handle escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isViewing) {
                handleCloseViewer()
            }
        }

        if (isViewing) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [ isViewing ])

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant='ghost'
                        size='sm'
                        className='h-8 w-8 p-0'
                    >
                        <MoreVertical className='h-4 w-4' />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                    <DropdownMenuItem
                        onClick={ handleView }
                        className='flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-muted'
                    >
                        <Eye className='h-4 w-4' />
                        View Document
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={ handleDownload }
                        className='flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-muted'
                    >
                        <Download className='h-4 w-4' />
                        Download
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* PDF Viewer Modal */ }
            { isViewing && (
                <div
                    className='fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4'
                    onClick={ handleCloseViewer }
                >
                    <div
                        className='bg-background border rounded-lg w-full max-w-4xl h-[90vh] flex flex-col shadow-lg'
                        onClick={ (e) => e.stopPropagation() }
                    >
                        <div className='flex items-center justify-between p-4 border-b bg-muted/50'>
                            <h3 className='text-lg font-semibold flex items-center gap-2'>
                                <FileType className='h-5 w-5' />
                                { media.type } Document
                            </h3>
                            <div className='flex items-center gap-2'>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={ handleCloseViewer }
                                    className='bg-background hover:bg-muted'
                                >
                                    <XCircle className='h-4 w-4 mr-2' />
                                    Close
                                </Button>
                            </div>
                        </div>
                        <div className='flex-1 p-4 bg-background'>
                            <iframe
                                src={ media.url }
                                className='w-full h-full border rounded bg-background'
                                title={ `${ media.type } Document` }
                            />
                        </div>
                    </div>
                </div>
            ) }
        </>
    )
}

export const Document: React.FC<DocumentActionsProps> = ({ media }) => {
    const IconComponent = getDocumentIcon(media.type);

    return (
        <Card
            className='border-none bg-background'
            key={ media.id }>
            <CardContent>
                <div className='flex items-center justify-between gap-3'>
                    <div className='flex items-center gap-3 flex-1 min-w-0'>
                        {/* Icon with status indicator */ }
                        <div className='relative flex-shrink-0'>
                            <div
                                className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center'>
                                <IconComponent className='h-5 w-5 text-primary' />
                            </div>
                        </div>

                        {/* Content */ }
                        <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-2 mb-1'>
                                <h4 className='text-sm font-semibold text-foreground truncate'>
                                    { media.type === 'CERTIFICATION' ? 'Training Certification' : 'Professional Accreditation' }
                                </h4>
                                { documentTypeBadge(media.type) }
                            </div>
                            <div
                                className='flex items-center gap-4 text-xs text-muted-foreground'>
                                <span className='flex items-center gap-1'>
                                    <Calendar className='h-3 w-3' />
                                    { media.createdAt.toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    }) }
                                </span>
                                <span className='flex items-center gap-1'>
                                    <FileType className='h-3 w-3' />
                                    PDF Document
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */ }
                    <div className='flex-shrink-0'>
                        <DocumentActions media={ media } />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
