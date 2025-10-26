'use client'

import { ArrowLeft } from 'lucide-react'
import React from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@lib/utils'

export function BackButton({ text, className }: { text?: string, className?: string }) {
    const router = useRouter()

    return (
        <span
            className={ cn(
                'flex items-center gap-2 cursor-pointer select-none text-sm text-muted-foreground hover:text-foreground transition-all duration-200',
                className
            ) }
            onClick={ () => router.back() }
        >
            <ArrowLeft className='h-4 w-4' />
            { text || 'Go Back' }
        </span>
    )
}