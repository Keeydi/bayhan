import { getS3Object } from '@controllers/s3.controller'
import { env } from '@utils/env'

export const get = getS3Object(env.AWS_S3_IMAGES_BUCKET)