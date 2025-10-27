'use client'

import React, { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select'
import { useQueryClient } from '@tanstack/react-query'


type FilterType = 'ALL' | 'FLOODING' | 'LAHAR_FLOW' | 'EARTHQUAKE' | 'OTHER'

export function IncidentTypeFilter() {
    const [ filterType, setFilterType ] = useState<FilterType>('ALL')
    const queryClient = useQueryClient()

    const handleFilterChange = (value: FilterType) => {
        setFilterType(value)
        // Update the query key to trigger a refetch with the new filter
        queryClient.invalidateQueries({ queryKey: [ 'incidents' ] })
    }

    return (
        <Select value={ filterType } onValueChange={ handleFilterChange }>
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
    )
}
