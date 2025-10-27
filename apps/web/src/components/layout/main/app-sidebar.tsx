'use client'

import * as React from 'react'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from '@components/ui/sidebar'
import { BookMarked, Grid2X2Plus, LayoutDashboard, MapPinned, OctagonAlert, User, UsersRound } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@lib/utils'
import { NavUser } from '@components/layout/main/nav-user'
import { useSession } from '@lib/auth'
import { Skeleton } from '@components/ui/skeleton'

enum Role {
    ADMIN = 'admin',
    CDRRMO = 'cdrrmo',
    VOLUNTEER = 'volunteer',
    UNASSIGNED = 'unassigned'
}

const data = {
    menu: [
        {
            title: 'General',
            items: [
                {
                    icon: LayoutDashboard,
                    href: '/dashboard',
                    label: 'Dashboard',
                    roles: [
                        Role.ADMIN,
                        Role.CDRRMO
                    ]
                }
            ]
        },
        {
            title: 'Volunteer',
            items: [
                {
                    icon: User,
                    href: '/volunteers',
                    label: 'Volunteers',
                    roles: [
                        Role.ADMIN,
                        Role.CDRRMO
                    ]
                },
                {
                    icon: Grid2X2Plus,
                    href: '/volunteers/requests',
                    label: 'Requests',
                    roles: [
                        Role.ADMIN,
                        Role.CDRRMO
                    ]
                },
                {
                    icon: MapPinned,
                    href: '/volunteers/tracking',
                    label: 'Tracking',
                    roles: [
                        Role.ADMIN,
                        Role.CDRRMO,
                        Role.VOLUNTEER
                    ]
                }
            ]
        },
        {
            title: 'Incidents',
            items: [
                {
                    icon: OctagonAlert,
                    href: '/incidents',
                    label: 'Incidents',
                    roles: [
                        Role.ADMIN,
                        Role.CDRRMO,
                        Role.VOLUNTEER
                    ]
                }
            ]
        },
        {
            title: 'Trainings',
            items: [
                {
                    icon: BookMarked,
                    href: '/trainings',
                    label: 'Programs',
                    roles: [
                        Role.ADMIN,
                        Role.CDRRMO,
                        Role.VOLUNTEER
                    ]
                }
            ]
        }
    ]
}

/**
 * Determines if an item url is active based on the current pathname
 * @returns true if the item url is active, false otherwise
 */
function isActiveRoute(opts: {
    /** The url of the item. Usually obtained from `item.url` */
    itemUrl: string;
    /** The current pathname. Usually obtained from `usePathname()` */
    pathname: string;
}): boolean {
    if (!opts.pathname) return false;

    if (opts.pathname === opts.itemUrl) return true;

    // if (opts.pathname.startsWith(opts.itemUrl)) {
    //     const nextChar = opts.pathname.charAt(opts.itemUrl.length);
    //     return nextChar === "/";
    // }

    return false;
}

function getMenuForRole(role: Role) {
    return data.menu.map(section => ({
        ...section,
        items: section.items.filter(item => item.roles.includes(role))
    })).filter(section => section.items.length > 0);
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();
    const { data, isPending } = useSession()
    const { user } = data || {}
    // Normalize role to lowercase to match enum
    const userRole = user?.role?.toLowerCase() || 'unassigned'
    const role = userRole as Role
    const menu = getMenuForRole(role)

    if (isPending) {
        return (
            <Sidebar
                collapsible='icon'
                variant='floating'
                { ...props }
            >
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <div className='flex items-center gap-2 p-1.5'>
                                <Skeleton className='h-5 w-5' />
                                <Skeleton className='h-4 w-24' />
                            </div>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                    { [ 1, 2, 3 ].map((section) => (
                        <SidebarGroup key={ section }>
                            <div className='px-2 py-1.5'>
                                <Skeleton className='h-4 w-20' />
                            </div>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    { [ 1, 2 ].map((item) => (
                                        <SidebarMenuItem key={ item }>
                                            <div className='flex items-center gap-2 p-1.5'>
                                                <Skeleton className='h-5 w-5' />
                                                <Skeleton className='h-4 w-16' />
                                            </div>
                                        </SidebarMenuItem>
                                    )) }
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    )) }
                </SidebarContent>
                <SidebarFooter>
                    <div className='flex items-center gap-2 p-2'>
                        <Skeleton className='h-8 w-8 rounded-full' />
                        <div className='flex-1 space-y-1'>
                            <Skeleton className='h-3 w-20' />
                            <Skeleton className='h-3 w-24' />
                        </div>
                    </div>
                </SidebarFooter>
            </Sidebar>
        )
    }

    return (
        <Sidebar
            collapsible='icon'
            variant='floating'
            { ...props }
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className='data-[slot=sidebar-menu-button]:!p-1.5'
                        >
                            <a href='#'>
                                <UsersRound className='!size-5' />
                                <span className='text-base font-semibold'>E Bayanihan</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                { menu.map((section) => (
                    <SidebarGroup key={ section.title }>
                        <SidebarGroupLabel>{ section.title }</SidebarGroupLabel>

                        <SidebarGroupContent>
                            <SidebarMenu>
                                { section.items.map(item => {
                                    const isActive = isActiveRoute({ itemUrl: item.href, pathname })
                                    return (
                                        <SidebarMenuItem key={ item.href }>
                                            <SidebarMenuButton
                                                asChild
                                                className={ cn('data-[slot=sidebar-menu-button]:!p-1.5', isActive && 'bg-border') }
                                            >
                                                <Link href={ item.href }>
                                                    <item.icon
                                                        className={ cn('!size-5', isActive && 'text-primary') } />
                                                    <span>{ item.label }</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                }) }
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )) }
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    )
}
