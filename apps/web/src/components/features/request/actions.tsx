'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { Button } from '@components/ui/button'
import { CheckCircle, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useApi } from '@hooks/use-api'
import { toast } from 'sonner'

interface ActionsProps {
    id: string
}

export const RequestActions: React.FC<ActionsProps> = ({ id }) => {
    const router = useRouter()
    const api = useApi()
    const [ isProcessing, setIsProcessing ] = React.useState(false)

    const handleApprove = async () => {
        setIsProcessing(true)
        const toastId = toast.loading('Approving request...')

        try {
            await api.patch(`/volunteers/requests/${ id }/approve`)
            toast.success('Request approved successfully', { id: toastId })
            router.push('/volunteers/requests')
        } catch (error) {
            console.error('Error approving request:', error)
            toast.error('Failed to approve request. Please try again.', { id: toastId })
        } finally {
            setIsProcessing(false)
        }
    }

    const handleReject = async () => {
        setIsProcessing(true)
        const toastId = toast.loading('Rejecting request...')

        try {
            await api.patch(`/volunteers/requests/${ id }/decline`, {
                reason: 'Request declined by administrator'
            })
            toast.success('Request rejected successfully', { id: toastId })
            router.push('/volunteers/requests')
        } catch (error) {
            console.error('Error rejecting request:', error)
            toast.error('Failed to reject request. Please try again.', { id: toastId })
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <Card className='border-none'>
            <CardHeader>
                <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
                <Button
                    className='w-full gap-2'
                    onClick={ handleApprove }
                    disabled={ isProcessing }
                >
                    <CheckCircle className='h-4 w-4' />
                    Approve Request
                </Button>
                <Button
                    variant='outline'
                    className='w-full gap-2'
                    onClick={ handleReject }
                    disabled={ isProcessing }
                >
                    <XCircle className='h-4 w-4' />
                    Reject Request
                </Button>
            </CardContent>
        </Card>
    )
}