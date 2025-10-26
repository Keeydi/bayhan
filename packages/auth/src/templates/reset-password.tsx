import { EmailTemplate } from '@daveyplate/better-auth-ui/server'

export const ResetPassword = ({ resetPasswordUrl, name }: { resetPasswordUrl: string, name?: string }) => {
    return (
        <EmailTemplate
            heading='Reset your password'
            siteName='E Bayanihan'
            baseUrl='tarlac-ebayanihan.com'
            action='Reset Password'
            imageUrl='https://cdn.brandfetch.io/idDpCfN4VD/w/400/h/400/icon.jpeg?c=1dxbfHSJFAPEGdCLU4o5B'
            url={ resetPasswordUrl }
            content={ (
                <>
                    <p>
                        { `Hello ${ name },` }
                    </p>

                    <p>
                        Click the button below to reset your password.
                    </p>
                </>
            ) }
        />
    )
}
