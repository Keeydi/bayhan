'use client'

import React, { useMemo, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { InfiniteScroll } from '@components/infinite-scroll'
import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import { Check, Eye, MoreHorizontal, X } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@components/ui/dropdown-menu'
import { Card } from '@components/ui/card'
import { Skeleton } from '@components/ui/skeleton'
import { VolunteerRequest, VolunteerRequestStatus } from '@src/lib/types'
import { useRouter } from 'next/navigation'
import { useApi } from '@hooks/use-api'
import { useAuth } from '@hooks/use-auth'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select'

const statusColors: Record<VolunteerRequestStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
}

function statusBadge(status: VolunteerRequestStatus) {
    return <Badge variant='secondary' className={ statusColors[status] }>{ status }</Badge>
}

async function fetchVolunteerRequests({ pageParam = 1, api }: {
    pageParam?: number;
    api: ReturnType<typeof useApi>
}): Promise<{
    requests: VolunteerRequest[];
    nextCursor: number | null
}> {

    const response = await api.get('/volunteers/requests', {
        params: {
            page: pageParam,
            limit: 20
        }
    })

    if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch volunteer requests')
    }

    const { requests, meta } = response.data.data
    const hasNextPage = meta.nextPage !== null

    return {
        requests: requests.map((req: any) => ({
            ...req,
            createdAt: new Date(req.createdAt),
            updatedAt: new Date(req.updatedAt)
        })),
        nextCursor: hasNextPage ? meta.nextPage : null
    }
}

function Row({ request }: { request: VolunteerRequest }) {
    const router = useRouter()
    const api = useApi()
    const queryClient = useQueryClient()

    const firstName = request.user?.profile?.firstName || request.user?.name?.split(' ')[0] || 'Unknown'
    const lastName = request.user?.profile?.lastName || request.user?.name?.split(' ').slice(1).join(' ') || 'User'

    const handleApprove = async (requestId: string, e: React.MouseEvent) => {
        e.stopPropagation()

        const toastId = toast.loading('Approving request...')
        try {
            await api.patch(`/volunteers/requests/${ requestId }/approve`)
            // Refresh the data by invalidating the query
            await queryClient.invalidateQueries({ queryKey: [ 'volunteer-requests' ] })
            toast.success('Request approved successfully', { id: toastId })
        } catch (error) {
            toast.error('Failed to approve request. Please try again.', { id: toastId })
        }
    }

    const handleReject = async (requestId: string, e: React.MouseEvent) => {
        e.stopPropagation()

        const toastId = toast.loading('Rejecting request...')
        try {
            // For now, we'll use a default reason. In a real app, you'd want a modal to input the reason
            await api.patch(`/volunteers/requests/${ requestId }/decline`, {
                reason: 'Request declined by administrator'
            })
            // Refresh the data by invalidating the query
            await queryClient.invalidateQueries({ queryKey: [ 'volunteer-requests' ] })
            toast.success('Request rejected successfully', { id: toastId })
        } catch (error) {
            console.error('Failed to reject request:', error)
            toast.error('Failed to reject request. Please try again.', { id: toastId })
        }
    }

    const handleView = (requestId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        router.push(`/volunteers/requests/${ requestId }`)
    }

    return (
        <TableRow className='hover:bg-muted/50'>
            <TableCell className='py-3 px-4'>
                <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-full bg-muted flex items-center justify-center'>
                        <span className='text-sm font-medium'>
                            { firstName[0] }{ lastName[0] }
                        </span>
                    </div>
                    <div className='flex flex-col'>
                        <span className='font-medium text-sm'>
                            { firstName } { lastName }
                        </span>
                        <span className='text-xs text-muted-foreground'>
                            { request.user?.email }
                        </span>
                    </div>
                </div>
            </TableCell>
            <TableCell className='py-3 px-4'>
                { statusBadge(request.status) }
            </TableCell>
            <TableCell className='py-3 px-4'>
                <span className='text-sm text-muted-foreground'>
                    { request.createdAt.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    }) }
                </span>
            </TableCell>
            <TableCell className='py-3 px-4'>
                { request.reason && (
                    <span className='text-sm text-muted-foreground truncate max-w-xs block'>
                        { request.reason }
                    </span>
                ) }
            </TableCell>
            <TableCell className='text-right py-3 px-4'>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                            <MoreHorizontal className='h-4 w-4' />
                            <span className='sr-only'>Open menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                            onClick={ (e) => handleView(request.id, e) }
                            className='cursor-pointer'
                        >
                            <Eye className='mr-2 h-4 w-4' /> View Details
                        </DropdownMenuItem>
                        { request.status === 'PENDING' && (
                            <>
                                <DropdownMenuItem
                                    onClick={ (e) => handleApprove(request.id, e) }
                                    className='cursor-pointer text-green-600'
                                >
                                    <Check className='mr-2 h-4 w-4' /> Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={ (e) => handleReject(request.id, e) }
                                    className='cursor-pointer text-red-600'
                                >
                                    <X className='mr-2 h-4 w-4' /> Reject
                                </DropdownMenuItem>
                            </>
                        ) }
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    )
}

function RowLoading() {
    return (
        <TableRow>
            <TableCell className='py-3 px-4'>
                <div className='flex items-center gap-3'>
                    <Skeleton className='w-10 h-10 rounded-full bg-muted' />
                    <div className='flex flex-col gap-2'>
                        <Skeleton className='h-4 w-32 bg-muted rounded' />
                        <Skeleton className='h-3 w-48 bg-muted rounded' />
                    </div>
                </div>
            </TableCell>
            <TableCell className='py-3 px-4'>
                <Skeleton className='h-6 w-20 bg-muted rounded' />
            </TableCell>
            <TableCell className='py-3 px-4'>
                <Skeleton className='h-4 w-24 bg-muted rounded' />
            </TableCell>
            <TableCell className='py-3 px-4'>
                <Skeleton className='h-4 w-32 bg-muted rounded' />
            </TableCell>
            <TableCell className='text-right py-3 px-4'>
                <Skeleton className='h-8 w-8 bg-muted rounded-full ml-auto' />
            </TableCell>
        </TableRow>
    )
}

export default function RequestsTable() {
    const api = useApi()
    const { isAuthenticated, isLoading: authLoading } = useAuth()
    const [ filterStatus, setFilterStatus ] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL')

    const { data, fetchNextPage, hasNextPage, isLoading, isError, error } = useInfiniteQuery({
        queryKey: [ 'volunteer-requests' ],
        queryFn: ({ pageParam }) => fetchVolunteerRequests({ pageParam, api }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        retry: 2,
        retryDelay: 1000,
        enabled: isAuthenticated && !authLoading // Only run query when authenticated
    })

    const requests = useMemo(() => {
        const allRequests = data?.pages.flatMap(page => page.requests) ?? []
        if (filterStatus === 'ALL') return allRequests
        return allRequests.filter(req => req.status === filterStatus)
    }, [ data, filterStatus ])

    return (
        <div className='space-y-4'>
            <div className='flex justify-end'>
                <Select value={ filterStatus } onValueChange={ (value: 'ALL' | 'PENDING' | 'APPROVED') => setFilterStatus(value) }>
                    <SelectTrigger className='w-[180px]'>
                        <SelectValue placeholder='Filter by status' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='ALL'>All Requests</SelectItem>
                        <SelectItem value='PENDING'>Pending</SelectItem>
                        <SelectItem value='APPROVED'>Approved</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card className='p-0 border-none overflow-hidden'>
                <Table>
                    <TableHeader className='sticky top-0 bg-card z-10'>
                        <TableRow>
                            <TableHead className='py-3 px-4'>User</TableHead>
                            <TableHead className='py-3 px-4'>Status</TableHead>
                            <TableHead className='py-3 px-4'>Request Date</TableHead>
                            <TableHead className='py-3 px-4'>Reason</TableHead>
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
                                    <span className='text-sm text-destructive'>Failed to load volunteer requests</span>
                                    <span className='text-xs text-muted-foreground'>
                                        { error instanceof Error ? error.message : 'An unexpected error occurred' }
                                    </span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) }

                    { !isLoading && !isError && requests.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={ 5 } className='py-8 px-4 text-center'>
                                <span className='text-sm text-muted-foreground'>No volunteer requests found.</span>
                            </TableCell>
                        </TableRow>
                    ) }

                    { requests.map(request => <Row key={ request.id } request={ request } />) }
                </InfiniteScroll>
            </Table>
        </Card>
        </div>
    )
}