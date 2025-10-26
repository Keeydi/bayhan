import { EmailTemplate } from '@daveyplate/better-auth-ui/server'

export const Verification = ({ verificationUrl, name }: { verificationUrl: string, name?: string }) => {
    return (
        <EmailTemplate
            heading='Verify your email address'
            siteName='E Bayanihan'
            baseUrl='tarlac-ebayanihan.com'
            action='Verify Email'
            imageUrl='https://cdn.brandfetch.io/idDpCfN4VD/w/400/h/400/icon.jpeg?c=1dxbfHSJFAPEGdCLU4o5B'
            url={ verificationUrl }
            content={ (
                <>
                    <p>
                        { `Hello ${ name },` }
                    </p>

                    <p>
                        Click the button below to verify your email address.
                    </p>
                </>
            ) }
        />
    )
}
