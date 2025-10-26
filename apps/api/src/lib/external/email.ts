import { Resend } from 'resend'
import { env } from '@utils/env'

export class EmailService {
    private readonly resend: Resend

    constructor() {
        this.resend = new Resend(env.RESEND_API_KEY)
    }

    /**
     * Get the Resend client instance
     * @returns Resend client
     */
    getClient(): Resend {
        return this.resend
    }
}
