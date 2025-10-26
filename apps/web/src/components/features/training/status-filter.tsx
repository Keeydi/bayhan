'use client'

import React, { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select'
import { useQueryClient } from '@tanstack/react-query'
import { TrainingProgramStatus } from '@lib/types'

type FilterStatus = 'ALL' | 'UPCOMING' | 'FINISHED'

export function StatusFilter() {
    const [ filterStatus, setFilterStatus ] = useState<FilterStatus>('ALL')
    const queryClient = useQueryClient()

    const handleFilterChange = (value: FilterStatus) => {
        setFilterStatus(value)
        // Update the query key to trigger a refetch with the new filter
        queryClient.invalidateQueries({ queryKey: [ 'training-programs' ] })
    }

    return (
        <Select value={ filterStatus } onValueChange={ handleFilterChange }>
            <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Filter by status' />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value='ALL'>All Programs</SelectItem>
                <SelectItem value='UPCOMING'>Upcoming</SelectItem>
                <SelectItem value='FINISHED'>Finished</SelectItem>
            </SelectContent>
        </Select>
    )
}
