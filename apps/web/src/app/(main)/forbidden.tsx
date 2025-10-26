import { Forbidden as ForbiddenComponent } from '@components/forbidden'
import { Metadata } from 'next'

export const metadata: Metadata = { title: '403 - Forbidden' }

export default async function Forbidden() {
    return <ForbiddenComponent title='403 - Forbidden' />
}
