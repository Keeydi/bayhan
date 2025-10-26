'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@components/ui/button'
import { LogIn, LogOut } from 'lucide-react'
import { useApi } from '@hooks/use-api'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { Skeleton } from '@components/ui/skeleton'

export const AttendanceActions: React.FC = () => {
    const api = useApi()
    const router = useRouter()
    const [ isProcessing, setIsProcessing ] = useState(false)
    const [ isCheckedIn, setIsCheckedIn ] = useState(false)
    const [ hasCheckedOut, setHasCheckedOut ] = useState(false)
    const [ isLoading, setIsLoading ] = useState(true)

    // Fetch today's attendance data
    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const response = await api.get('/attendance')
                console.log('Attendance API response:', response.data)
                
                const data = response.data?.data
                
                if (data) {
                    setIsCheckedIn(!!data.hasCheckedIn)
                    setHasCheckedOut(!!data.hasCheckedOut)
                } else {
                    // If no data is returned, reset to default values
                    console.warn('No attendance data found in response')
                    setIsCheckedIn(false)
                    setHasCheckedOut(false)
                }
            } catch (error) {
                console.error('Failed to fetch attendance data:', error)
                setIsCheckedIn(false)
                setHasCheckedOut(false)
            } finally {
                setIsLoading(false)
            }
        }

        fetchAttendance()
    }, [ api ])

    const handleToggle = async () => {
        if (hasCheckedOut) return // If already checked out, don't allow any more actions

        setIsProcessing(true)
        const isCheckingIn = !isCheckedIn
        const toastId = toast.loading(isCheckingIn ? 'Checking in...' : 'Checking out...')
        
        try {
            if (isCheckingIn) {
                await api.post('/attendance/check-in')
                setIsCheckedIn(true)
                toast.success('Successfully checked in', { id: toastId })
            } else {
                await api.post('/attendance/check-out')
                setHasCheckedOut(true)
                toast.success('Successfully checked out', { id: toastId })
            }
        } catch (error: any) {
            const message = error?.response?.data?.message || 
                (isCheckingIn ? 'Failed to check in. Please try again.' : 'Failed to check out. Please try again.')
            toast.error(message, { id: toastId })
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <Card className='border-none'>
            <CardHeader>
                <CardTitle>Attendance</CardTitle>
            </CardHeader>
            <CardContent>
                { isLoading ? (
                    <div className='space-y-4'>
                        <Skeleton className='h-10 w-full' />
                    </div>
                ) : hasCheckedOut ? (
                    <div className='text-center text-sm text-muted-foreground py-2'>
                        You have completed your attendance for today
                    </div>
                ) : (
                    <Button
                        className='w-full'
                        variant={ isCheckedIn ? 'default' : 'secondary' }
                        onClick={ handleToggle }
                        disabled={ isProcessing }
                    >
                        { isProcessing ? (
                            <>
                                <div className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2' />
                                { isCheckedIn ? 'Checking Out...' : 'Checking In...' }
                            </>
                        ) : (
                            <>
                                { isCheckedIn ? <LogOut className='h-4 w-4 mr-2' /> : <LogIn className='h-4 w-4 mr-2' /> }
                                { isCheckedIn ? 'Check Out' : 'Check In' }
                            </>
                        ) }
                    </Button>
                ) }
            </CardContent>
        </Card>
    )
}
