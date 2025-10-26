'use client'

import type React from 'react'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@components/ui/dropdown-menu'
import {
    Calendar,
    CircleCheck,
    CircleSlash,
    CircleX,
    Eye,
    MapPin,
    MoreHorizontal,
    Trash,
    User,
    Users
} from 'lucide-react'
import { format } from 'date-fns'
import { Card } from '@components/ui/card'
import { InfiniteScroll } from '@components/infinite-scroll'
import { Skeleton } from '@components/ui/skeleton'
import { useApi } from '@hooks/use-api'
import { useAuth } from '@hooks/use-auth'
import { toast } from 'sonner'
import { PermissionGuard } from '@components/auth'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@components/ui/alert-dialog'
import { TrainingProgram, TrainingProgramStatus } from '@repo/database'

interface TrainingProgramsResponse {
    trainings: (TrainingProgram & { participantCount: number; isParticipating: boolean })[]
    nextCursor: number | null
}

const statusColors: Record<TrainingProgramStatus, string> = {
    UPCOMING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    ONGOING: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    FINISHED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
}

async function fetchTrainingPrograms({ pageParam = 1, api }: {
    pageParam?: number;
    api: ReturnType<typeof useApi>
}): Promise<TrainingProgramsResponse> {
    const response = await api.get('/trainings', {
        params: {
            page: pageParam,
            limit: 20
        }
    })

    if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch training programs')
    }

    const { trainings, meta } = response.data.data
    const hasNextPage = meta.nextPage !== null

    return {
        trainings: trainings.map((training: any) => ({
            ...training,
            date: new Date(training.date),
            createdAt: new Date(training.createdAt),
            updatedAt: new Date(training.updatedAt)
        })),
        nextCursor: hasNextPage ? meta.nextPage : null
    }
}

const Row = ({ program }: { program: TrainingProgram & { participantCount: number; isParticipating: boolean } }) => {
    const router = useRouter()
    const api = useApi()
    const queryClient = useQueryClient()

    const handleView = (programId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        router.push(`/trainings/${ programId }`)
    }

    const handleCancel = async (programId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        const toastId = toast.loading('Cancelling training program...')
        try {
            await api.patch(`/trainings/${ programId }/cancel`)
            await queryClient.invalidateQueries({ queryKey: [ 'training-programs' ] })
            toast.success('Training program cancelled successfully', { id: toastId })
        } catch (error) {
            toast.error('Failed to cancel training program. Please try again.', { id: toastId })
        }
    }

    const handleJoin = async (programId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        const toastId = toast.loading('Joining training program...')
        try {
            await api.patch(`/trainings/${ programId }/join`)
            await queryClient.invalidateQueries({ queryKey: [ 'training-programs' ] })
            toast.success('Successfully joined the training program', { id: toastId })
        } catch (error) {
            toast.error('Failed to join training program. Please try again.', { id: toastId })
        }
    }

    const handleLeave = async (programId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        const toastId = toast.loading('Leaving training program...')
        try {
            await api.patch(`/trainings/${ programId }/leave`)
            await queryClient.invalidateQueries({ queryKey: [ 'training-programs' ] })
            toast.success('Successfully left the training program', { id: toastId })
        } catch (error) {
            toast.error('Failed to leave training program. Please try again.', { id: toastId })
        }
    }

    const handleDelete = async (programId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        const toastId = toast.loading('Deleting training program...')
        try {
            await api.delete(`/trainings/${ programId }`)
            await queryClient.invalidateQueries({ queryKey: [ 'training-programs' ] })
            toast.success('Training program deleted successfully', { id: toastId })
        } catch (error) {
            toast.error('Failed to delete training program. Please try again.', { id: toastId })
        }
    }

    const hours = program.date.getHours()
    const minutes = program.date.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const time = `${ hours % 12 || 12 }:${ minutes.toString().padStart(2, '0') } ${ ampm }`

    return (
        <TableRow className='cursor-pointer hover:bg-muted/50'>
            <TableCell className='py-3 px-4 max-w-xs'>
                <div>
                    <div className='font-medium text-balance'>{ program.title }</div>
                    { program.description && (
                        <div className='text-sm text-muted-foreground text-pretty truncate mt-1'>
                            { program.description }
                        </div>
                    ) }
                </div>
            </TableCell>
            <TableCell className='py-3 px-4'>
                <div className='space-y-1'>
                    <div className='flex items-center gap-1 text-sm'>
                        <Calendar className='h-3 w-3' />
                        { format(program.date, 'MMM dd, yyyy') }
                        <span className='text-muted-foreground'>at { time }</span>
                    </div>
                    <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                        <MapPin className='h-3 w-3' />
                        <span className='truncate max-w-[22ch]'>
                            { (program.location as any).address || `${ (program.location as any).lat.toFixed(4) }, ${ (program.location as any).lng.toFixed(4) }` }
                        </span>
                    </div>
                </div>
            </TableCell>
            <TableCell className='py-3 px-4'>
                <div className='space-y-1'>
                    <div className='flex items-center gap-1'>
                        <Users className='h-4 w-4 text-muted-foreground' />
                        <span className='text-sm'>{ program.participantCount }</span>
                        { program.isParticipating && (
                            <Badge variant='outline' className='ml-2 text-xs px-1.5 py-0.5'>
                                Joined
                            </Badge>
                        ) }
                    </div>
                    { program.facilitator && (
                        <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                            <User className='h-3 w-3' />
                            <span className='truncate max-w-[20ch]'>{ program.facilitator }</span>
                        </div>
                    ) }
                </div>
            </TableCell>
            <TableCell className='py-3 px-4'>
                <Badge variant='secondary' className={ statusColors[program.status] }>
                    { program.status.toLowerCase() }
                </Badge>
            </TableCell>
            <TableCell className='text-right py-3 px-4'>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'
                                onClick={ (e) => e.stopPropagation() }>
                            <MoreHorizontal className='h-4 w-4' />
                            <span className='sr-only'>Open menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                        <PermissionGuard resource='training' action='read'>
                            <DropdownMenuItem onClick={ (e) => handleView(program.id, e) } className='cursor-pointer'>
                                <Eye className='mr-2 h-4 w-4' />
                                View Details
                            </DropdownMenuItem>
                        </PermissionGuard>

                        { program.status === 'UPCOMING' && (
                            <PermissionGuard resource='training' action='participate'>
                                { !program.isParticipating && (
                                    <DropdownMenuItem
                                        onClick={ (e) => handleJoin(program.id, e) }
                                        className='cursor-pointer'
                                    >
                                        <CircleCheck className='mr-2 h-4 w-4' />
                                        Join Program
                                    </DropdownMenuItem>
                                ) }

                                { program.isParticipating && (
                                    <DropdownMenuItem
                                        onClick={ (e) => handleLeave(program.id, e) }
                                        className='text-destructive cursor-pointer'
                                    >
                                        <CircleSlash className='text-destructive mr-2 h-4 w-4' />
                                        Leave Program
                                    </DropdownMenuItem>
                                ) }
                            </PermissionGuard>
                        ) }


                        { program.status === 'UPCOMING' && (
                            <PermissionGuard resource='training' action='update'>
                                <DropdownMenuItem
                                    onClick={ (e) => handleCancel(program.id, e) }
                                    className='text-orange-600 dark:text-orange-300 cursor-pointer'
                                >
                                    <CircleX className='text-orange-600 dark:text-orange-300 mr-2 h-4 w-4' />
                                    Cancel Program
                                </DropdownMenuItem>
                            </PermissionGuard>
                        ) }

                        <PermissionGuard resource='training' action='delete'>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                        onSelect={ (e) => e.preventDefault() }
                                        className='text-destructive cursor-pointer'
                                    >
                                        <Trash className='text-destructive mr-2 h-4 w-4' />
                                        Delete Program
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Training Program</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete <strong>{ program.title }</strong>?
                                            This action cannot be undone and will permanently remove the
                                            training program from the system.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                            onClick={ e => handleDelete(program.id, e) }
                                        >
                                            Delete Program
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </PermissionGuard>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    )
}

const RowLoading = () => {
    return (
        <>
            <TableCell className='py-3 px-4'>
                <div>
                    <Skeleton className='h-5 w-48 bg-muted rounded mb-2' />
                    <Skeleton className='h-4 w-64 bg-muted rounded' />
                </div>
            </TableCell>
            <TableCell className='py-3 px-4'>
                <div className='space-y-2'>
                    <Skeleton className='h-4 w-32 bg-muted rounded' />
                    <Skeleton className='h-4 w-28 bg-muted rounded' />
                </div>
            </TableCell>
            <TableCell className='py-3 px-4'>
                <div className='space-y-2'>
                    <Skeleton className='h-4 w-16 bg-muted rounded' />
                    <Skeleton className='h-3 w-20 bg-muted rounded' />
                </div>
            </TableCell>
            <TableCell className='py-3 px-4'>
                <Skeleton className='h-6 w-20 bg-muted rounded' />
            </TableCell>
            <TableCell className='text-right py-3 px-4'>
                <Skeleton className='h-8 w-8 bg-muted rounded-full ml-auto' />
            </TableCell>
        </>
    )
}

export function TrainingsTable() {
    const api = useApi()
    const { isAuthenticated, isLoading: authLoading } = useAuth()

    const { data, fetchNextPage, hasNextPage, isLoading, isError, error } = useInfiniteQuery({
        queryKey: [ 'training-programs' ],
        queryFn: ({ pageParam }) => fetchTrainingPrograms({ pageParam, api }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        retry: 2,
        retryDelay: 1000,
        enabled: isAuthenticated && !authLoading // Only run query when authenticated
    })

    const programs = useMemo(() => data?.pages.flatMap(page => page.trainings) ?? [], [ data ])

    return (
        <Card className='border-none overflow-hidden p-0'>
            <Table>
                <TableHeader className='sticky top-0 bg-card z-10'>
                    <TableRow>
                        <TableHead className='py-3 px-4'>Program</TableHead>
                        <TableHead className='py-3 px-4'>Date & Location</TableHead>
                        <TableHead className='py-3 px-4'>Participants</TableHead>
                        <TableHead className='py-3 px-4'>Status</TableHead>
                        <TableHead className='text-right py-3 px-4'>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <InfiniteScroll
                    as={ TableBody }
                    triggerAs={ TableRow }
                    fetchNextPage={ fetchNextPage }
                    hasNextPage={ hasNextPage }
                    loadingComponent={ <RowLoading /> }
                >
                    { isError && (
                        <TableRow>
                            <TableCell colSpan={ 5 } className='py-8 px-4 text-center'>
                                <div className='flex flex-col items-center gap-2'>
                                    <span className='text-sm text-destructive'>Failed to load training programs</span>
                                    <span className='text-xs text-muted-foreground'>
                                        { error instanceof Error ? error.message : 'An unexpected error occurred' }
                                    </span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) }

                    { isLoading && (
                        <>
                            <TableRow>
                                <RowLoading />
                            </TableRow>
                            <TableRow>
                                <RowLoading />
                            </TableRow>
                            <TableRow>
                                <RowLoading />
                            </TableRow>
                        </>
                    ) }

                    { !isLoading && !isError && programs.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={ 5 } className='py-8 px-4 text-center'>
                                <span className='text-sm text-muted-foreground'>No training programs found.</span>
                            </TableCell>
                        </TableRow>
                    ) }

                    { programs.map(program => <Row key={ program.id } program={ program } />) }
                </InfiniteScroll>
            </Table>
        </Card>
    )
}