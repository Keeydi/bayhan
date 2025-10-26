import { Forbidden as ForbiddenComponent } from '@components/forbidden'

export default async function Forbidden() {
    return (
        <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm h-screen'>
            <ForbiddenComponent title='403 - Forbidden' showBackButton={false} />
        </div>
    )
}
