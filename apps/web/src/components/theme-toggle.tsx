'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@components/ui/button'
import { cn } from '@lib/utils'
import React, { useEffect, useState } from 'react'
import { Switch } from '@components/ui/switch'

export function ThemeToggle() {
    const { setTheme, theme } = useTheme()

    return (
        <Button variant='ghost' size='icon' onClick={ () => setTheme(theme === 'light' ? 'dark' : 'light') }>
            <Sun className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
            <Moon
                className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
            <span className='sr-only'>Toggle theme</span>
        </Button>
    )
}


export function ThemeSwitch({ className, ...props }: React.HTMLAttributes<HTMLLabelElement>) {
    const { setTheme, resolvedTheme } = useTheme()
    const [ mounted, setMounted ] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const currentTheme = mounted ? resolvedTheme : 'light'
    const isDark = currentTheme === 'dark'

    return (
        <label
            className={ cn('inline-flex items-center justify-between gap-3 cursor-pointer', className) } { ...props }>
            <span className='sr-only'>Toggle theme</span>
            <span className='flex items-center gap-2 text-sm font-medium'>
                <Sun className='h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
                <Moon className='absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
                { isDark ? 'Dark' : 'Light' }
            </span>
            <Switch
                checked={ isDark }
                onCheckedChange={ (checked) => setTheme(checked ? 'dark' : 'light') }
                aria-label='Toggle theme'
            />
        </label>
    )
}