import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@lib/api'
import { getSession } from '@actions/auth'

export async function middleware(request: NextRequest) {
    const { data } = await getSession({ redirect: false })
    const { pathname } = request.nextUrl

    if (!data) {
        return NextResponse.redirect(new URL('/auth/login', request.nextUrl));
    }

    const { session, user } = data

    if (user.role === 'volunteer' && pathname === '/dashboard') {
        return NextResponse.redirect(new URL('/volunteers/tracking', request.nextUrl));
    }

    const api = createApiClient(session.token || undefined)
    const profile = await api.get('/profile')

    // Skip onboarding for test.com emails (testing purposes only)
    if (profile.status === 404 && !user.email.endsWith('@test.com')) {
        return NextResponse.redirect(new URL('/onboarding', request.nextUrl));
    }

    if (profile.status === 200 && user.role === 'unassigned') {
        return NextResponse.redirect(new URL('/pending-approval', request.nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)|api|auth|onboarding|pending-approval|$).*)'
    ]
}