import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { Badge } from '@components/ui/badge'
import { Separator } from '@components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { Calendar, Clock, MapPin, User, Users } from 'lucide-react'
import { format } from 'date-fns'
import { TrainingProgramStatus } from '@repo/database'
import { ReadOnlyMap, TrainingActions } from '@components/features'
import { MediaCarousel } from '@components/media-carousel'
import { BackButton } from '@components/ui/back-button'
import { createApiClient } from '@lib/api'
import { getSession, hasPermission } from '@actions/auth'
import { forbidden, notFound } from 'next/navigation'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Training Program' }

interface TrainingDetail {
    id: string
    title: string
    description: string | null
    date: Date
    location: { lat: number; lng: number; address?: string }
    facilitator: string | null
    status: TrainingProgramStatus
    createdAt: Date
    updatedAt: Date
    medias: string[]
    participants: {
        id: string
        firstName?: string
        lastName?: string
        email: string
        phone?: string
    }[]
    isParticipating: boolean
}

const statusColors: Record<TrainingProgramStatus, string> = {
    UPCOMING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    ONGOING: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    COMPLETED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
}

async function fetchTraining(id: string): Promise<TrainingDetail | null> {
    const { data } = await getSession()

    const api = createApiClient(data.session?.token)

    const response = await api.get(`/trainings/${ id }`)

    if (response.status !== 200) {
        return null
    }

    const training = response.data.data

    return {
        id: training.id,
        title: training.title,
        description: training.description,
        date: new Date(training.date),
        location: training.location,
        facilitator: training.facilitator,
        status: training.status,
        createdAt: new Date(training.createdAt),
        updatedAt: new Date(training.updatedAt),
        medias: training.medias,
        participants: training.participants,
        isParticipating: training.isParticipating
    }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const program = await fetchTraining(String(id))

    if (!program) {
        return notFound()
    }

    const permitted = await hasPermission({ resource: 'training', action: 'read' })

    if (!permitted) {
        forbidden()
    }

    return (
        <div className='container mx-auto'>
            <BackButton className='mb-4' text='Back to Trainings' />
            <div className='mb-6'>
                <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3'>
                    <h1 className='text-2xl sm:text-3xl font-bold text-balance flex-1'>{ program.title }</h1>
                    <Badge variant='secondary' className={ statusColors[program.status] }>
                        { program.status.toLowerCase() }
                    </Badge>
                </div>

                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                    <div
                        className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-muted-foreground'>
                        <div className='flex items-center gap-1'>
                            <Calendar className='h-4 w-4 flex-shrink-0' />
                            <span className='truncate'>
                                { format(program.date, 'EEE, MMM dd, yyyy') }
                            </span>
                        </div>
                        <div className='flex items-center gap-1 w-[250px]'>
                            <MapPin className='h-4 w-4 flex-shrink-0' />
                            <span className='truncate'>
                                { program.location.address }
                            </span>
                        </div>
                        <div className='flex items-center gap-1'>
                            <Users className='h-4 w-4 flex-shrink-0' />
                            <span>{ program.participants.length } participants</span>
                        </div>
                    </div>

                    <TrainingActions program={ program } />
                </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <div className='lg:col-span-2 space-y-6'>
                    <Card className='border-none'>
                        <CardHeader>
                            <CardTitle>Program Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className='text-pretty leading-relaxed'>
                                { program.description || 'No description provided for this training program.' }
                            </p>
                        </CardContent>
                    </Card>

                    <ReadOnlyMap
                        lat={ program.location.lat }
                        lng={ program.location.lng }
                        address={ program.location.address }
                        title='Training Location'
                        height='250px'
                    />

                    <Tabs defaultValue='photos' className='w-full'>
                        <TabsList className='grid w-full grid-cols-2'>
                            <TabsTrigger value='photos' className='text-sm'>Photos</TabsTrigger>
                            <TabsTrigger value='participants' className='text-sm'>Participants</TabsTrigger>
                        </TabsList>
                        <TabsContent value='photos' className='space-y-4'>
                            <MediaCarousel
                                title='Training Photos'
                                description='Visual highlights from the training program'
                                photos={ program.medias.map((url, idx) => ({
                                    id: `photo-${ idx }`,
                                    url: url || '/placeholder.svg'
                                })) }
                            />
                        </TabsContent>
                        <TabsContent value='participants' className='space-y-4'>
                            <Card className='border-none'>
                                <CardHeader>
                                    <CardTitle>Registered Participants</CardTitle>
                                    <CardDescription>
                                        { program.participants.length } people registered for this training
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className='space-y-3'>
                                        { program.participants.map((participant) => (
                                            <div key={ participant.id }
                                                 className='flex items-center justify-between gap-3 p-3 rounded-lg border'>
                                                <div className='min-w-0'>
                                                    <div className='font-medium truncate'>
                                                        { participant.firstName && participant.lastName
                                                            ? `${ participant.firstName } ${ participant.lastName }`
                                                            : participant.email }
                                                    </div>
                                                    <div className='text-sm text-muted-foreground truncate'>
                                                        { participant.email }
                                                    </div>
                                                </div>
                                                { participant.phone && (
                                                    <div
                                                        className='text-xs sm:text-sm text-muted-foreground flex-shrink-0'>
                                                        { participant.phone }
                                                    </div>
                                                ) }
                                            </div>
                                        )) }
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className='space-y-6'>
                    <Card className='border-none'>
                        <CardHeader>
                            <CardTitle>Quick Info</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='flex items-start gap-3'>
                                <Calendar className='h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0' />
                                <div className='min-w-0 flex-1'>
                                    <div className='font-medium'>Training Date</div>
                                    <div className='text-sm text-muted-foreground'>
                                        { format(program.date, 'EEEE, MMMM dd, yyyy') }
                                    </div>
                                </div>
                            </div>
                            <Separator />
                            <div className='flex items-start gap-3'>
                                <MapPin className='h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0' />
                                <div className='min-w-0 flex-1'>
                                    <div className='font-medium'>Location</div>
                                    <div className='text-sm text-muted-foreground break-words'>
                                        { program.location?.address || '—' }
                                    </div>
                                    <div className='text-xs text-muted-foreground mt-1'>
                                        { typeof program.location?.lat === 'number' && typeof program.location?.lng === 'number'
                                            ? `${ program.location.lat.toFixed(4) }, ${ program.location.lng.toFixed(4) }`
                                            : '—' }
                                    </div>
                                </div>
                            </div>
                            <Separator />
                            <div className='flex items-start gap-3'>
                                <User className='h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0' />
                                <div className='min-w-0 flex-1'>
                                    <div className='font-medium'>Trainer</div>
                                    <div className='text-sm text-muted-foreground'>
                                        { program.facilitator || 'Not specified' }
                                    </div>
                                </div>
                            </div>
                            <Separator />
                            <div className='flex items-start gap-3'>
                                <Users className='h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0' />
                                <div className='min-w-0 flex-1'>
                                    <div className='font-medium'>Participants</div>
                                    <div className='text-sm text-muted-foreground'>
                                        { program.participants.length } registered
                                    </div>
                                </div>
                            </div>
                            <Separator />
                            <div className='flex items-start gap-3'>
                                <Clock className='h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0' />
                                <div className='min-w-0 flex-1'>
                                    <div className='font-medium'>Last Updated</div>
                                    <div className='text-sm text-muted-foreground'>
                                        { format(program.updatedAt, 'MMM dd, yyyy') }
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
