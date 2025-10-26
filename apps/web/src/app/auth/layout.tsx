import React from 'react'

export default async function AuthLayout({ children }: React.PropsWithChildren) {
    return (
        <div className='min-h-screen flex items-center justify-center p-4'>
            { children }
        </div>
    )
}