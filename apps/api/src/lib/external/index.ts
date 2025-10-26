export { GeolocationService, type Location, type DistanceResult } from './geolocation'
export { EmailService } from './email'
export { SMSService, type SMSMessage } from './sms'
export { S3Service } from './s3'

import { GeolocationService } from './geolocation'
import { EmailService } from './email'
import { SMSService } from './sms'
import { S3Service } from './s3'

export const geolocationService = new GeolocationService()
export const emailService = new EmailService()
export const smsService = new SMSService()
export const s3Service = new S3Service()