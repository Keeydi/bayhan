import { NotFound as NotFoundComponent } from '@components/not-found'

export default async function NotFound() {
    return (
        <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm h-screen'>
            <NotFoundComponent title='404 - Not Found' showBackButton={ false } />
        </div>
    )
}
