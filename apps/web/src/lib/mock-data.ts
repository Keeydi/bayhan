// Mock data that matches the Prisma schema structure
// This ensures the frontend data structure matches what the API will return

import {
    Attendance,
    Certification,
    DashboardStats,
    Incident,
    IncidentSeverity,
    IncidentStatus,
    PaginatedResponse,
    Role,
    Session,
    TrainingProgram,
    TrainingProgramStatus,
    User,
    VolunteerRequest,
    VolunteerRequestStatus
} from './types'

// Mock data generators
export const generateMockUsers = (count: number = 50, startIndex: number = 0): User[] => {
    const roles: Role[] = [ 'CDRRMO', 'VOLUNTEER', 'ADMIN', 'UNASSIGNED' ]
    const firstNames = [
        'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Jessica',
        'William', 'Ashley', 'James', 'Amanda', 'Christopher', 'Jennifer', 'Daniel',
        'Lisa', 'Matthew', 'Nancy', 'Anthony', 'Karen', 'Mark', 'Betty', 'Donald',
        'Helen', 'Steven', 'Sandra', 'Paul', 'Donna', 'Andrew', 'Carol', 'Joshua',
        'Ruth', 'Kenneth', 'Sharon', 'Kevin', 'Michelle', 'Brian', 'Laura', 'George',
        'Sarah', 'Edward', 'Kimberly', 'Ronald', 'Deborah', 'Timothy', 'Dorothy'
    ]

    const lastNames = [
        'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
        'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
        'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
        'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
        'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill'
    ]

    return Array.from({ length: count }, (_, i) => {
        const n = i + 1 + startIndex
        const firstName = firstNames[i % firstNames.length]!
        const lastName = lastNames[i % lastNames.length]!
        const name = `${ firstName } ${ lastName }`
        const email = `${ firstName.toLowerCase() }.${ lastName.toLowerCase() }@example.com`

        return {
            id: `user-${ n }`,
            name,
            email,
            role: roles[i % roles.length]!,
            createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(),
            profile: {
                userId: `user-${ n }`,
                firstName: firstName,
                lastName: lastName,
                phone: `+63${ Math.floor(Math.random() * 9000000000) + 1000000000 }`,
                birthDate: new Date(Date.now() - Math.random() * 50 * 365 * 24 * 60 * 60 * 1000),
                createdAt: new Date(),
                updatedAt: new Date()
            },
            address: Math.random() > 0.3 ? {
                id: `addr-${ n }`,
                userId: `user-${ n }`,
                street: `${ Math.floor(Math.random() * 999) + 1 } ${ [ 'Main St', 'Oak Ave', 'Pine Rd', 'Cedar Ln', 'Maple Dr' ][i % 5] }`,
                city: [ 'Manila', 'Quezon City', 'Makati', 'Taguig', 'Pasig' ][i % 5]!,
                state: 'Metro Manila',
                zipCode: `${ Math.floor(Math.random() * 9000) + 1000 }`,
                createdAt: new Date(),
                updatedAt: new Date()
            } : undefined
        }
    })
}

export const generateMockIncidents = (count: number = 30, startIndex: number = 0): Incident[] => {
    const titles = [
        'Flooded Street', 'Road Blockage', 'Fire Report', 'Power Outage',
        'Medical Emergency', 'Landslide', 'Earthquake Aftershock', 'Typhoon Damage',
        'Building Collapse', 'Gas Leak', 'Water Shortage', 'Traffic Accident',
        'Bridge Damage', 'Tree Fall', 'Sewage Overflow', 'Chemical Spill'
    ]

    const severities: IncidentSeverity[] = [ 'LOW', 'MODERATE', 'HIGH', 'CRITICAL' ]
    const statuses: IncidentStatus[] = [ 'OPEN', 'RESOLVED' ]

    return Array.from({ length: count }, (_, i) => {
        const n = i + 1 + startIndex
        const date = new Date()
        date.setHours(date.getHours() - Math.floor(Math.random() * 240))

        return {
            id: `incident-${ n }`,
            title: titles[i % titles.length]!,
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            location: {
                latitude: 14.5 + Math.random() * 0.5,
                longitude: 120.8 + Math.random() * 0.5,
                address: 'Metro Manila, Philippines'
            },
            status: statuses[i % statuses.length]!,
            severity: severities[i % severities.length]!,
            reportedBy: `user-${ Math.floor(Math.random() * 50) + 1 }`,
            createdAt: date,
            updatedAt: new Date(),
            medias: Math.random() > 0.5 ? [
                `/images/incident-${ n }-1.jpg`,
                `/images/incident-${ n }-2.jpg`
            ] : []
        }
    })
}

export const generateMockTrainingPrograms = (count: number = 25, startIndex: number = 0): TrainingProgram[] => {
    const titles = [
        'Emergency Response Training', 'First Aid Certification', 'Disaster Preparedness Workshop',
        'Search and Rescue Operations', 'Communication Protocols', 'Equipment Handling',
        'Team Leadership Skills', 'Crisis Management', 'Volunteer Coordination',
        'Safety Procedures', 'Incident Command System', 'Resource Management'
    ]

    const locations = [
        'Main Conference Room', 'Training Center A', 'Online Platform', 'Auditorium B',
        'Workshop Room 1', 'Executive Boardroom', 'Learning Hub', 'Virtual Classroom'
    ]

    const statuses: TrainingProgramStatus[] = [ 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED' ]

    return Array.from({ length: count }, (_, i) => {
        const n = i + 1 + startIndex
        const date = new Date()
        date.setDate(date.getDate() + Math.floor(Math.random() * 90) - 30)
        date.setHours(Math.floor(Math.random() * 8) + 9)
        date.setMinutes(Math.random() > 0.5 ? 0 : 30)

        const title = titles[i % titles.length]!

        return {
            id: `training-${ n }`,
            title,
            description: `Comprehensive training program designed to enhance ${ title.toLowerCase() } skills and knowledge.`,
            date,
            location: {
                latitude: 14.58 + Math.random() * 0.3,
                longitude: 121.03 + Math.random() * 0.3,
                address: locations[i % locations.length]!
            },
            status: statuses[i % statuses.length]!,
            createdAt: new Date(),
            updatedAt: new Date(),
            medias: Math.random() > 0.6 ? [
                `/images/training-${ n }-1.jpg`,
                `/images/training-${ n }-2.jpg`
            ] : []
        }
    })
}

export const generateMockVolunteerRequests = (count: number = 20, startIndex: number = 0): VolunteerRequest[] => {
    const statuses: VolunteerRequestStatus[] = [ 'PENDING', 'APPROVED', 'REJECTED' ]
    const reasons = [
        'Interested in helping the community during emergencies',
        'Have relevant experience in disaster response',
        'Want to contribute to public safety',
        'Previous volunteer experience in similar organizations',
        'Professional background in emergency services'
    ]

    return Array.from({ length: count }, (_, i) => {
        const n = i + 1 + startIndex
        const status = statuses[i % statuses.length]!
        return {
            id: `request-${ n }`,
            userId: `user-${ n }`,
            status,
            reason: status === 'REJECTED' ? reasons[i % reasons.length]! : undefined,
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(),
            updatedBy: status !== 'PENDING' ? `user-${ Math.floor(Math.random() * 10) + 1 }` : undefined
        }
    })
}

export const generateMockAttendance = (count: number = 100, startIndex: number = 0): Attendance[] => {
    return Array.from({ length: count }, (_, i) => {
        const n = i + 1 + startIndex
        const date = new Date()
        date.setDate(date.getDate() - Math.floor(Math.random() * 30))
        date.setHours(8 + Math.floor(Math.random() * 2)) // 8-9 AM check-in
        date.setMinutes(Math.floor(Math.random() * 60))

        const checkOutTime = new Date(date)
        checkOutTime.setHours(17 + Math.floor(Math.random() * 3)) // 5-7 PM check-out
        checkOutTime.setMinutes(Math.floor(Math.random() * 60))

        return {
            id: `attendance-${ n }`,
            userId: `user-${ Math.floor(Math.random() * 50) + 1 }`,
            date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
            checkInTime: date,
            checkOutTime: Math.random() > 0.2 ? checkOutTime : undefined,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    })
}

export const generateMockCertifications = (count: number = 30, startIndex: number = 0): Certification[] => {
    const names = [
        'First Aid Certification', 'CPR Training', 'Emergency Response', 'Fire Safety',
        'Search and Rescue', 'Disaster Management', 'Crisis Communication', 'Team Leadership',
        'Equipment Operation', 'Safety Protocols', 'Incident Command', 'Volunteer Coordination'
    ]

    return Array.from({ length: count }, (_, i) => {
        const n = i + 1 + startIndex
        const name = names[i % names.length]!
        return {
            id: `cert-${ n }`,
            userId: `user-${ Math.floor(Math.random() * 50) + 1 }`,
            name,
            imageUrl: `/images/certification-${ n }.jpg`,
            description: `Official certification for ${ name.toLowerCase() }`,
            createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
            updatedAt: new Date()
        }
    })
}

export const generateMockSessions = (count: number = 50): Session[] => {
    const devices = [ 'Chrome', 'Firefox', 'Safari', 'Edge' ]
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
    ]
    const operatingSystems = [ 'Windows', 'macOS', 'Linux' ] as const

    return Array.from({ length: count }, (_, i) => {
        const lastActivity = new Date()
        lastActivity.setHours(lastActivity.getHours() - Math.floor(Math.random() * 24))

        return {
            id: `session-${ i + 1 }`,
            userId: `user-${ Math.floor(Math.random() * 50) + 1 }`,
            sessionId: `sess_${ Math.random().toString(36).substring(2, 15) }`,
            deviceInfo: `${ devices[i % devices.length]! } on ${ operatingSystems[i % operatingSystems.length]! }`,
            deviceFingerPrint: { screen: '1920x1080', timezone: 'Asia/Manila' },
            ipAddress: `192.168.1.${ Math.floor(Math.random() * 255) }`,
            userAgent: userAgents[i % userAgents.length]!,
            deviceHash: `hash_${ Math.random().toString(36).substring(2, 15) }`,
            lastActivity,
            expiresAt: new Date(lastActivity.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
            createdAt: new Date(lastActivity.getTime() - Math.random() * 24 * 60 * 60 * 1000),
            updatedAt: new Date()
        }
    })
}

// Dashboard statistics
export const generateDashboardStats = (): DashboardStats => ({
    activeVolunteers: 1247,
    cdrrmoUsers: 89,
    incidentReports: 61,
    volunteerRequests: 34,
    userRegistrationData: [
        { month: 'Jan', users: 45, volunteers: 12 },
        { month: 'Feb', users: 52, volunteers: 18 },
        { month: 'Mar', users: 48, volunteers: 15 },
        { month: 'Apr', users: 61, volunteers: 22 },
        { month: 'May', users: 55, volunteers: 19 },
        { month: 'Jun', users: 67, volunteers: 25 }
    ],
    incidentReportsData: [
        { month: 'Jan', reports: 8 },
        { month: 'Feb', reports: 12 },
        { month: 'Mar', reports: 6 },
        { month: 'Apr', reports: 15 },
        { month: 'May', reports: 9 },
        { month: 'Jun', reports: 11 }
    ]
})

// Mock API functions that simulate the actual API responses
export const mockApiResponses = {
    // Users API
    getUsers: async (page: number = 0, limit: number = 20): Promise<PaginatedResponse<User>> => {
        await new Promise(resolve => setTimeout(resolve, 800))
        const users = generateMockUsers(limit, page * limit)
        return {
            data: users,
            meta: {
                page,
                limit,
                total: 200,
                totalPages: 10,
                hasNextPage: page < 9,
                hasPreviousPage: page > 0
            }
        }
    },

    // Incidents API
    getIncidents: async (page: number = 0, limit: number = 20): Promise<PaginatedResponse<Incident>> => {
        await new Promise(resolve => setTimeout(resolve, 700))
        const incidents = generateMockIncidents(limit, page * limit)
        return {
            data: incidents,
            meta: {
                page,
                limit,
                total: 100,
                totalPages: 5,
                hasNextPage: page < 4,
                hasPreviousPage: page > 0
            }
        }
    },

    // Training Programs API
    getTrainingPrograms: async (page: number = 0, limit: number = 20): Promise<PaginatedResponse<TrainingProgram>> => {
        await new Promise(resolve => setTimeout(resolve, 800))
        const programs = generateMockTrainingPrograms(limit, page * limit)
        return {
            data: programs,
            meta: {
                page,
                limit,
                total: 100,
                totalPages: 5,
                hasNextPage: page < 4,
                hasPreviousPage: page > 0
            }
        }
    },

    // Volunteer Requests API
    getVolunteerRequests: async (page: number = 0, limit: number = 20): Promise<PaginatedResponse<VolunteerRequest>> => {
        await new Promise(resolve => setTimeout(resolve, 600))
        const requests = generateMockVolunteerRequests(limit, page * limit)
            .map(req => {
                const idxStr = req.userId.split('-')[1]
                const idx = Number.parseInt(idxStr || '1', 10) - 1
                const user = generateMockUsers(1, idx)[0]
                return { ...req, user }
            })
        return {
            data: requests,
            meta: {
                page,
                limit,
                total: 80,
                totalPages: 4,
                hasNextPage: page < 3,
                hasPreviousPage: page > 0
            }
        }
    },

    // Attendance API
    getAttendance: async (page: number = 0, limit: number = 20): Promise<PaginatedResponse<Attendance>> => {
        await new Promise(resolve => setTimeout(resolve, 500))
        const attendance = generateMockAttendance(limit, page * limit)
        return {
            data: attendance,
            meta: {
                page,
                limit,
                total: 200,
                totalPages: 10,
                hasNextPage: page < 9,
                hasPreviousPage: page > 0
            }
        }
    },

    // Training Program by ID API
    getTrainingProgramById: async (id: string): Promise<Omit<TrainingProgram, 'participants'> & {
        participants: Array<{ id: string; name: string; email: string; phone?: string }>
    }> => {
        await new Promise(resolve => setTimeout(resolve, 600))

        // Generate a training program with the requested ID
        const programs = generateMockTrainingPrograms(1, 0)
        const program = programs[0]!

        // Override the ID to match the requested one
        const trainingProgram: Omit<TrainingProgram, 'participants'> = {
            ...program,
            id
        }

        // Generate participants for this training program
        const participantCount = Math.floor(Math.random() * 15) + 5 // 5-20 participants
        const participants = generateMockUsers(participantCount, 0).map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.profile?.phone
        }))

        return {
            ...trainingProgram,
            participants
        }
    }
}

// Export all mock data generators
export const mockData = {
    users: generateMockUsers(50),
    incidents: generateMockIncidents(30),
    trainingPrograms: generateMockTrainingPrograms(25),
    volunteerRequests: generateMockVolunteerRequests(20),
    attendance: generateMockAttendance(100),
    certifications: generateMockCertifications(30),
    sessions: generateMockSessions(50),
    dashboardStats: generateDashboardStats()
}
