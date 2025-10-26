import axios from 'axios'

export const createApiClient = (token?: string) => {
    const api = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL,
        headers: {
            ...(token ? { Authorization: `Bearer ${ token }` } : {})
        }
    })

    api.interceptors.response.use(
        response => response,
        async error => {
            const { response } = error

            if (!response) return Promise.reject(error)

            return response
        }
    )

    return api
}
