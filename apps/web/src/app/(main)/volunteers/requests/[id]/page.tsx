import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { Badge } from '@components/ui/badge'
import { Clock, FileText, UserCheck } from 'lucide-react'
import { VolunteerRequestStatus } from '@src/lib/types'
import { Document, RequestActions, UserDetails } from '@components/features'
import { Media } from '@repo/database'
import { BackButton } from '@components/ui/back-button'
import { createApiClient } from '@lib/api'
import { getSession, hasPermission } from '@actions/auth'
import { forbidden, notFound } from 'next/navigation'
import { Metadata } from 'next'


export const metadata: Metadata = { title: 'Volunteer Request' }

interface VolunteerRequestWithDetails {
    id: string
    status: VolunteerRequestStatus
    reason?: string
    createdAt: Date
    updatedAt: Date
    user: {
        id: string
        name: string
        email: string
        image?: string
        profile?: {
            firstName: string
            lastName: string
            phone?: string
            birthDate?: string
        }
        address?: {
            fullAddress: string
        }
        uploadedMedias?: Media[]
    }
    updater?: {
        id: string
        name: string
        createdAt: Date
    }
}

const statusColors: Record<VolunteerRequestStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
}

function statusBadge(status: VolunteerRequestStatus) {
    return <Badge variant='secondary' className={ statusColors[status] }>{ status }</Badge>
}

async function fetchVolunteerRequest(id: string): Promise<VolunteerRequestWithDetails | null> {
    const { data } = await getSession()

    const api = createApiClient(data.session?.token)

    const response = await api.get(`/volunteers/requests/${ id }`)

    if (response.status !== 200) {
        return null
    }

    const request = response.data.data

    // The API response already matches our interface structure
    return {
        id: request.id,
        status: request.status,
        reason: request.reason,
        createdAt: new Date(request.createdAt),
        updatedAt: new Date(request.updatedAt),
        user: {
            id: request.user.id,
            name: request.user.name,
            email: request.user.email,
            image: request.user.image,
            profile: request.user.profile,
            address: request.user.address,
            uploadedMedias: request.user.uploadedMedias?.map((media: Media) => ({
                id: media.id,
                url: media.url,
                type: media.type,
                mimeType: media.mimeType,
                uploadedById: media.uploadedById,
                createdAt: new Date(media.createdAt),
                updatedAt: new Date(media.updatedAt)
            }))
        },
        updater: request.updater
    }
}


export default async function VolunteerRequestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const request = await fetchVolunteerRequest(id)

    if (!request) {
        return notFound()
    }

    const permitted = await hasPermission({ resource: 'volunteer', action: 'read' })

    if (!permitted) {
        forbidden()
    }

    return (
        <div className='space-y-6'>
            <BackButton text='Back to Request' />

            <Card className='border-none'>
                <CardHeader>
                    <div className='flex items-center justify-between'>
                        <CardTitle className='flex items-center gap-2'>
                            <UserCheck className='h-5 w-5' />
                            Volunteer Request Details
                        </CardTitle>
                        { statusBadge(request.status) }
                    </div>
                </CardHeader>
            </Card>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <div className='lg:col-span-2 space-y-6'>
                    <UserDetails user={ request.user } />

                    {/* Request Details */ }
                    <Card className='border-none'>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <FileText className='h-5 w-5' />
                                Request Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                <Clock className='h-4 w-4' />
                                Requested on { request.createdAt.toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            }) }
                            </div>

                            { request.reason && (
                                <div>
                                    <div className='text-sm font-medium mb-2'>Reason for Volunteering</div>
                                    <p className='text-sm text-muted-foreground leading-relaxed'>
                                        { request.reason }
                                    </p>
                                </div>
                            ) }
                        </CardContent>
                    </Card>
                </div>

                <div className='space-y-6'>
                    {/* Actions */ }
                    { request.status === 'PENDING' && (
                        <RequestActions id={ request.id } />
                    ) }

                    { request.user.uploadedMedias && request.user.uploadedMedias.length > 0 && (
                        <Card className='border-none shadow-sm'>
                            <CardHeader>
                                <CardTitle className='flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                        <div className='p-2 rounded-lg bg-primary/10'>
                                            <FileText className='h-5 w-5 text-primary' />
                                        </div>
                                        <div>
                                            <div className='text-lg font-semibold'>Supporting Documents</div>
                                            <div className='text-sm text-muted-foreground font-normal'>
                                                { request.user.uploadedMedias.length } document{ request.user.uploadedMedias.length !== 1 ? 's' : '' } uploaded
                                            </div>
                                        </div>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                { request.user.uploadedMedias.map((media) => <Document key={ media.id }
                                                                                       media={ media } />) }
                            </CardContent>
                        </Card>
                    ) }
                </div>
            </div>
        </div>
    )
}

