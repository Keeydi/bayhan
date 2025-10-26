import { Separator } from '@components/ui/separator'
import { SidebarTrigger } from '@components/ui/sidebar'
import DynamicBreadcrumb, { PatternConfig } from '@components/dynamic-breadcrumb'

const patterns = [
    {
        pattern: '/volunteers/requests/:id',
        label: 'Request Details',
        replacements: {
            id: 'Request Details'
        }
    },
    {
        pattern: '/incidents/:id',
        label: 'Incident Details',
        replacements: {
            id: 'Incident Details'
        }
    },
    {
        pattern: '/trainings/:id',
        label: 'Training Program Details',
        replacements: {
            id: 'Training Program Details'
        }
    }
] as PatternConfig[]

export function SiteHeader() {
    return (
        <header
            className='flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)'>
            <div className='flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6'>
                <SidebarTrigger className='-ml-1' />
                <Separator
                    orientation='vertical'
                    className='mx-2 data-[orientation=vertical]:h-4'
                />
                <DynamicBreadcrumb
                    showHome={ false }
                    patterns={ patterns }
                />
            </div>
        </header>
    )
}
