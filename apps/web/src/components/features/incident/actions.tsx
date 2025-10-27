'use client'

import { PermissionGuard } from '@components/auth'
import { RoleGuard } from '@components/auth/role-guard'
import { Button } from '@components/ui/button'
import { Image, MoreHorizontal, ShieldCheck, Users } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger } from '@components/ui/dialog'
import { AttachMedia } from '@components/forms'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@components/ui/dropdown-menu'
import React, { useState } from 'react'
import { useDebounce } from '@uidotdev/usehooks'
import { Label } from '@components/ui/label'
import { Slider } from '@components/ui/slider'
import { Incident } from '@repo/database'
import { cn } from '@lib/utils'
import { useApi } from '@hooks/use-api'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getIncident, getIncidentLocationData } from '@actions/incident'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@components/ui/alert-dialog'

interface IncidentActionsProps {
    incident: Incident
}


// Clean loading skeleton
const VolunteerDataSkeleton = () => (
    <div className='space-y-3'>
        <div className='grid grid-cols-2 gap-4 text-sm'>
            <div className='bg-green-50 dark:bg-green-950 p-3 rounded-lg'>
                <div className='font-medium text-green-700 dark:text-green-300'>
                    Available Volunteers
                </div>
                <div className='h-8 w-12 mt-1 bg-green-200 dark:bg-green-800 rounded animate-pulse' />
            </div>
            <div className='bg-orange-50 dark:bg-orange-950 p-3 rounded-lg'>
                <div className='font-medium text-orange-700 dark:text-orange-300'>
                    Inactive Volunteers
                </div>
                <div className='h-8 w-12 mt-1 bg-orange-200 dark:bg-orange-800 rounded animate-pulse' />
            </div>
        </div>

        <div className='space-y-2'>
            <div className='h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
            <div className='space-y-1'>
                { Array.from({ length: 3 }).map((_, i) => (
                    <div key={ i } className='h-8 w-full bg-gray-100 dark:bg-gray-800 rounded animate-pulse' />
                )) }
            </div>
        </div>
    </div>
)

const useIncident = (incidentId: string) => {
    const api = useApi()
    const router = useRouter()
    const queryClient = useQueryClient()

    const incident = useQuery({
        queryKey: [ 'incident', incidentId ],
        queryFn: () => getIncident(incidentId),
        enabled: !!incidentId
    })


    const resolve = useMutation({
        mutationKey: [ 'resolve-incident', incidentId ],
        mutationFn: async () => {
            const response = await api.patch(`/incidents/${ incidentId }/resolve`)

            await queryClient.invalidateQueries({ queryKey: [ 'incident', incidentId ] })

            return response
        },
        onSuccess: () => toast.success('Incident marked as resolved successfully'),
        onError: () => toast.error('Failed to resolve incident. Please try again.'),
        onSettled: () => router.refresh()
    })

    const attachMedia = useMutation({
        mutationKey: [ 'attach-media', incidentId ],
        mutationFn: async (files: File[]) => {
            const formData = new FormData()

            files.forEach(file => {
                formData.append('medias', file)
            })

            const response = api.post(`/incidents/${ incidentId }/medias`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            await queryClient.invalidateQueries({ queryKey: [ 'incident', incidentId ] })

            return response
        },
        onSuccess: () => toast.success('Media attached successfully'),
        onError: () => toast.error('Failed to attach media. Please try again.'),
        onSettled: () => router.refresh()
    })

    const deploy = useMutation({
        mutationKey: [ 'deploy-volunteers', incidentId ],
        mutationFn: async (proximity: number) => {
            const response = await api.post(`/incidents/${ incidentId }/deploy`, { proximity })

            await queryClient.invalidateQueries({ queryKey: [ 'incident', incidentId ] })
            await queryClient.invalidateQueries({ queryKey: [ 'incident-location', incidentId ] })

            return response
        },
        onSuccess: () => toast.success('Volunteers deployed successfully'),
        onError: () => toast.error('Failed to deploy volunteers. Please try again.'),
        onSettled: () => router.refresh()
    })

    return {
        incident,
        resolve,
        attachMedia,
        deploy
    }
}

export const IncidentActions: React.FC<IncidentActionsProps> = ({ incident }) => {
    const [ attachMediaOpen, setAttachMediaOpen ] = useState(false)
    const [ deployOpen, setDeployOpen ] = useState(false)
    const [ radius, setRadius ] = useState<number>(5)
    const debouncedRadius = useDebounce(radius, 300)

    // Get severity-based radius
    const getSeverityRadius = () => {
        switch (incident.severity) {
            case 'LOW': return 3
            case 'MED': return 5
            case 'HIGH': return 10
            case 'CRITICAL': return 'ALL'
            default: return 5
        }
    }

    const severityRadius = getSeverityRadius()
    const effectiveRadius = typeof severityRadius === 'string' ? debouncedRadius : severityRadius

    const {
        resolve,
        attachMedia,
        deploy
    } = useIncident(incident.id)

    const location = useQuery({
        queryKey: [ 'incident-location', incident.id, effectiveRadius ],
        queryFn: ({ queryKey }) => getIncidentLocationData(queryKey[1] as string, queryKey[2] as number),
        enabled: !!incident.id
    })

    const isResolving = resolve.isPending
    const isAttachingMedia = attachMedia.isPending
    const isDeploying = deploy.isPending
    const isLoadingLocation = location.isLoading || location.isFetching

    const handleDeploy = () => {
        deploy.mutate(radius, {
            onSuccess: () => {
                setDeployOpen(false)
                setRadius(5) // Reset to default
            }
        })
    }

    const locationData = location.data?.data
    const volunteersToDeploy = locationData?.volunteersToDeploy || []
    const inactiveVolunteers = locationData?.inactiveVolunteers || []

    return (
        <div className={ cn('flex items-center gap-2', incident.status === 'RESOLVED' && 'hidden') }>
            {/* Deploy Volunteers Button - Visible for CDRRMO */}
            <PermissionGuard resource='incident' action='deploy'>
                <RoleGuard roles={ ['cdrrmo'] }>
                    <AlertDialog open={ deployOpen } onOpenChange={ setDeployOpen }>
                        <AlertDialogTrigger asChild>
                            <Button variant='default' size='sm' className='gap-2'>
                                <Users className='h-4 w-4' />
                                Deploy Volunteers
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className='max-h-[90vh] flex flex-col'>
                            <AlertDialogHeader>
                                <AlertDialogTitle className='text-lg font-semibold'>
                                    Deploy Volunteers
                                </AlertDialogTitle>
                                <p className='text-sm text-muted-foreground'>
                                    Select proximity radius and deploy volunteers to respond to this incident
                                </p>
                            </AlertDialogHeader>

                            <div className='space-y-6 py-4 flex-1 min-h-[400px] overflow-y-auto'>
                                <div className='space-y-4'>
                                    {/* Severity-based info */}
                                    <div className='bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800'>
                                        <div className='flex items-center gap-2 mb-2'>
                                            <span className='text-sm font-medium text-blue-700 dark:text-blue-300'>Severity-Based Radius</span>
                                        </div>
                                        <p className='text-sm text-blue-600 dark:text-blue-400'>
                                            { typeof severityRadius === 'string' 
                                                ? 'CRITICAL incidents will notify ALL volunteers in Tarlac City'
                                                : `This ${incident.severity} severity incident uses a ${severityRadius}km radius automatically` }
                                        </p>
                                    </div>

                                    { typeof severityRadius === 'string' ? (
                                        <div className='space-y-3'>
                                            <Label className='text-sm font-medium'>Manual Radius Override</Label>
                                            <Slider
                                                value={ [ radius ] }
                                                onValueChange={ (value) => setRadius(value[0]!) }
                                                min={ 1 }
                                                max={ 100 }
                                                step={ 1 }
                                                className='w-full'
                                            />
                                            <div className='flex justify-between text-xs text-muted-foreground'>
                                                <span>1km</span>
                                                <span>100km</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className='text-sm text-muted-foreground'>
                                            Volunteers within { severityRadius }km of the incident will be notified
                                        </p>
                                    ) }
                                </div>

                                { isLoadingLocation ? (
                                    <VolunteerDataSkeleton />
                                ) : locationData ? (
                                    <div className='space-y-3'>
                                        <div className='grid grid-cols-2 gap-4 text-sm'>
                                            <div className='bg-green-50 dark:bg-green-950 p-3 rounded-lg'>
                                                <div className='font-medium text-green-700 dark:text-green-300'>
                                                    Available Volunteers
                                                </div>
                                                <div
                                                    className='text-2xl font-bold text-green-600 dark:text-green-400'>
                                                    { volunteersToDeploy.length }
                                                </div>
                                            </div>
                                            <div className='bg-orange-50 dark:bg-orange-950 p-3 rounded-lg'>
                                                <div
                                                    className='font-medium text-orange-700 dark:text-orange-300'>
                                                    Inactive Volunteers
                                                </div>
                                                <div
                                                    className='text-2xl font-bold text-orange-600 dark:text-orange-400'>
                                                    { inactiveVolunteers.length }
                                                </div>
                                            </div>
                                        </div>

                                        { volunteersToDeploy.length > 0 && (
                                            <div className='space-y-2'>
                                                <h4 className='font-medium text-sm'>Available Volunteers:</h4>
                                                <div className='max-h-32 overflow-y-auto space-y-1'>
                                                    { volunteersToDeploy.map((volunteer: any) => (
                                                        <div key={ volunteer.id }
                                                             className='flex justify-between items-center text-xs bg-green-50 dark:bg-green-950 p-2 rounded'>
                                                            <span
                                                                className='font-medium'>{ volunteer.name }</span>
                                                            <span className='text-muted-foreground'>
                                                                { Math.round(volunteer.distance * 100) / 100 }km
                                                            </span>
                                                        </div>
                                                    )) }
                                                </div>
                                            </div>
                                        ) }

                                        { inactiveVolunteers.length > 0 && (
                                            <div className='space-y-2'>
                                                <h4 className='font-medium text-sm'>Inactive Volunteers:</h4>
                                                <div className='max-h-32 overflow-y-auto space-y-1'>
                                                    { inactiveVolunteers.map((volunteer: any) => (
                                                        <div key={ volunteer.id }
                                                             className='flex justify-between items-center text-xs bg-orange-50 dark:bg-orange-950 p-2 rounded'>
                                                            <span
                                                                className='font-medium'>{ volunteer.name }</span>
                                                            <span className='text-muted-foreground'>
                                                                { Math.round(volunteer.distance * 100) / 100 }km
                                                            </span>
                                                        </div>
                                                    )) }
                                                </div>
                                            </div>
                                        ) }

                                        { volunteersToDeploy.length === 0 && inactiveVolunteers.length === 0 && (
                                            <div className='text-center py-4 text-muted-foreground'>
                                                <p className='text-sm'>No volunteers found within { radius }km
                                                    radius</p>
                                            </div>
                                        ) }
                                    </div>
                                ) : (
                                    <div className='text-center py-4 text-muted-foreground'>
                                        <p className='text-sm'>Failed to load volunteer data</p>
                                    </div>
                                ) }
                            </div>

                            <AlertDialogFooter className='mt-auto'>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={ handleDeploy }
                                    disabled={ isDeploying || radius < 1 }
                                >
                                    { isDeploying ? 'Deploying...' : 'Deploy Volunteers' }
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </RoleGuard>
            </PermissionGuard>

            <div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant='outline' size='sm'>
                            <MoreHorizontal className='h-4 w-4' />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='w-48'>
                        <PermissionGuard resource='incident' action='update'>
                            { incident.status === 'OPEN' && (
                                <DropdownMenuItem
                                    onClick={ () => resolve.mutate() }
                                    className='gap-2'
                                    disabled={ isResolving }
                                >
                                    <ShieldCheck className='h-4 w-4' />
                                    { isResolving ? 'Resolving...' : 'Mark Resolved' }
                                </DropdownMenuItem>
                            ) }
                        </PermissionGuard>

                        <PermissionGuard resource='incident' action='write'>
                            <Dialog open={ attachMediaOpen } onOpenChange={ setAttachMediaOpen }>
                                <DialogTrigger asChild>
                                    <DropdownMenuItem
                                        onSelect={ e => e.preventDefault() }
                                        className='gap-2'
                                        disabled={ isAttachingMedia }
                                    >
                                        <Image className='h-4 w-4' />
                                        { isAttachingMedia ? 'Uploading...' : 'Attach Media' }
                                    </DropdownMenuItem>
                                </DialogTrigger>
                                <DialogContent>
                                    <AttachMedia
                                        onSubmit={ files => {
                                            attachMedia.mutate(files)
                                            setAttachMediaOpen(false)
                                        } }
                                        maxFiles={ 5 }
                                    />
                                </DialogContent>
                            </Dialog>
                        </PermissionGuard>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}