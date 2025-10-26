import { DeleteObjectCommand, GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { env } from '@utils/env'


export class S3Service {
    public readonly s3: S3Client

    constructor() {
        this.s3 = new S3Client({
            region: env.AWS_REGION,
            endpoint: env.AWS_S3_ENDPOINT,
            credentials: {
                accessKeyId: env.AWS_ACCESS_KEY_ID,
                secretAccessKey: env.AWS_SECRET_ACCESS_KEY
            },
            forcePathStyle: true
        })
    }

    get = async (key: string, bucket: string) => {
        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: key,
            ResponseContentDisposition: 'inline'
        })

        return this.s3.send(command)
    }

    del = async (key: string, bucket: string) => {
        const command = new DeleteObjectCommand({
            Bucket: bucket,
            Key: key
        })

        return this.s3.send(command)
    }
}