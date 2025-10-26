import { RequestHandler } from 'express'
import { prisma } from '@utils/database'
import { Response } from '@utils/response'
import { Role } from '@src/types/user'
import { VolunteerRequestStatus } from '@repo/database'
import { DateTime } from 'luxon'

export const getDashboard: RequestHandler = async (req, res) => {

    const now = DateTime.utc()
    const lastMonth = now.minus({ months: 1 })
    const twoMonthsAgo = now.minus({ months: 2 })
    const sixMonthsAgo = now.minus({ months: 6 })

    const [
        activeVolunteers,
        cdrrmoUsers,
        incidentReports,
        volunteerRequests
    ] = await Promise.all([
        // Active volunteers count
        prisma.user.count({
            where: {
                role: Role.VOLUNTEER,
                requests: {
                    some: {
                        status: VolunteerRequestStatus.APPROVED
                    }
                }
            }
        }),
        // CDRRMO users count
        prisma.user.count({
            where: {
                role: Role.CDRRMO
            }
        }),
        // Total incident reports
        prisma.incident.count(),
        // Total volunteer requests
        prisma.volunteerRequest.count()
    ])

    // Get previous month metrics for trend calculation
    const [
        lastMonthActiveVolunteers,
        lastMonthCdrrmoUsers,
        lastMonthIncidentReports,
        lastMonthVolunteerRequests
    ] = await Promise.all([
        prisma.user.count({
            where: {
                role: Role.VOLUNTEER,
                requests: {
                    some: {
                        status: VolunteerRequestStatus.APPROVED,
                        createdAt: {
                            gte: twoMonthsAgo.startOf('month').toJSDate(),
                            lt: lastMonth.startOf('month').toJSDate()
                        }
                    }
                }
            }
        }),
        prisma.user.count({
            where: {
                role: Role.CDRRMO,
                createdAt: {
                    gte: twoMonthsAgo.startOf('month').toJSDate(),
                    lt: lastMonth.startOf('month').toJSDate()
                }
            }
        }),
        prisma.incident.count({
            where: {
                createdAt: {
                    gte: twoMonthsAgo.startOf('month').toJSDate(),
                    lt: lastMonth.startOf('month').toJSDate()
                }
            }
        }),
        prisma.volunteerRequest.count({
            where: {
                createdAt: {
                    gte: twoMonthsAgo.startOf('month').toJSDate(),
                    lt: lastMonth.startOf('month').toJSDate()
                }
            }
        })
    ])

    const calculateChange = (current: number, previous: number): number => {
        if (previous === 0) return current > 0 ? 100 : 0
        return Math.round(((current - previous) / previous) * 100)
    }

    const [ userRegistrationData, incidentReportsData ] = await Promise.all([
        prisma.user.groupBy({
            by: [ 'createdAt' ],
            where: {
                createdAt: {
                    gte: sixMonthsAgo.startOf('month').toJSDate(),
                    lte: now.endOf('month').toJSDate()
                }
            },
            _count: {
                id: true
            }
        }),

        prisma.incident.groupBy({
            by: [ 'createdAt' ],
            where: {
                createdAt: {
                    gte: sixMonthsAgo.startOf('month').toJSDate(),
                    lte: now.endOf('month').toJSDate()
                }
            },
            _count: {
                id: true
            }
        })
    ])

    const volunteerRegistrationData = await prisma.volunteerRequest.groupBy({
        by: [ 'createdAt' ],
        where: {
            status: VolunteerRequestStatus.APPROVED,
            createdAt: {
                gte: sixMonthsAgo.startOf('month').toJSDate(),
                lte: now.endOf('month').toJSDate()
            }
        },
        _count: {
            id: true
        }
    })

    const months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ]

    const registrationTrends = []
    const incidentTrends = []

    for (let i = 5; i >= 0; i--) {
        const targetDate = now.minus({ months: i })
        const monthName = months[targetDate.month - 1]!

        const monthUsers = userRegistrationData
            .filter(data => {
                const dataDate = DateTime.fromJSDate(data.createdAt)
                return dataDate.month === targetDate.month && dataDate.year === targetDate.year
            })
            .reduce((sum, data) => sum + data._count.id, 0)

        const monthVolunteers = volunteerRegistrationData
            .filter(data => {
                const dataDate = DateTime.fromJSDate(data.createdAt)
                return dataDate.month === targetDate.month && dataDate.year === targetDate.year
            })
            .reduce((sum, data) => sum + data._count.id, 0)

        const monthReports = incidentReportsData
            .filter(data => {
                const dataDate = DateTime.fromJSDate(data.createdAt)
                return dataDate.month === targetDate.month && dataDate.year === targetDate.year
            })
            .reduce((sum, data) => sum + data._count.id, 0)

        registrationTrends.push({
            month: monthName,
            users: monthUsers,
            volunteers: monthVolunteers
        })

        incidentTrends.push({
            month: monthName,
            reports: monthReports
        })
    }

    // Build response data
    const dashboardData = {
        registration: registrationTrends,
        incidents: incidentTrends,
        trends: {
            volunteers: {
                value: activeVolunteers,
                change: calculateChange(activeVolunteers, lastMonthActiveVolunteers),
                changeType: calculateChange(activeVolunteers, lastMonthActiveVolunteers) >= 0 ? 'positive' : 'negative'
            },
            cdrrmo: {
                value: cdrrmoUsers,
                change: calculateChange(cdrrmoUsers, lastMonthCdrrmoUsers),
                changeType: calculateChange(cdrrmoUsers, lastMonthCdrrmoUsers) >= 0 ? 'positive' : 'negative'
            },
            incidents: {
                value: incidentReports,
                change: calculateChange(incidentReports, lastMonthIncidentReports),
                changeType: calculateChange(incidentReports, lastMonthIncidentReports) >= 0 ? 'positive' : 'negative'
            },
            requests: {
                value: volunteerRequests,
                change: calculateChange(volunteerRequests, lastMonthVolunteerRequests),
                changeType: calculateChange(volunteerRequests, lastMonthVolunteerRequests) >= 0 ? 'positive' : 'negative'
            }
        }
    }

    res.respond(Response.success({
        message: 'Dashboard statistics retrieved successfully',
        data: dashboardData
    }))
}