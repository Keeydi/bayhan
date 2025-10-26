import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@components/ui/empty'
import { Clock } from 'lucide-react'
import { getSession } from '@actions/auth'
import { redirect } from 'next/navigation'

export default async function Page() {
    const { data } = await getSession()
    const { user } = data

    if (user.role !== 'unassigned') {
        return redirect(`/dashboard`)
    }

    return (
        <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm h-screen'>
            <Empty>
                <EmptyHeader>
                    <EmptyMedia>
                        <Clock />
                    </EmptyMedia>
                    <EmptyTitle>Application Under Review</EmptyTitle>
                    <EmptyDescription>
                        Your volunteer application has been received and is currently being reviewed by our team.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <EmptyDescription>
                        Please wait for an admin to review and approve your request. We'll notify you once your
                        application has been processed.
                    </EmptyDescription>
                    <EmptyDescription>
                        This typically takes 1-2 business days.
                    </EmptyDescription>
                </EmptyContent>
            </Empty>
        </div>
    )
}