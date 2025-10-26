'use server'

import { createApiClient } from '@lib/api'
import { getSession } from '@actions/auth'

export async function getTodayAttendance() {
    const { data: sessionData } = await getSession({ redirect: false })
    if (!sessionData?.session?.token) {
        return {
            hasCheckedIn: false,
            hasCheckedOut: false,
            checkInTime: null,
            checkOutTime: null,
            attendance: null
        }
    }

    const api = createApiClient(sessionData.session.token)
    const response = await api.get('/attendance')

    return response.data.data
}
