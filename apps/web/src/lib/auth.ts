import { createClient } from '@repo/auth'

export const auth = createClient(`${ process.env.NEXT_PUBLIC_API_URL }/auth`)

export const {
    useSession,
    signIn,
    signOut
} = auth