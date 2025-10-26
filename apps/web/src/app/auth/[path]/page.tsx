import { AuthViewWrapper } from '@components/auth-view-wrapper'

export default async function AuthPage({ params }: { params: Promise<{ path: string }> }) {
    const { path } = await params

    return <AuthViewWrapper path={ path } />
}