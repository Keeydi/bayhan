'use client'

import React, { useState } from 'react'
import { Button } from '@components/ui/button'
import { CircleCheck, CircleSlash, CircleX, MoreHorizontal, Trash } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@components/ui/alert-dialog'
import { TrainingProgram } from '@repo/database'
import { useApi } from '@hooks/use-api'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { PermissionGuard } from '@components/auth'
import { useUser } from '@hooks/use-auth'

interface TrainingActionsProps {
    program: TrainingProgram & { isParticipating?: boolean }
}

export const TrainingActions: React.FC<TrainingActionsProps> = ({ program }) => {
    const api = useApi()
    const router = useRouter()
    const user = useUser()
    const [ isJoining, setIsJoining ] = useState(false)
    const [ isLeaving, setIsLeaving ] = useState(false)
    const [ isCancelling, setIsCancelling ] = useState(false)
    const [ isCompleting, setIsCompleting ] = useState(false)
    const [ isDeleting, setIsDeleting ] = useState(false)
    // const [ isEditOpen, setIsEditOpen ] = useState(false)
    //
    const handleEdit = () => {

    }

    const handleJoin = async () => {
        setIsJoining(true)
        const toastId = toast.loading('Joining training program...')
        try {
            await api.patch(`/trainings/${ program.id }/join`)
            toast.success('Successfully joined the training program', { id: toastId })
            router.refresh()
        } catch (error) {
            toast.error('Failed to join training program. Please try again.', { id: toastId })
        } finally {
            setIsJoining(false)
        }
    }

    const handleLeave = async () => {
        setIsLeaving(true)
        const toastId = toast.loading('Leaving training program...')
        try {
            await api.patch(`/trainings/${ program.id }/leave`)
            toast.success('Successfully left the training program', { id: toastId })
            router.refresh()
        } catch (error) {
            toast.error('Failed to leave training program. Please try again.', { id: toastId })
        } finally {
            setIsLeaving(false)
        }
    }

    const handleCancel = async () => {
        setIsCancelling(true)
        const toastId = toast.loading('Cancelling training program...')
        try {
            await api.patch(`/trainings/${ program.id }/cancel`)
            toast.success('Training program cancelled successfully', { id: toastId })
            router.refresh()
        } catch (error) {
            toast.error('Failed to cancel training program. Please try again.', { id: toastId })
        } finally {
            setIsCancelling(false)
        }
    }

    const handleComplete = async () => {
        setIsCompleting(true)
        const toastId = toast.loading('Completing training program...')
        try {
            await api.patch(`/trainings/${ program.id }/complete`)
            toast.success('Training program marked as completed successfully', { id: toastId })
            router.refresh()
        } catch (error) {
            toast.error('Failed to complete training program. Please try again.', { id: toastId })
        } finally {
            setIsCompleting(false)
        }
    }

    const handleDelete = async () => {
        setIsDeleting(true)
        const toastId = toast.loading('Deleting training program...')
        try {
            await api.delete(`/trainings/${ program.id }`)
            toast.success('Training program deleted successfully', { id: toastId })
            router.push('/trainings')
        } catch (error) {
            toast.error('Failed to delete training program. Please try again.', { id: toastId })
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className='flex items-center gap-2'>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant='outline'
                        size='sm'
                        disabled={ user?.role === 'volunteer' && program.status !== 'UPCOMING' }
                    >
                        <MoreHorizontal className='h-4 w-4' />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-48'>
                    {/*<PermissionGuard resource='training' action='update'>*/ }
                    {/*    <DropdownMenuItem onClick={ handleEdit } className='gap-2'>*/ }
                    {/*        <Edit className='h-4 w-4' />*/ }
                    {/*        Edit*/ }
                    {/*    </DropdownMenuItem>*/ }
                    {/*</PermissionGuard>*/ }

                    { program.status === 'UPCOMING' && (
                        <PermissionGuard resource='training' action='participate'>
                            { !program.isParticipating && (
                                <DropdownMenuItem
                                    onClick={ handleJoin }
                                    className='gap-1'
                                    disabled={ isJoining }
                                >
                                    <CircleCheck className='h-4 w-4' />
                                    { isJoining ? 'Joining...' : 'Join Program' }
                                </DropdownMenuItem>
                            ) }

                            { program.isParticipating && (
                                <DropdownMenuItem
                                    onClick={ handleLeave }
                                    className='gap-1 text-destructive focus:text-destructive'
                                    disabled={ isLeaving }
                                >
                                    <CircleSlash className='text-destructive h-4 w-4' />
                                    { isLeaving ? 'Leaving...' : 'Leave Program' }
                                </DropdownMenuItem>
                            ) }
                        </PermissionGuard>
                    ) }

                    { program.status === 'ONGOING' && (
                        <PermissionGuard resource='training' action='update'>
                            <DropdownMenuItem
                                onClick={ handleComplete }
                                className='gap-1'
                                disabled={ isCompleting }
                            >
                                <CircleCheck className='h-4 w-4' />
                                { isCompleting ? 'Completing...' : 'Mark Complete' }
                            </DropdownMenuItem>
                        </PermissionGuard>
                    ) }

                    { program.status === 'UPCOMING' && (
                        <PermissionGuard resource='training' action='update'>
                            <>
                                <DropdownMenuItem
                                    onClick={ handleCancel }
                                    className='gap-1 text-orange-600 dark:text-orange-300 focus:text-orange-600 dark:focus:text-orange-300'
                                    disabled={ isCancelling }
                                >
                                    <CircleX className='text-orange-600 dark:text-orange-300  h-4 w-4' />
                                    { isCancelling ? 'Cancelling...' : 'Cancel Program' }
                                </DropdownMenuItem>
                            </>
                        </PermissionGuard>
                    ) }

                    <PermissionGuard resource='training' action='delete'>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                    onSelect={ (e) => e.preventDefault() }
                                    className='gap-1 text-destructive focus:text-destructive'
                                    disabled={ isDeleting }
                                >
                                    <Trash className='text-destructive h-4 w-4' />
                                    { isDeleting ? 'Deleting...' : 'Delete Program' }
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Training Program</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete <strong>{ program.title }</strong>?
                                        This action cannot be undone and will permanently remove the
                                        training program from the system.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction asChild>
                                        <Button onClick={ handleDelete } disabled={ isDeleting }>
                                            { isDeleting ? 'Deleting...' : 'Delete Program' }
                                        </Button>
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </PermissionGuard>
                </DropdownMenuContent>
            </DropdownMenu>
            {/*<TrainingEdit program={ program as any } open={ isEditOpen } onOpenChange={ setIsEditOpen } />*/ }
        </div>
    )
}