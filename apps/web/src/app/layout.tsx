import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@components/providers'
import React from 'react'
import { PermissionGuard } from '@components/auth'
import { LocationTracker } from '@components/features'
import { Toaster } from '@components/ui/sonner'

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: [ 'latin' ]
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: [ 'latin' ]
});

export const metadata: Metadata = {
    title: {
        template: '%s | E Bayanihan',
        default: 'E Bayanihan'
    }
}

export default function RootLayout({ children }: React.PropsWithChildren) {
    return (
        <html lang='en' suppressHydrationWarning>
        <body className={ `${ geistSans.variable } ${ geistMono.variable } antialiased min-h-screen` }>
        <Providers>
            <PermissionGuard resource='location' action='write'>
                <LocationTracker debug={ process.env.NODE_ENV === 'development' } />
            </PermissionGuard>

            { children }
            <Toaster />
        </Providers>
        </body>
        </html>
    );
}
