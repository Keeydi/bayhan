import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert'
import { AlertTriangle, FileWarning, Shield, UserPlus, Users } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { Metric, Metrics, Trends, TrendsProps } from '@components/features'
import { createApiClient } from '@lib/api'
import { getSession } from '@actions/auth'
import { Metadata } from 'next'

interface DashboardStats {
    registration: TrendsProps['registration']
    incidents: TrendsProps['incidents'],
    trends: {
        volunteers: Metric
        cdrrmo: Metric
        incidents: Metric
        requests: Metric
    }
}

interface ProfileData {
    profile: any
    address: any
    request: {
        id: string
        status: string
        createdAt: string
    } | null
    hasCredentials: boolean
    uploadedCredentialTypes: string[]
}

async function fetchDashboardStats(): Promise<DashboardStats | null> {
    const { data } = await getSession()

    const api = createApiClient(data.session?.token)

    const response = await api.get('/dashboard')

    if (response.status !== 200) {
        return null
    }

    return response.data.data
}

async function fetchProfileData(): Promise<ProfileData | null> {
    const { data } = await getSession()

    const api = createApiClient(data.session?.token)

    try {
        const response = await api.get('/profile')

        if (response.status === 200) {
            return response.data.data
        }
    } catch (error) {
        console.error('Failed to fetch profile:', error)
    }

    return null
}


export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
    const [dashboardData, profileData] = await Promise.all([
        fetchDashboardStats(),
        fetchProfileData()
    ])

    if (!dashboardData) {
        return (
            <div className='flex items-center justify-center h-64'>
                <p className='text-muted-foreground'>Failed to load dashboard data</p>
            </div>
        )
    }

    const { registration, incidents, trends } = dashboardData

    return (
        <div className='space-y-4'>
            {/* Notification for users without credentials */}
            {profileData && !profileData.hasCredentials && (
                <Alert variant='default' className='border-amber-500 bg-amber-50 dark:bg-amber-950/10'>
                    <FileWarning className='text-amber-600 dark:text-amber-500' />
                    <AlertTitle className='text-amber-900 dark:text-amber-200'>
                        Documents Required for Approval
                    </AlertTitle>
                    <AlertDescription className='text-amber-800 dark:text-amber-300/90'>
                        Your volunteer request is currently pending. To complete your application and get approved, please upload your accreditation and certification documents.{' '}
                        <Link 
                            href='/account' 
                            className='underline font-medium hover:text-amber-900 dark:hover:text-amber-100'
                        >
                            Upload documents now →
                        </Link>
                    </AlertDescription>
                </Alert>
            )}

            {/* Status notification for pending approval */}
            {profileData?.request?.status === 'PENDING' && profileData?.hasCredentials && (
                <Alert variant='default' className='border-blue-500 bg-blue-50 dark:bg-blue-950/10'>
                    <AlertTriangle className='text-blue-600 dark:text-blue-500' />
                    <AlertTitle className='text-blue-900 dark:text-blue-200'>
                        Awaiting Approval
                    </AlertTitle>
                    <AlertDescription className='text-blue-800 dark:text-blue-300/90'>
                        Your volunteer application is under review. You will be notified once your request has been processed.
                    </AlertDescription>
                </Alert>
            )}

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                <Metrics
                    title='Active Volunteers'
                    data={ trends.volunteers }
                    icon={ Users }
                />
                <Metrics
                    title='CDRRMO Users'
                    data={ trends.cdrrmo }
                    icon={ Shield }
                />
                <Metrics
                    title='Incident Reports'
                    data={ trends.incidents }
                    icon={ AlertTriangle }
                />
                <Metrics
                    title='Volunteer Requests'
                    data={ trends.requests }
                    icon={ UserPlus }
                />
            </div>

            <Trends registration={ registration } incidents={ incidents } />
        </div>
    )
}
