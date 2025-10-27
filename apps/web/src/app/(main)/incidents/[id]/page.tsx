import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { Badge } from '@components/ui/badge'
import { Separator } from '@components/ui/separator'
import { Calendar, Flag, Image, MapPin, User } from 'lucide-react'
import { ReadOnlyMap } from '@components/features/map'
import { MediaCarousel } from '@components/media-carousel'
import { format } from 'date-fns'
import { BackButton } from '@components/ui/back-button'
import { IncidentActions } from '@components/features/incident'
import { Incident, IncidentSeverity, IncidentStatus, Media } from '@repo/database'
import { IncidentType } from '@lib/types'
import { createApiClient } from '@lib/api'
import { getSession, hasPermission } from '@actions/auth'
import { forbidden, notFound } from 'next/navigation'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Incident' }

interface IncidentDetail {
    id: string
    title: string
    description?: string
    location: { lat: number; lng: number; address?: string }
    type?: IncidentType
    status: IncidentStatus
    severity: IncidentSeverity
    reportedBy: string
    createdAt: Date
    updatedAt: Date
    medias: Media[]
    reporter: {
        id: string
        name: string
        email: string
        image?: string
        profile?: {
            firstName: string
            lastName: string
            phone?: string
        }
    }
}

const statusColors: Record<IncidentStatus, string> = {
    OPEN: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    RESOLVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
}

const severityColors: Record<IncidentSeverity, string> = {
    LOW: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
    MED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
}

async function fetchIncident(id: string): Promise<IncidentDetail | null> {
    const { data } = await getSession()

    const api = createApiClient(data.session?.token)

    const response = await api.get(`/incidents/${ id }`)

    if (response.status !== 200) {
        return null
    }

    const incident = response.data.data

    return {
        id: incident.id,
        title: incident.title,
        description: incident.description,
        location: incident.location,
        type: incident.type,
        status: incident.status,
        severity: incident.severity,
        reportedBy: incident.reportedBy,
        createdAt: new Date(incident.createdAt),
        updatedAt: new Date(incident.updatedAt),
        medias: incident.medias.map((media: Media) => ({
            id: media.id,
            url: media.url,
            type: media.type,
            mimeType: media.mimeType,
            uploadedById: media.uploadedById,
            createdAt: new Date(media.createdAt),
            updatedAt: new Date(media.updatedAt)
        })),
        reporter: incident.reporter
    }

}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const incident = await fetchIncident(String(id))

    if (!incident) {
        return notFound()
    }

    const permitted = await hasPermission({ resource: 'incident', action: 'read' })

    if (!permitted) {
        forbidden()
    }

    return (
        <div className='container mx-auto'>
            <BackButton className='mb-4' text='Back to Incidents' />
            <div className='mb-6'>
                <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3'>
                    <h1 className='text-2xl sm:text-3xl font-bold text-balance flex-1'>{ incident.title }</h1>
                    <div className='flex items-center gap-2'>
                        <Badge variant='secondary' className={ severityColors[incident.severity] }>
                            { incident.severity.toLowerCase() }
                        </Badge>
                        <Badge variant='secondary' className={ statusColors[incident.status] }>
                            { incident.status.toLowerCase() }
                        </Badge>
                    </div>
                </div>

                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                    <div
                        className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-muted-foreground'>
                        <div className='flex items-center gap-1'>
                            <User className='h-4 w-4 flex-shrink-0' />
                            <span className='truncate'>Reported by { incident.reporter.name }</span>
                        </div>
                        <div className='flex items-center gap-1'>
                            <Calendar className='h-4 w-4 flex-shrink-0' />
                            <span className='truncate'>
                                { format(incident.createdAt, 'EEE, MMM dd, yyyy') }
                            </span>
                        </div>
                        <div className='flex items-center gap-1 w-[250px]'>
                            <MapPin className='h-4 w-4 flex-shrink-0' />
                            <span className='truncate'>
                                { incident.location?.address || 'Unknown location' }
                            </span>
                        </div>
                        <div className='flex items-center gap-1'>
                            <Image className='h-4 w-4 flex-shrink-0' />
                            <span>{ incident.medias.length } media files</span>
                        </div>
                    </div>

                    <IncidentActions incident={ incident as Incident } />
                </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <div className='lg:col-span-2 space-y-6'>
                    <Card className='border-none'>
                        <CardHeader>
                            <CardTitle>Incident Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className='text-pretty leading-relaxed'>
                                { incident.description || 'No description provided for this incident.' }
                            </p>
                        </CardContent>
                    </Card>

                    <ReadOnlyMap
                        lat={ incident.location.lat }
                        lng={ incident.location.lng }
                        address={ incident.location.address }
                        title='Incident Location'
                        height='250px'
                    />

                    <MediaCarousel
                        title='Incident Media'
                        description='Images attached to this incident'
                        photos={ incident.medias }
                    />
                </div>

                <div className='space-y-6'>
                    <Card className='border-none'>
                        <CardHeader>
                            <CardTitle>Quick Info</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='flex items-start gap-3'>
                                <User className='h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0' />
                                <div className='min-w-0 flex-1'>
                                    <div className='font-medium'>Reported By</div>
                                    <div className='text-sm text-muted-foreground'>
                                        { incident.reporter.name }
                                    </div>
                                </div>
                            </div>
                            <Separator />
                            <div className='flex items-start gap-3'>
                                <Calendar className='h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0' />
                                <div className='min-w-0 flex-1'>
                                    <div className='font-medium'>Created</div>
                                    <div className='text-sm text-muted-foreground'>
                                        { format(incident.createdAt, 'EEEE, MMMM dd, yyyy') }
                                    </div>
                                </div>
                            </div>
                            <Separator />
                            <div className='flex items-start gap-3'>
                                <MapPin className='h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0' />
                                <div className='min-w-0 flex-1'>
                                    <div className='font-medium'>Location</div>
                                    <div className='text-sm text-muted-foreground break-words'>
                                        { incident.location?.address || 'Unknown location' }
                                    </div>
                                    <div className='text-xs text-muted-foreground mt-1'>
                                        { incident.location.lat.toFixed(4) }, { incident.location.lng.toFixed(4) }
                                    </div>
                                </div>
                            </div>
                            <Separator />
                            <div className='flex items-start gap-3'>
                                <Flag className='h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0' />
                                <div className='min-w-0 flex-1'>
                                    <div className='font-medium'>Last Updated</div>
                                    <div className='text-sm text-muted-foreground'>
                                        { format(incident.updatedAt, 'MMM dd, yyyy') }
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

        </div>
    )
}