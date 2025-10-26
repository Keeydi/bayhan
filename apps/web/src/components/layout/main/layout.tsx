'use client'

import React, { useEffect, useState } from 'react'
import { AppSidebar } from './app-sidebar'
import { SiteHeader } from './site-header'
import { SIDEBAR_COOKIE_NAME, SidebarInset, SidebarProvider } from '@components/ui/sidebar'

export function MainLayout({ children }: React.PropsWithChildren) {
    const [ defaultOpen, setDefaultOpen ] = useState<boolean | undefined>(undefined);
    const [ isLoaded, setIsLoaded ] = useState(false);

    useEffect(() => {
        const cookieValue = document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${ SIDEBAR_COOKIE_NAME }=`))
            ?.split('=')[1];

        setDefaultOpen(cookieValue === undefined ? true : cookieValue === 'true');
        setIsLoaded(true);
    }, []);

    if (!isLoaded) {
        return <div className='w-full h-screen bg-background' />
    }

    return (
        <SidebarProvider
            defaultOpen={ defaultOpen }
            open={ defaultOpen }
            onOpenChange={ (open) => {
                setDefaultOpen(open);

                document.cookie = `${ SIDEBAR_COOKIE_NAME }=${ open }`;
            } }
            style={
                {
                    '--sidebar-width': 'calc(var(--spacing) * 72)',
                    '--header-height': 'calc(var(--spacing) * 12)'
                } as React.CSSProperties
            }
        >
            <AppSidebar variant='inset' />
            <SidebarInset>
                <SiteHeader />
                <div className='flex flex-1 flex-col'>
                    <div className='@container/main flex flex-1 flex-col gap-2'>
                        <div className='flex flex-col p-4 md:p-6 h-full'>
                            { children }
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}