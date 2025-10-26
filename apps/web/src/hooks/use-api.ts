import { createApiClient } from '@lib/api'
import { useAuth } from '@hooks/use-auth'

export const useApi = () => {
    const { session } = useAuth()

    const token = session?.token

    return createApiClient(token)
}