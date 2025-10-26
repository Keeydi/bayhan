import { useSession } from '@lib/auth'
import { hasPermission as serverHasPermission } from '@actions/auth'
import { Action, Resource } from '@repo/auth'
import { useApi } from '@hooks/use-api'
import { useEffect, useState } from 'react'
import { Profile } from '@repo/database'
import { useQuery } from '@tanstack/react-query'

export const useAuth = () => {
    const { isPending, data, ...rest } = useSession()
    const { user, session } = data || {}

    return {
        user,
        session,
        ...rest,
        isLoading: isPending,
        isAuthenticated: !!user && !!session
    }
}

export const useUser = () => {
    const { user } = useAuth()

    return user || null
}

export const useRole = () => {
    const user = useUser()

    return user?.role || null
}

export const useCheckPermission = <T extends Resource>(resource: T, action: Action<T> | Action<T>[]) => {
    const { user } = useAuth()
    const { data: hasPermission, isLoading: loading, error } = useQuery({
        queryKey: [ 'permission', resource, action, user?.id ],
        queryFn: () => serverHasPermission({ resource, action }),
        enabled: !!user?.id, // Only run query if user is available
        staleTime: 1000 * 60 * 2, // 2 minutes - permissions don't change often
        retry: 1 // Retry once on failure
    })

    return {
        hasPermission: hasPermission ?? false,
        loading: loading || !user?.id, // Show loading if user not available
        error
    }
}

export const useProfile = () => {
    const user = useUser()
    const api = useApi()
    const [ loading, setLoading ] = useState(false)
    const [ profile, setProfile ] = useState<Profile | null>(null)

    useEffect(() => {
        if (!user) return

        const fetchProfile = async () => {
            setLoading(true)

            const response = await api.get('/profile')

            setLoading(false)

            if (response.status !== 200) {
                return null
            }

            return response.data.data.profile as Profile
        }

        fetchProfile().then(setProfile)
    }, [ user ])

    return { profile, loading }
}

