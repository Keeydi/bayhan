import {
    ChangeEmailCard,
    ChangePasswordCard,
    DeleteAccountCard,
    SessionsCard,
    UpdateAvatarCard
} from '@daveyplate/better-auth-ui'

export default function Page() {
    return (
        <div className='space-y-5'>
            <UpdateAvatarCard className='border-none' />
            <ChangeEmailCard className='border-none' />
            <ChangePasswordCard className='border-none' />
            <SessionsCard className='border-none' />
            <DeleteAccountCard />
        </div>
    )
}