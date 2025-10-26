import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { admin as adminPlugin, openAPI } from 'better-auth/plugins'
import { createAccessControl } from 'better-auth/plugins/access'

import { bearer } from 'better-auth/plugins/bearer'

import { ResetPassword, Verification } from '../templates'
import { Resend } from 'resend'

export const statement = {
    dashboard: [ 'read' ],
    attendance: [ 'write', 'read' ],
    incident: [ 'write', 'read', 'update', 'delete', 'deploy' ],
    location: [ 'write', 'read' ],
    user: [ 'write', 'read', 'update', 'delete' ],
    profile: [ 'write', 'read', 'update' ],
    training: [ 'write', 'read', 'update', 'delete', 'participate', 'cancel' ],
    volunteer: [ 'read', 'delete', 'manage' ]
} as const

export const ac = createAccessControl(statement)

const admin = ac.newRole({
    dashboard: [ 'read' ],
    incident: [ 'write', 'read', 'update', 'delete', 'deploy' ],
    location: [ 'read' ],
    user: [ 'write', 'read', 'update', 'delete' ],
    profile: [ 'write', 'read', 'update' ],
    training: [ 'write', 'read', 'update', 'delete', 'cancel' ],
    volunteer: [ 'read', 'delete', 'manage' ]
})

const cdrrmo = ac.newRole({
    dashboard: [ 'read' ],
    attendance: [ 'write', 'read' ],
    incident: [ 'write', 'read', 'update' ],
    location: [ 'read' ],
    user: [ 'write', 'read', 'update' ],
    profile: [ 'write', 'read', 'update' ],
    training: [ 'write', 'read', 'update' ],
    volunteer: [ 'read', 'delete', 'manage' ]
})

const unassigned = ac.newRole({ profile: [ 'write', 'read' ] })

const volunteer = ac.newRole({
    attendance: [ 'write', 'read' ],
    incident: [ 'read' ],
    location: [ 'write' ],
    profile: [ 'read', 'update' ],
    training: [ 'read', 'participate' ]
})

export const roles = {
    unassigned,
    volunteer,
    cdrrmo,
    admin
}

interface CreateAuthOptions {
    prisma: any
    frontendUrl: string
    cookieDomain: string
    isProduction: boolean
    resendApiKey: string
}


export const createAuth = (options: CreateAuthOptions) => {
    const resend = new Resend(options.resendApiKey)

    return betterAuth({
        basePath: '/auth',
        database: prismaAdapter(options.prisma, { provider: 'postgresql' }),
        trustedOrigins: [ options.frontendUrl ],
        user: {
            changeEmail: {
                enabled: options.isProduction,
                sendChangeEmailVerification: async ({ user, newEmail, url }) => {
                    const result = await resend.emails.send({
                        from: 'E-Bayanihan <noreply@tarlac-ebayanihan.com>',
                        to: user.email,
                        subject: 'Verify your email',
                        react: Verification({ verificationUrl: url, name: user.name || 'there' })
                    })
                }
            }
        },
        account: {
            accountLinking: { enabled: true }
        },
        emailAndPassword: {
            enabled: true,
            requireEmailVerification: options.isProduction,
            sendResetPassword: async ({ user, url }) => {
                const result = await resend.emails.send({
                    from: 'E-Bayanihan <noreply@tarlac-ebayanihan.com>',
                    to: user.email,
                    subject: 'Reset your password',
                    react: ResetPassword({ resetPasswordUrl: url, name: user.name || 'there' })
                })
            }
        },
        emailVerification: {
            sendOnSignIn: true,
            sendOnSignUp: true,
            sendVerificationEmail: async ({ user, url }) => {
                const result = await resend.emails.send({
                    from: 'E-Bayanihan <noreply@tarlac-ebayanihan.com>',
                    to: user.email,
                    subject: 'Verify your email',
                    react: Verification({ verificationUrl: url, name: user.name || 'there' })
                })
            }
        },
        plugins: [
            bearer(),
            openAPI(),
            adminPlugin({
                ac,
                roles,
                defaultRole: 'unassigned',
                adminRoles: [ 'admin', 'cdrrmo' ]
            })
        ],
        advanced: {
            defaultCookieAttributes: {
                sameSite: 'none',
                secure: true,
                httpOnly: true,
                path: '/'
            },
            crossSubDomainCookies: {
                enabled: true,
                domain: options.cookieDomain
            }
        }
    })
}
