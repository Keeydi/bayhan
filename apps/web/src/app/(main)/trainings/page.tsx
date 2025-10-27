import { TrainingsTable } from '@components/tables'
import { hasPermission } from '@actions/auth'
import { forbidden } from 'next/navigation'
import { Metadata } from 'next'
import { StatusFilter, TrainingCreateWrapper } from '@components/features/training'

export const metadata: Metadata = { title: 'Training Programs' }

export default async function Page() {
    const permitted = await hasPermission({ resource: 'incident', action: 'read' })

    if (!permitted) {
        forbidden()
    }

    return (
        <div className='container mx-auto'>
            <div className='flex items-center justify-between mb-6'>
                <div>
                    <h1 className='text-2xl font-bold'>Training Programs</h1>
                    <p className='text-muted-foreground'>Manage and track volunteer training programs</p>
                </div>

                <div className='flex items-center gap-3'>
                    <StatusFilter />
                    <TrainingCreateWrapper />
                </div>
            </div>

            <TrainingsTable />
        </div>
    )
}
