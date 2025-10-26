'use client'

import React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthUIProvider } from '@daveyplate/better-auth-ui'
import { auth } from '@lib/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return <NextThemesProvider { ...props }>{ children }</NextThemesProvider>
}

const client = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: false,
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 1000 // 15 minutes
        }
    }
})

function QueryProvider({ children }: React.PropsWithChildren) {
    return (
        <QueryClientProvider client={ client }>
            { children }
        </QueryClientProvider>
    );
}

function AuthProvider({ children }: React.PropsWithChildren) {
    const router = useRouter()
    const getBaseURL = () => {
        if (typeof window === 'undefined') return 'http://localhost:8000'

        const { protocol, hostname } = window.location

        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:8000'
        }

        return `${ protocol }//api.${ hostname }`
    }

    return (
        <AuthUIProvider
            baseURL={ getBaseURL() }
            authClient={ auth }
            navigate={ router.push }
            replace={ router.replace }
            onSessionChange={ () => router.refresh() }
            Link={ Link }
            avatar={ {
                upload: async (file) => {
                    const form = new FormData()

                    form.append('avatar', file)

                    const response = await fetch('/api/profile/avatar', {
                        method: 'POST',
                        body: form
                    })

                    if (!response.ok) {
                        throw new Error('Failed to upload avatar')
                    }

                    const json = await response.json()

                    return json.data.url as string
                },
                delete: async (url) => {
                    const key = url.replace('/images/', '')

                    const response = await fetch(`/api/profile/avatar?key=${ key }`, { method: 'DELETE' })

                    if (response.ok) return

                    throw new Error('Failed to delete avatar')
                }
            } }
            account={ true }
            redirectTo='/dashboard'
            viewPaths={ {
                SIGN_IN: 'login',
                SIGN_UP: 'register'
            } }
        >
            { children }
        </AuthUIProvider>
    )
}

export function Providers({ children }: React.PropsWithChildren) {
    return (
        <QueryProvider>
            <AuthProvider>
                <ThemeProvider
                    attribute='class'
                    defaultTheme='system'
                    enableSystem
                    disableTransitionOnChange
                >
                    { children }
                </ThemeProvider>
            </AuthProvider>
        </QueryProvider>
    )
}
