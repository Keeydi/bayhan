'use client'

import React, { FunctionComponent } from 'react'
import { AdvancedMarker } from '@vis.gl/react-google-maps'
import { User } from 'lucide-react'

interface VolunteerLocation {
    id: string
    name: string
    status: 'active' | 'inactive' | 'on-mission'
    lat: number
    lng: number
    lastUpdated: string
    profilePhoto?: string
}

interface Props {
    volunteer: VolunteerLocation
    onClick?: (volunteer: VolunteerLocation) => void
}

export const CustomVolunteerMarker: FunctionComponent<Props> = ({
    volunteer,
    onClick
}) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return '#10b981' // green
            case 'on-mission':
                return '#3b82f6' // blue
            case 'inactive':
            default:
                return '#6b7280' // gray
        }
    }

    const renderCustomPin = () => {
        return (
            <div className='group relative -translate-y-1 transition-transform duration-200 group-hover:-translate-y-2'>
                {/* Pin: subtle enlarge on hover */ }
                <div
                    className='relative h-[34px] max-w-[34px] w-fit p-1 rounded-full flex justify-center items-center origin-bottom border-2 shadow-md cursor-pointer transition-transform duration-200 ease-in-out group-hover:scale-110'
                    style={ {
                        borderColor: getStatusColor(volunteer.status),
                        backgroundColor: getStatusColor(volunteer.status)
                    } }
                >
                    { volunteer.profilePhoto ? (
                        <img
                            src={ volunteer.profilePhoto }
                            alt={ volunteer.name }
                            className='w-8 h-8 rounded-full object-cover border-2 border-white'
                        />
                    ) : (
                        <div
                            className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border-2 border-white'>
                            <User className='h-4 w-4' />
                        </div>
                    ) }
                </div>

                {/* Tip: subtle enlarge on hover */ }
                <div
                    className='absolute bottom-0 left-1/2 w-0 h-0 border-[8px] border-solid rounded-none rounded-br-[5px] -z-[1] translate-x-[-50%] translate-y-[22%] rotate-[45deg] transition-transform duration-200 ease-in-out group-hover:translate-y-[23%] group-hover:scale-110'
                    style={ { borderColor: getStatusColor(volunteer.status) } }
                />
            </div>
        )
    }

    return (
        <AdvancedMarker
            position={ { lat: volunteer.lat, lng: volunteer.lng } }
            title={ volunteer.name }
            onClick={ () => onClick?.(volunteer) }
        >
            { renderCustomPin() }
        </AdvancedMarker>
    )
}
