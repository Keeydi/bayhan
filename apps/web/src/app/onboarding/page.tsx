import React from 'react'
import { Onboarding } from '@components/forms'
import { getSession } from '@actions/auth'
import { redirect } from 'next/navigation'
import { createApiClient } from '@lib/api'

export default async function Page() {
    const { data } = await getSession()
    const { session: { token } } = data

    const api = createApiClient(token)
    const res = await api.get('/profile')

    if (res.status === 200) {
        redirect('/dashboard')
    }

    return (
        <div className='min-h-screen flex items-center justify-center p-4'>
            <div className='w-full max-w-2xl flex flex-col gap-5'>
                <Onboarding />
            </div>
        </div>
    )
}