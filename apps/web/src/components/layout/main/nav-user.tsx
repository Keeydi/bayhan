'use client'

import { IconDotsVertical, IconLogout, IconUserCircle } from '@tabler/icons-react'

import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@components/ui/sidebar'
import { Skeleton } from '@components/ui/skeleton'
import { Spinner } from '@components/ui/spinner'
import { ThemeSwitch } from '@components/theme-toggle'
import { signOut } from '@lib/auth'
import { useRouter } from 'next/navigation'
import { useAuth, useProfile } from '@hooks/use-auth'
import Link from 'next/link'

export function NavUser() {
    const { isMobile } = useSidebar()
    const router = useRouter()
    const { user, isLoading: isUserLoading } = useAuth()
    const { profile, loading: isProfileLoading } = useProfile()

    // Use profile name if available, otherwise fall back to user name
    const profileName = `${ profile?.firstName } ${ profile?.lastName }`.trim()
    const name = profileName || user?.name || ''
    const email = user?.email || ''

    const isLoading = isUserLoading || isProfileLoading

    if (isLoading) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size='lg' disabled>
                        <Skeleton className='h-8 w-8 rounded-lg' />
                        <div className='grid flex-1 text-left text-sm leading-tight gap-1'>
                            <Skeleton className='h-4 w-24' />
                            <Skeleton className='h-3 w-32' />
                        </div>
                        <Spinner className='ml-auto size-4' />
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        )
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size='lg'
                            className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                        >
                            <Avatar className='h-8 w-8 rounded-lg'>
                                <AvatarImage src={ user?.image ?? '' } alt={ name || 'User' } />
                                <AvatarFallback className='rounded-lg'>{ (name || 'U').slice(0, 1) }</AvatarFallback>
                            </Avatar>
                            <div className='grid flex-1 text-left text-sm leading-tight'>
                                <span className='truncate font-medium'>
                                    { name || 'User' }
                                </span>
                                <span className='text-muted-foreground truncate text-xs'>
                                    { email || 'No email' }
                                </span>
                            </div>
                            <IconDotsVertical className='ml-auto size-4' />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                        side={ isMobile ? 'bottom' : 'right' }
                        align='end'
                        sideOffset={ 4 }
                    >
                        <DropdownMenuLabel className='p-0 font-normal'>
                            <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                                <Avatar className='h-8 w-8 rounded-lg'>
                                    <AvatarImage src={ user?.image ?? '' } alt={ name || 'User' } />
                                    <AvatarFallback
                                        className='rounded-lg'>{ (name || 'U').slice(0, 1) }</AvatarFallback>
                                </Avatar>
                                <div className='grid flex-1 text-left text-sm leading-tight'>
                                    <span className='truncate font-medium'>
                                        { name || 'User' }
                                    </span>
                                    <span className='text-muted-foreground truncate text-xs'>
                                        { email || 'No email' }
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild onSelect={ e => e.preventDefault() }>
                                <ThemeSwitch className='w-full' />
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href='/account'>
                                    <IconUserCircle />
                                    Account
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={ async () => {
                                await signOut({ fetchOptions: { onSuccess: () => router.push('/auth/login') } })
                            } }
                        >
                            <IconLogout />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
