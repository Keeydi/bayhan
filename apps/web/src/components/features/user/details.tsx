// Removed unused imports
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { Calendar, Mail, MapPin, Phone, User as UserIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@src/components/ui/avatar'

interface UserDetailsProps {
    user: {
        id: string
        name: string
        email: string
        image?: string
        profile?: {
            firstName: string
            lastName: string
            phone?: string
            birthDate?: string
        }
        address?: {
            fullAddress: string
        }
    }
}

export const UserDetails: React.FC<UserDetailsProps> = ({ user }) => {
    return (
        <Card className='border-none'>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <UserIcon className='h-5 w-5' />
                    Personal Information
                </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
                <div className='flex items-start gap-4'>
                    <Avatar
                        className='w-20 h-20 rounded-full bg-muted object-cover'
                    >
                        <AvatarImage
                            src={ user.image ?? '' }
                            alt={ user.name }
                        />
                        <AvatarFallback>
                            { user.name.slice(0, 1).toUpperCase() }
                        </AvatarFallback>
                    </Avatar>
                    <div className='space-y-2'>
                        <div className='text-xl font-semibold'>
                            { user.profile?.firstName } { user.profile?.lastName }
                        </div>
                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <Mail className='h-4 w-4' />
                            { user.email }
                        </div>
                        { user.profile?.phone && (
                            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                <Phone className='h-4 w-4' />
                                { user.profile.phone }
                            </div>
                        ) }
                        { user.profile?.birthDate && (
                            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                <Calendar className='h-4 w-4' />
                                Born { new Date(user.profile.birthDate).toLocaleDateString() }
                            </div>
                        ) }
                    </div>
                </div>

                { user.address && (
                    <div>
                        <div className='text-sm font-medium mb-2 flex items-center gap-2'>
                            <MapPin className='h-4 w-4' />
                            Address
                        </div>
                        <div className='text-sm text-muted-foreground pl-6'>
                            { user.address.fullAddress }
                        </div>
                    </div>
                ) }
            </CardContent>
        </Card>
    )
}