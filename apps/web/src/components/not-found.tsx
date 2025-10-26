'use client'

import { BackButton } from '@components/ui/back-button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@components/ui/empty'
import { FileX } from 'lucide-react'
import { motion } from 'framer-motion'

interface NotFoundProps {
    title?: string
    description?: string
    backButtonText?: string
    showBackButton?: boolean
}

export function NotFound({
    title = 'Page Not Found',
    description = 'The page you\'re looking for doesn\'t exist.',
    backButtonText = 'Back to previous page',
    showBackButton = true
}: NotFoundProps = {}) {
    return (
        <motion.div
            className='container mx-auto h-4/5'
            initial={ { opacity: 0, y: 20 } }
            animate={ { opacity: 1, y: 0 } }
            transition={ { duration: 0.5, ease: 'easeOut' } }
        >
            { showBackButton && <BackButton className='mb-4' text={ backButtonText } /> }

            <Empty className='text-center h-full flex flex-col justify-center items-center'>
                <EmptyHeader>
                    <motion.div
                        initial={ { opacity: 0, scale: 0.8 } }
                        animate={ { opacity: 1, scale: 1 } }
                        transition={ {
                            duration: 0.6,
                            delay: 0.2,
                            type: 'spring',
                            stiffness: 200,
                            damping: 15
                        } }
                        whileHover={ {
                            scale: 1.1,
                            rotate: [ 0, -5, 5, -5, 0 ],
                            transition: { duration: 0.5 }
                        } }
                    >
                        <EmptyMedia>
                            <FileX />
                        </EmptyMedia>
                    </motion.div>

                    <motion.div
                        initial={ { opacity: 0, y: 20 } }
                        animate={ { opacity: 1, y: 0 } }
                        transition={ { duration: 0.5, delay: 0.3 } }
                    >
                        <EmptyTitle>{ title }</EmptyTitle>
                    </motion.div>

                    <motion.div
                        initial={ { opacity: 0, y: 20 } }
                        animate={ { opacity: 1, y: 0 } }
                        transition={ { duration: 0.5, delay: 0.4 } }
                    >
                        <EmptyDescription>
                            { description }
                        </EmptyDescription>
                    </motion.div>
                </EmptyHeader>

                <EmptyContent>
                    <motion.div
                        initial={ { opacity: 0, y: 20 } }
                        animate={ { opacity: 1, y: 0 } }
                        transition={ { duration: 0.5, delay: 0.5 } }
                    >
                        <EmptyDescription>
                            Need help? <a href='#'>Contact support</a>
                        </EmptyDescription>
                    </motion.div>
                </EmptyContent>
            </Empty>
        </motion.div>
    )
}