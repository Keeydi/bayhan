// Type definitions that match the Prisma schema exactly
// This ensures type safety between frontend and backend

export type Role = 'CDRRMO' | 'VOLUNTEER' | 'ADMIN' | 'UNASSIGNED'
export type IncidentStatus = 'OPEN' | 'RESOLVED'
export type IncidentSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
export type VolunteerRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type TrainingProgramStatus = 'UPCOMING' | 'ONGOING' | 'FINISHED' | 'CANCELLED'
export type MediaType = 'ACCREDITATION' | 'CERTIFICATION' | 'INCIDENT' | 'TRAINING'
export type VolunteerType = 'TYPE_1_SEARCH_RESCUE' | 'TYPE_2_EVACUATION_MOBILITY' | 'TYPE_3_WASAR' | 'TYPE_4_NOT_CERTIFIED'

// Base interfaces matching Prisma models
export interface User {
    id: string
    name: string
    email: string
    role: Role
    createdAt: Date
    updatedAt: Date
    // Relations
    profile?: Profile
    address?: Address
    certifications?: Certification[]
    attendanceRecords?: Attendance[]
    reportedIncidents?: Incident[]
    requests?: VolunteerRequest[]
    uploadedMedias?: Media[]
    sessions?: Session[]
}

export interface Profile {
    userId: string
    firstName: string
    lastName: string
    phone?: string
    birthDate?: Date
    createdAt: Date
    updatedAt: Date
}

export interface Address {
    id: string
    userId: string
    street: string
    city: string
    state: string
    zipCode: string
    createdAt: Date
    updatedAt: Date
    user?: User
}

export interface Media {
    id: string
    url: string
    type: MediaType
    mimeType: string
    uploadedById: string
    createdAt: Date
    updatedAt: Date
    uploadedBy?: User
    incidentMedia?: IncidentMedia
    trainingProgramMedia?: TrainingProgramMedia
}

export interface Session {
    id: string
    userId: string
    sessionId: string
    deviceInfo: string
    deviceFingerPrint: any
    ipAddress: string
    userAgent: string
    deviceHash: string
    lastActivity: Date
    expiresAt: Date
    createdAt: Date
    updatedAt: Date
    user?: User
    refreshTokens?: RefreshToken[]
}

export interface RefreshToken {
    id: string
    userId: string
    sessionId: string
    token: string
    used: boolean
    expiresAt: Date
    createdAt: Date
    updatedAt: Date
    user?: User
    session?: Session
}

export interface VolunteerRequest {
    id: string
    userId: string
    status: VolunteerRequestStatus
    reason?: string
    createdAt: Date
    updatedAt: Date
    updatedBy?: string
    user?: User
    updater?: User
}

export interface Attendance {
    id: string
    userId: string
    date: Date
    checkInTime: Date
    checkOutTime?: Date
    createdAt: Date
    updatedAt: Date
    user?: User
}

export interface LocationLog {
    id: string
    userId: string
    latitude: number
    longitude: number
    timestamp: Date
    user?: User
}

export interface Certification {
    id: string
    userId?: string
    name: string
    imageUrl: string
    description?: string
    createdAt: Date
    updatedAt: Date
    user?: User
}

export interface Incident {
    id: string
    title: string
    description?: string
    location: {
        latitude: number
        longitude: number
        address?: string
    }
    status: IncidentStatus
    severity: IncidentSeverity
    reportedBy: string
    createdAt: Date
    updatedAt: Date
    reporter?: User
    medias?: string[] // Array of media URLs for frontend display
    deployments?: IncidentDeployment[]
}

export interface IncidentMedia {
    id: string
    incidentId: string
    mediaId: string
    createdAt: Date
    updatedAt: Date
    incident?: Incident
    media?: Media
}

export interface IncidentDeployment {
    incidentId: string
    userId: string
    createdAt: Date
    updatedAt: Date
    incident?: Incident
    user?: User
}

export interface TrainingProgram {
    id: string
    title: string
    description?: string
    date: Date
    location: {
        latitude: number
        longitude: number
        address?: string
    }
    facilitator?: string
    status: TrainingProgramStatus
    createdAt: Date
    updatedAt: Date
    participants?: TrainingProgramParticipant[]
    medias?: string[] // Array of media URLs for frontend display
}

export interface TrainingProgramMedia {
    id: string
    trainingProgramId: string
    mediaId: string
    createdAt: Date
    updatedAt: Date
    trainingProgram?: TrainingProgram
    media?: Media
}

export interface TrainingProgramParticipant {
    id: string
    userId: string
    trainingProgramId: string
    createdAt: Date
    updatedAt: Date
    user?: User
    trainingProgram?: TrainingProgram
}

// API Response interfaces
export interface PaginatedResponse<T> {
    data: T[]
    meta: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasNextPage: boolean
        hasPreviousPage: boolean
    }
}

export interface ApiResponse<T> {
    success: boolean
    message: string
    data: T
    code?: number
}

// Extended interfaces for specific use cases
export interface UserWithRelations extends User {
    address?: Address
    certifications?: Certification[]
    attendanceRecords?: Attendance[]
    reportedIncidents?: Incident[]
    requests?: VolunteerRequest[]
    uploadedMedias?: Media[]
}

export interface IncidentWithRelations extends Incident {
    reporter?: User
    medias?: string[]
    deployments?: IncidentDeployment[]
}

export interface TrainingProgramWithRelations extends TrainingProgram {
    participants?: TrainingProgramParticipant[]
    medias?: string[]
}

export interface VolunteerRequestWithRelations extends VolunteerRequest {
    user?: User
    updater?: User
}

// Dashboard statistics interface
export interface DashboardStats {
    activeVolunteers: number
    cdrrmoUsers: number
    incidentReports: number
    volunteerRequests: number
    userRegistrationData: Array<{
        month: string
        users: number
        volunteers: number
    }>
    incidentReportsData: Array<{
        month: string
        reports: number
    }>
}

// Form interfaces for creating/updating entities
export interface CreateUserData {
    firstName: string
    lastName: string
    email: string
    phone?: string
    password: string
    address: {
        street: string
        city: string
        state: string
        zipCode: string
    }
}

export interface UpdateUserData {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    address?: {
        street?: string
        city?: string
        state?: string
        zipCode?: string
    }
}

export interface CreateIncidentData {
    title: string
    description?: string
    location: {
        latitude: number
        longitude: number
        address?: string
    }
    severity: IncidentSeverity
}

export interface CreateTrainingProgramData {
    title: string
    description?: string
    date: Date
    location: string
    facilitator?: string
}

export interface UpdateTrainingProgramData {
    title?: string
    description?: string
    date?: Date
    location?: string
    facilitator?: string
    status?: TrainingProgramStatus
}

// Authentication interfaces
export interface LoginData {
    email: string
    password: string
}

export interface RegisterData {
    firstName: string
    lastName: string
    email: string
    phone?: string
    password: string
    address: {
        street: string
        city: string
        state: string
        zipCode: string
    }
}

export interface AuthTokens {
    accessToken: string
    refreshToken: string
    sessionId: string
}

export interface AuthUser {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    role: Role
    tokens?: AuthTokens
}
