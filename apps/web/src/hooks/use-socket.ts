'use client'

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from '@lib/auth'

interface UseSocketOptions {
    socketUrl: string
    autoConnect?: boolean
    namespace?: string
}

interface UseSocketReturn {
    socket: Socket | null
    isConnected: boolean
    connect: () => void
    disconnect: () => void
    emit: (event: string, data?: any) => void
    on: (event: string, callback: (...args: any[]) => void) => void
    off: (event: string, callback?: (...args: any[]) => void) => void
}

export function useSocket(options: UseSocketOptions): UseSocketReturn {
    const { autoConnect = true, namespace = '/' } = options
    const { data: session } = useSession()
    const socketRef = useRef<Socket | null>(null)
    const [ isConnected, setIsConnected ] = useState(false)

    const connect = () => {
        if (socketRef.current?.connected) return
        const { socketUrl } = options
        const socket = io(`${ socketUrl }${ namespace }`, {
            transports: [ 'websocket', 'polling' ],
            timeout: 20000,
            forceNew: true
        })

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id)
            setIsConnected(true)
        })

        socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason)
            setIsConnected(false)
        })

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error)
            setIsConnected(false)
        })

        socketRef.current = socket
    }

    const disconnect = () => {
        if (socketRef.current) {
            socketRef.current.disconnect()
            socketRef.current = null
            setIsConnected(false)
        }
    }

    const emit = (event: string, data?: any) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit(event, data)
        } else {
            console.warn('Socket not connected, cannot emit event:', event)
        }
    }

    const on = (event: string, callback: (...args: any[]) => void) => {
        if (socketRef.current) {
            socketRef.current.on(event, callback)
        }
    }

    const off = (event: string, callback?: (...args: any[]) => void) => {
        if (socketRef.current) {
            if (callback) {
                socketRef.current.off(event, callback)
            } else {
                socketRef.current.removeAllListeners(event)
            }
        }
    }

    useEffect(() => {
        if (autoConnect && session?.user) {
            connect()
        }

        return () => {
            disconnect()
        }
    }, [ autoConnect, session?.user ])

    return {
        socket: socketRef.current,
        isConnected,
        connect,
        disconnect,
        emit,
        on,
        off
    }
}
