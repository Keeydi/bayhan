'use client'

import React, { useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { InfiniteScroll } from '@components/infinite-scroll'
import { Button } from '@components/ui/button'
import { MoreHorizontal, Trash2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@components/ui/dropdown-menu'
import { Card } from '@components/ui/card';
import { Skeleton } from '@components/ui/skeleton'
import { Avatar, AvatarFallback } from '@components/ui/avatar'
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
import { User } from '@src/lib/types'
import { useApi } from '@hooks/use-api'
import { useAuth } from '@hooks/use-auth'
import { toast } from 'sonner'

const Row = ({ user }: { user: User }) => {
    const api = useApi()
    const queryClient = useQueryClient()

    const handleDelete = async () => {
        const toastId = toast.loading('Deleting volunteer...')
        try {
            await api.delete(`/volunteers/${ user.id }`)
            // Refresh the data by invalidating the query
            await queryClient.invalidateQueries({ queryKey: [ 'volunteers' ] })
            toast.success('Volunteer deleted successfully', { id: toastId })
        } catch (error) {
            toast.error('Failed to delete volunteer. Please try again.', { id: toastId })
        }
    }

    const firstName = user.profile?.firstName || user.name?.split(' ')[0] || 'Unknown'
    const lastName = user.profile?.lastName || user.name?.split(' ').slice(1).join(' ') || 'User'

    return (
        <TableRow className='hover:bg-muted/50'>
            <TableCell className='py-3 px-4'>
                <div className='flex items-center gap-3'>
                    <Avatar className='w-10 h-10'>
                        <AvatarFallback className='text-sm font-medium'>
                            { firstName[0] }{ lastName[0] }
                        </AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col'>
                        <span className='font-medium text-sm'>{ firstName } { lastName }</span>
                        <span className='text-xs text-muted-foreground'>{ user.email }</span>
                    </div>
                </div>
            </TableCell>

            <TableCell className='hidden md:table-cell py-3 px-4'>
                <span className='text-sm text-muted-foreground'>
                    { formatDate(user.createdAt.toISOString()) }
                </span>
            </TableCell>

            <TableCell className='hidden md:table-cell py-3 px-4'>
                <span className='text-sm text-muted-foreground'>
                    { formatDate(user.updatedAt.toISOString()) }
                </span>
            </TableCell>

            <TableCell className='text-right py-3 px-4'>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                            <MoreHorizontal className='h-4 w-4' />
                            <span className='sr-only'>Open menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                    className='cursor-pointer text-destructive'
                                    onSelect={ (e) => e.preventDefault() }
                                >
                                    <Trash2 className='text-destructive mr-2 h-4 w-4' />
                                    Delete
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Volunteer</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete <strong>{ firstName } { lastName }</strong>?
                                        This action cannot be undone and will permanently remove the volunteer from the
                                        system.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={ handleDelete }
                                        className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                    >
                                        Delete Volunteer
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    )
}

const RowLoading = () => {
    return (
        <TableRow>
            <TableCell className='py-3 px-4'>
                <div className='flex items-center gap-3'>
                    <Skeleton className='w-10 h-10 rounded-full' />
                    <div className='flex flex-col gap-2'>
                        <Skeleton className='h-4 w-32 rounded' />
                        <Skeleton className='h-3 w-48 rounded' />
                    </div>
                </div>
            </TableCell>

            <TableCell className='hidden md:table-cell py-3 px-4'>
                <Skeleton className='h-4 w-24 rounded' />
            </TableCell>

            <TableCell className='hidden md:table-cell py-3 px-4'>
                <Skeleton className='h-4 w-24 rounded' />
            </TableCell>

            <TableCell className='text-right py-3 px-4'>
                <Skeleton className='h-8 w-8 rounded-full ml-auto' />
            </TableCell>
        </TableRow>
    )
}

async function fetchVolunteers({ pageParam = 1, api }: {
    pageParam?: number;
    api: ReturnType<typeof useApi>
}): Promise<{
    volunteers: User[];
    nextCursor: number | null
}> {
    const response = await api.get('/volunteers', {
        params: {
            page: pageParam,
            limit: 20
        }
    })

    if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch volunteers')
    }

    const { volunteers, meta } = response.data.data
    const hasNextPage = meta.nextPage !== null

    return {
        volunteers: volunteers.map((volunteer: any) => ({
            ...volunteer,
            createdAt: new Date(volunteer.createdAt),
            updatedAt: new Date(volunteer.updatedAt)
        })),
        nextCursor: hasNextPage ? meta.nextPage : null
    }
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

export default function VolunteersTable() {
    const api = useApi()
    const { isAuthenticated, isLoading: authLoading } = useAuth()

    const { data, fetchNextPage, hasNextPage, isLoading, isError, error } = useInfiniteQuery({
        queryKey: [ 'volunteers' ],
        queryFn: ({ pageParam }) => fetchVolunteers({ pageParam, api }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        retry: 2,
        retryDelay: 1000,
        enabled: isAuthenticated && !authLoading // Only run query when authenticated
    })

    const volunteers = useMemo(() => data?.pages.flatMap(page => page.volunteers) ?? [], [ data ])

    return (
        <Card className='p-0 border-none overflow-hidden'>
            <Table>
                <TableHeader className='sticky top-0 bg-card z-10'>
                    <TableRow>
                        <TableHead className='py-3 px-4'>Volunteer</TableHead>
                        <TableHead className='hidden md:table-cell py-3 px-4'>Joined Date</TableHead>
                        <TableHead className='hidden md:table-cell py-3 px-4'>Last Updated</TableHead>
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
                            <TableCell colSpan={ 4 } className='py-3 px-4 text-center'>
                                <div className='flex flex-col items-center gap-2'>
                                    <span className='text-sm text-destructive'>Failed to load volunteers</span>
                                    <span className='text-xs text-muted-foreground'>
                                        { error instanceof Error ? error.message : 'An unexpected error occurred' }
                                    </span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) }

                    { !isLoading && !isError && volunteers.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={ 4 } className='py-3 px-4 text-center'>
                                <span className='text-sm text-muted-foreground'>No volunteers found.</span>
                            </TableCell>
                        </TableRow>
                    ) }

                    { volunteers.map(volunteer => <Row key={ volunteer.id } user={ volunteer } />) }
                </InfiniteScroll>
            </Table>
        </Card>
    )
}
