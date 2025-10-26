import { RequestHandler } from 'express'
import { prisma } from '@utils/database'
import { DateTime } from 'luxon'
import { Response } from '@utils/response'

export const getTodayAttendance: RequestHandler = async (req, res) => {
    const { user } = req
    const now = DateTime.utc()

    const attendance = await prisma.attendance.findFirst({
        where: {
            userId: user.id,
            date: { gte: now.startOf('day').toJSDate() }
        }
    })

    res.respond(Response.success({
        message: 'Today\'s attendance retrieved successfully',
        data: {
            hasCheckedIn: !!attendance?.checkInTime,
            hasCheckedOut: !!attendance?.checkOutTime,
            checkInTime: attendance?.checkInTime,
            checkOutTime: attendance?.checkOutTime,
            attendance
        }
    }))
}

export const checkIn: RequestHandler = async (req, res) => {
    const { user } = req
    const now = DateTime.utc()

    const existingAttendance = await prisma.attendance.findFirst({
        where: {
            userId: user.id,
            date: { gte: now.startOf('day').toJSDate() }
        }
    })

    if (existingAttendance) {
        return res.respond(Response.badRequest({
            message: 'You have already checked in today.',
            error: existingAttendance
        }))
    }

    const attendance = await prisma.attendance.create({
        data: {
            userId: user.id,
            date: now.startOf('day').toJSDate(),
            checkInTime: now.toJSDate()
        }
    })

    res.respond(Response.success({
        message: 'Check-in successful',
        data: attendance
    }))
}

export const checkOut: RequestHandler = async (req, res) => {
    const { user } = req
    const now = DateTime.utc()

    const attendance = await prisma.attendance.findFirst({
        where: {
            userId: user.id,
            date: { gte: now.startOf('day').toJSDate() },
            checkOutTime: null // Ensure we only check out if not already checked out
        }
    })

    if (!attendance) {
        return res.respond(Response.badRequest({ message: 'You have not checked in today or already checked out.' }))
    }

    const updatedAttendance = await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
            checkOutTime: now.toJSDate()
        }
    })

    res.respond(Response.success({
        message: 'Check-out successful',
        data: updatedAttendance
    }))
}