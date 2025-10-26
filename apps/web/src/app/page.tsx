'use client'

import { Button } from '@components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { motion } from 'framer-motion'
import { ThemeToggle } from '@components/theme-toggle'
import Link from 'next/link'
import { useSession } from '@lib/auth'
import { cn } from '@lib/utils'
import { Spinner } from '@components/ui/spinner'

export default function Home() {
    const { data: session, isPending } = useSession()

    return (
        <div className='min-h-screen bg-background flex flex-col'>
            <header
                className='w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 sticky top-0 z-50 flex-shrink-0'>
                <div className='container mx-auto px-4 py-4'>
                    <div className='flex items-center justify-between'>
                        {/* Logo */ }
                        <div className='flex items-center gap-3'>
                            <div className='flex gap-1'>
                                <div className='w-3 h-3 bg-primary rounded-full'></div>
                                <div className='w-3 h-3 bg-primary rounded-full'></div>
                                <div className='w-3 h-3 bg-primary rounded-full'></div>
                            </div>
                            <span className='text-xl font-bold tracking-wide text-foreground'>E-BAYANIHAN</span>
                        </div>

                        {/* Navigation */ }
                        <nav className='hidden md:flex items-center gap-8'>
                            <div className='flex items-center gap-4'>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    className={ cn(
                                        'font-medium px-4 py-2 shadow-lg hover:shadow-xl transition-all',
                                        (session || isPending) && 'hidden'
                                    ) }
                                >
                                    <Link href='/auth/login'>
                                        Log In
                                    </Link>
                                </Button>
                                <Button
                                    size='sm'
                                    className={ cn(
                                        'font-medium px-4 py-2 shadow-lg hover:shadow-xl transition-all',
                                        isPending && 'hidden'
                                    ) }
                                >
                                    <Link href={ session ? '/dashboard' : '/auth/register' }>
                                        { session ? 'Dashboard' : 'Get Started' }
                                    </Link>
                                </Button>
                            </div>
                            <ThemeToggle />
                        </nav>

                        <div className='flex items-center gap-2 md:hidden'>
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </header>

            <main className='relative overflow-hidden flex-1 min-h-0'>
                {/* Background gradient */ }
                <div className='absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20 pointer-events-none' />

                <div className='relative container mx-auto px-4 py-8 w-full'>
                    {/* Hero Section */ }
                    <motion.div
                        initial={ { opacity: 0, y: 20 } }
                        animate={ { opacity: 1, y: 0 } }
                        transition={ { duration: 0.8 } }
                        className='max-w-4xl mx-auto text-center mb-16'
                    >
                        <motion.div
                            initial={ { opacity: 0, scale: 0.9 } }
                            animate={ { opacity: 1, scale: 1 } }
                            transition={ { delay: 0.2, duration: 0.6 } }
                            className='relative mb-8'
                        >
                            <div className='relative inline-flex items-center rounded-full border border-border/40 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm'>
                                🌟 Join thousands of volunteers making a difference
                            </div>
                        </motion.div>

                        <motion.div
                            initial={ { opacity: 0, y: 30 } }
                            animate={ { opacity: 1, y: 0 } }
                            transition={ { delay: 0.4, duration: 0.8 } }
                            className='relative mb-6'
                        >
                            <h1 className='relative text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl text-balance'>
                                Make a{ ' ' }
                                <span className='bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent'>
                                    Difference
                                </span>
                                <br />
                                in your{ ' ' }
                                <span
                                    className='bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent'>
                                    Community
                                </span>
                            </h1>
                        </motion.div>

                        <motion.p
                            initial={ { opacity: 0, y: 20 } }
                            animate={ { opacity: 1, y: 0 } }
                            transition={ { delay: 0.6, duration: 0.6 } }
                            className='text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed mb-10'
                        >
                            Join thousands of volunteers who are creating positive change through meaningful service
                            opportunities.
                            Make an impact that matters in your local community.
                        </motion.p>

                        <motion.div
                            initial={ { opacity: 0, y: 20 } }
                            animate={ { opacity: 1, y: 0 } }
                            transition={ { delay: 0.8, duration: 0.6 } }
                            className='relative mb-16'
                        >
                            <div className='relative flex flex-col sm:flex-row gap-4 justify-center'>
                                <Button
                                    size='lg'
                                    className='px-8 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all'
                                    disabled={ isPending }
                                    asChild
                                >
                                    <Link href={ session ? '/dashboard' : '/auth/register' }>
                                        { isPending && <Spinner /> }
                                        { session ? 'Go to Dashboard' : 'Get Started' }
                                    </Link>
                                </Button>
                            </div>
                        </motion.div>

                        {/* Trust indicators */ }
                        <motion.div
                            initial={ { opacity: 0, y: 20 } }
                            animate={ { opacity: 1, y: 0 } }
                            transition={ { delay: 1.0, duration: 0.6 } }
                            className='flex items-center justify-center text-sm text-muted-foreground'
                        >
                            <div className='flex items-center gap-2'>
                                <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
                                <span>Active community projects</span>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Mission and Vision Cards */ }
                    <motion.div
                        initial={ { opacity: 0, y: 40 } }
                        animate={ { opacity: 1, y: 0 } }
                        transition={ { delay: 1.2, duration: 0.8 } }
                        className='max-w-6xl mx-auto'
                    >
                        <div className='grid md:grid-cols-2 gap-8'>
                            {/* Mission Card */ }
                            <motion.div
                                whileHover={ { y: -5, scale: 1.02 } }
                                transition={ { duration: 0.3 } }
                            >
                                <Card className='border-border/40 bg-background/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 h-full group'>
                                    <CardHeader className='pb-4'>
                                        <div className='flex items-center gap-4'>
                                            <div className='w-12 h-12 rounded-lg bg-muted/80 border border-border/40 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300'>
                                                <svg className='w-6 h-6 text-foreground/80' fill='none'
                                                     stroke='currentColor' viewBox='0 0 24 24'>
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={ 2 } d='M13 10V3L4 14h7v7l9-11h-7z' />
                                                </svg>
                                            </div>
                                            <div className='text-left'>
                                                <CardTitle className='text-xl font-bold text-foreground mb-1'>
                                                    Our Mission
                                                </CardTitle>
                                                <div className='w-12 h-0.5 bg-foreground/20'></div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className='pt-0'>
                                        <CardDescription className='text-base text-muted-foreground leading-relaxed'>
                                            To make Tarlac City a Disaster Resilient City through community empowerment,
                                            innovative solutions, and collaborative partnerships that strengthen our
                                            preparedness and response capabilities.
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Vision Card */ }
                            <motion.div
                                whileHover={ { y: -5, scale: 1.02 } }
                                transition={ { duration: 0.3 } }
                            >
                                <Card className='border-border/40 bg-background/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 h-full group'>
                                    <CardHeader className='pb-4'>
                                        <div className='flex items-center gap-4'>
                                            <div className='w-12 h-12 rounded-lg bg-muted/80 border border-border/40 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300'>
                                                <svg className='w-6 h-6 text-foreground/80' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={ 2 } d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={ 2 } d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                                                </svg>
                                            </div>
                                            <div className='text-left'>
                                                <CardTitle className='text-xl font-bold text-foreground mb-1'>
                                                    Our Vision
                                                </CardTitle>
                                                <div className='w-12 h-0.5 bg-foreground/20'></div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className='pt-0'>
                                        <CardDescription className='text-base text-muted-foreground leading-relaxed'>
                                            A center for excellence in Disaster Management, delivering rapid response
                                            and comprehensive recovery services that serve as a model for resilient
                                            communities nationwide.
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    )
}