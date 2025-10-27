'use client'

import React, { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { Eye, MoreHorizontal, ShieldCheck } from 'lucide-react'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table'
import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import { Skeleton } from '@components/ui/skeleton'
import { Card } from '@components/ui/card'
import { InfiniteScroll } from '@components/infinite-scroll'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select'
import { Incident, IncidentSeverity, IncidentStatus } from '@lib/types'
import { PermissionGuard } from '@components/auth'
import { useApi } from '@hooks/use-api'
import { useAuth } from '@hooks/use-auth'
import { toast } from 'sonner'

function statusBadge(status: IncidentStatus) {
    const color = status === 'OPEN'
        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    return <Badge variant='secondary' className={ color }>{ status }</Badge>
}

function severityBadge(severity: IncidentSeverity) {
    const map = {
        LOW: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
        MED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
        CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    } as const
    return <Badge variant='secondary' className={ map[severity] }>{ severity }</Badge>
}

async function fetchIncidents({ pageParam = 1, filterType, api }: {
    pageParam?: number;
    filterType?: string;
    api: ReturnType<typeof useApi>
}): Promise<{
    incidents: Incident[];
    nextCursor: number | null
}> {
    const params: any = {
        page: pageParam,
        limit: 20
    }
    
    if (filterType && filterType !== 'ALL') {
        params.type = filterType
    }

    const response = await api.get('/incidents', { params })

    if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch incidents')
    }

    const { incidents, meta } = response.data.data
    const hasNextPage = meta.nextPage !== null

    return {
        incidents: incidents.map((incident: any) => ({
            ...incident,
            createdAt: new Date(incident.createdAt),
            updatedAt: new Date(incident.updatedAt),
            reporter: incident.reporter ? {
                id: incident.reporter.id,
                name: incident.reporter.name,
                email: incident.reporter.email,
                profile: incident.reporter.profile ? {
                    firstName: incident.reporter.profile.firstName,
                    lastName: incident.reporter.profile.lastName
                } : undefined
            } : undefined
        })),
        nextCursor: hasNextPage ? meta.nextPage : null
    }
}

function Row({ incident }: { incident: Incident }) {
    const api = useApi()
    const queryClient = useQueryClient()

    const handleResolve = async (incidentId: string) => {
        const toastId = toast.loading('Resolving incident...')

        const response = await api.patch(`/incidents/${ incidentId }/resolve`)

        if (response.data?.success) {
            await queryClient.invalidateQueries({ queryKey: [ 'incidents' ] })
            toast.success('Incident resolved successfully', { id: toastId })
            return
        }

        const errorMessage = response.data?.message || 'Failed to resolve incident'
        toast.error(errorMessage, { id: toastId })
    }

    return (
        <TableRow className='cursor-pointer hover:bg-muted/50'>
            <TableCell className='py-3 px-4 max-w-xs'>
                <div>
                    <div className='font-medium text-balance'>{ incident.title }</div>
                    { incident.description && (
                        <div className='text-sm text-muted-foreground truncate mt-1'>
                            { incident.description }
                        </div>
                    ) }
                </div>
            </TableCell>
            <TableCell className='hidden md:table-cell py-3 px-4'>{ severityBadge(incident.severity) }</TableCell>
            <TableCell className='hidden md:table-cell py-3 px-4'>{ statusBadge(incident.status) }</TableCell>
            <TableCell className='hidden md:table-cell py-3 px-4'>
                <span className='text-sm text-muted-foreground'>
                    { incident.reporter ?
                        (incident.reporter.profile ?
                                `${ incident.reporter.profile.firstName } ${ incident.reporter.profile.lastName }` :
                                incident.reporter.name
                        ) :
                        `User ${ incident.reportedBy.slice(-4) }`
                    }
                </span>
            </TableCell>
            <TableCell className='hidden md:table-cell py-3 px-4'>
                <span className='text-sm text-muted-foreground'>
                    { incident.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
                </span>
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
                        <DropdownMenuItem asChild>
                            <Link href={ `/incidents/${ incident.id }` }>
                                <Eye className='mr-2 h-4 w-4' /> View
                            </Link>
                        </DropdownMenuItem>

                        <PermissionGuard resource='incident' action='update'>
                            { incident.status === 'OPEN' && (
                                <DropdownMenuItem
                                    className='cursor-pointer'
                                    onClick={ () => handleResolve(incident.id) }
                                >
                                    <ShieldCheck className='mr-2 h-4 w-4' /> Mark Resolved
                                </DropdownMenuItem>
                            ) }
                        </PermissionGuard>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    )
}

function RowLoading() {
    return (
        <>
            <TableCell className='py-3 px-4'>
                <div className='space-y-2'>
                    <Skeleton className='h-5 w-48 bg-muted rounded' />
                    <Skeleton className='h-4 w-64 bg-muted rounded' />
                </div>
            </TableCell>
            <TableCell className='hidden md:table-cell py-3 px-4'>
                <Skeleton className='h-6 w-20 bg-muted rounded' />
            </TableCell>
            <TableCell className='hidden md:table-cell py-3 px-4'>
                <Skeleton className='h-6 w-20 bg-muted rounded' />
            </TableCell>
            <TableCell className='hidden md:table-cell py-3 px-4'>
                <Skeleton className='h-4 w-24 bg-muted rounded' />
            </TableCell>
            <TableCell className='hidden md:table-cell py-3 px-4'>
                <Skeleton className='h-4 w-24 bg-muted rounded' />
            </TableCell>
            <TableCell className='text-right py-3 px-4'>
                <Skeleton className='h-8 w-8 bg-muted rounded-full ml-auto' />
            </TableCell>
        </>
    )
}


export function IncidentsTable() {
    const api = useApi()
    const { isAuthenticated, isLoading: authLoading } = useAuth()

    const { data, fetchNextPage, hasNextPage, isLoading, isError, error } = useInfiniteQuery({
        queryKey: [ 'incidents' ],
        queryFn: ({ pageParam }) => fetchIncidents({ pageParam, api }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        retry: 2,
        retryDelay: 1000,
        enabled: isAuthenticated && !authLoading // Only run query when authenticated
    })

    const incidents = useMemo(() => data?.pages.flatMap(page => page.incidents) ?? [], [ data ])

    return (
        <Card className='p-0 border-none overflow-hidden'>
            <Table>
                <TableHeader className='sticky top-0 bg-card z-10'>
                    <TableRow>
                        <TableHead className='py-3 px-4'>Incident</TableHead>
                        <TableHead className='hidden md:table-cell py-3 px-4'>Severity</TableHead>
                        <TableHead className='hidden md:table-cell py-3 px-4'>Status</TableHead>
                        <TableHead className='hidden md:table-cell py-3 px-4'>Reported By</TableHead>
                        <TableHead className='hidden md:table-cell py-3 px-4'>Date</TableHead>
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

                    { isError && (
                        <TableRow>
                            <TableCell colSpan={ 6 } className='py-8 px-4 text-center'>
                                <div className='flex flex-col items-center gap-2'>
                                    <span className='text-sm text-destructive'>Failed to load incidents</span>
                                    <span className='text-xs text-muted-foreground'>
                                        { error instanceof Error ? error.message : 'An unexpected error occurred' }
                                    </span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) }

                    { !isLoading && !isError && incidents.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={ 6 } className='py-8 px-4 text-center'>
                                <span className='text-sm text-muted-foreground'>No incidents found.</span>
                            </TableCell>
                        </TableRow>
                    ) }

                    { incidents.map(incident => <Row key={ incident.id } incident={ incident } />) }
                </InfiniteScroll>
            </Table>
        </Card>
    )
}

export function IncidentsTableWithFilter() {
    const [ filterType, setFilterType ] = React.useState<'ALL' | 'FLOODING' | 'LAHAR_FLOW' | 'EARTHQUAKE' | 'OTHER'>('ALL')

    return (
        <>
            <div className='flex items-center gap-4 mb-6 justify-end'>
                <Select value={ filterType } onValueChange={ (value: any) => setFilterType(value) }>
                    <SelectTrigger className='w-[200px]'>
                        <SelectValue placeholder='Filter by incident type' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='ALL'>All Incidents</SelectItem>
                        <SelectItem value='FLOODING'>Flooding</SelectItem>
                        <SelectItem value='LAHAR_FLOW'>Lahar Flow</SelectItem>
                        <SelectItem value='EARTHQUAKE'>Earthquake</SelectItem>
                        <SelectItem value='OTHER'>Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <IncidentsTableWithFilterContent filterType={ filterType } />
        </>
    )
}

function IncidentsTableWithFilterContent({ filterType }: { filterType: string }) {
    const api = useApi()
    const { isAuthenticated, isLoading: authLoading } = useAuth()

    const { data, fetchNextPage, hasNextPage, isLoading, isError, error } = useInfiniteQuery({
        queryKey: [ 'incidents', filterType ],
        queryFn: ({ pageParam }) => fetchIncidents({ pageParam, filterType, api }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        retry: 2,
        retryDelay: 1000,
        enabled: isAuthenticated && !authLoading
    })

    const incidents = useMemo(() => data?.pages.flatMap(page => page.incidents) ?? [], [ data ])

    return (
        <Card className='p-0 border-none overflow-hidden'>
            <Table>
                <TableHeader className='sticky top-0 bg-card z-10'>
                    <TableRow>
                        <TableHead className='py-3 px-4'>Incident</TableHead>
                        <TableHead className='hidden md:table-cell py-3 px-4'>Severity</TableHead>
                        <TableHead className='hidden md:table-cell py-3 px-4'>Status</TableHead>
                        <TableHead className='hidden md:table-cell py-3 px-4'>Reported By</TableHead>
                        <TableHead className='hidden md:table-cell py-3 px-4'>Date</TableHead>
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

                    { isError && (
                        <TableRow>
                            <TableCell colSpan={ 6 } className='py-8 px-4 text-center'>
                                <div className='flex flex-col items-center gap-2'>
                                    <span className='text-sm text-destructive'>Failed to load incidents</span>
                                    <span className='text-xs text-muted-foreground'>
                                        { error instanceof Error ? error.message : 'An unexpected error occurred' }
                                    </span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) }

                    { !isLoading && !isError && incidents.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={ 6 } className='py-8 px-4 text-center'>
                                <span className='text-sm text-muted-foreground'>No incidents found.</span>
                            </TableCell>
                        </TableRow>
                    ) }

                    { incidents.map(incident => <Row key={ incident.id } incident={ incident } />) }
                </InfiniteScroll>
            </Table>
        </Card>
    )
}


