import { getSession } from '@actions/auth'
import { createApiClient } from '@lib/api'

export const getIncident = async (id: string) => {
    const { data: sessionData } = await getSession()

    const api = createApiClient(sessionData.session.token)

    const response = await api.get(`/incidents/${ id }`)

    return response.data
}

export const getIncidentLocationData = async (id: string, proximity: number = 5) => {
    const { data: sessionData } = await getSession()

    const api = createApiClient(sessionData.session.token)

    const response = await api.get(`/incidents/${ id }/location`, {
        params: { proximity }
    })

    return response.data
}