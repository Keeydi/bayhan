import axios from 'axios'
import { env } from '@utils/env'

export interface SMSMessage {
    to: string
    body: string
    senderId?: string
}

export class SMSService {
    private apiToken: string
    private baseUrl: string

    constructor() {
        this.apiToken = env.PHILSMS_API_KEY
        this.baseUrl = 'https://app.philsms.com/api/v3/sms/send'
    }

    /**
     * Send a single SMS message
     * @param message SMS message to send
     * @returns Promise<boolean> True if sent successfully
     */
    async sendSMS(message: SMSMessage): Promise<boolean> {
        try {
            const response = await axios.post(
                this.baseUrl,
                {
                    recipient: message.to,
                    sender_id: message.senderId || 'E-Bayanihan',
                    type: 'plain',
                    message: message.body
                },
                {
                    headers: {
                        Authorization: `Bearer ${ this.apiToken }`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            )

            return response.status === 200
        } catch (error) {
            console.error('Failed to send SMS:', error)
            return false
        }
    }

    /**
     * Send multiple SMS messages
     * @param messages Array of SMS messages to send
     * @returns Promise<{sent: number, failed: number}> Results summary
     */
    async sendBulkSMS(messages: SMSMessage[]): Promise<{ sent: number; failed: number }> {
        if (messages.length === 0) {
            return { sent: 0, failed: 0 }
        }

        try {
            // Group messages by sender_id and message content to optimize bulk sending
            const messageGroups = new Map<string, { recipients: string[], message: SMSMessage }>()

            for (const message of messages) {
                const key = `${ message.senderId || 'E-Bayanihan' }|${ message.body }`
                if (!messageGroups.has(key)) {
                    messageGroups.set(key, {
                        recipients: [],
                        message
                    })
                }
                messageGroups.get(key)!.recipients.push(message.to)
            }

            // Send each group as a single bulk request
            const results = await Promise.allSettled(
                Array.from(messageGroups.values()).map(group => {
                    const recipients = group.recipients.map(recipient => recipient.replace('+', '')).join(',')
                    return this.sendSMS({
                        to: recipients,
                        body: group.message.body,
                        senderId: group.message.senderId
                    })
                })
            )

            const sent = results.filter(result => result.status === 'fulfilled' && result.value).length
            const failed = results.length - sent

            return { sent, failed }
        } catch (error) {
            console.error('Failed to send bulk SMS:', error)
            return { sent: 0, failed: messages.length }
        }
    }

    /**
     * Create a deployment alert message for volunteers
     * @param volunteerName Name of the volunteer
     * @param incidentTitle Title of the incident
     * @param incidentUrl URL to incident details
     * @returns Formatted SMS message
     */
    createDeploymentMessage(volunteerName: string, incidentTitle: string, incidentUrl: string): string {
        return `🚨 EMERGENCY DEPLOYMENT ALERT 🚨

Hello ${ volunteerName },

You have been deployed to respond to an emergency incident:

📋 Incident: ${ incidentTitle }
🔗 Details: ${ incidentUrl }

Please proceed to the incident location immediately and check in when you arrive.

Stay safe and thank you for your service!

- E-Bayanihan Emergency Response Team`
    }

    /**
     * Create an inactive volunteer alert message
     * @param volunteerName Name of the volunteer
     * @param incidentTitle Title of the incident
     * @returns Formatted SMS message
     */
    createInactiveVolunteerAlert(volunteerName: string, incidentTitle: string): string {
        return `🚨 EMERGENCY ALERT - ACTION REQUIRED 🚨

Hello ${ volunteerName },

An emergency incident has been reported in your area:

📋 Incident: ${ incidentTitle }

You are currently marked as inactive. If you are available to help, please check in immediately and proceed to the incident location.

Your community needs you!

- E-Bayanihan Emergency Response Team`
    }
}
