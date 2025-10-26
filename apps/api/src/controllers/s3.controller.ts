import { Response } from '@utils//response'
import { validateRequestParams } from '@middlewares/request'
import { CommonParametersSchema } from '@repo/schemas'
import mime from 'mime-types'
import { s3Service } from '@lib/external'

export const getS3Object = (bucket: string) => validateRequestParams(CommonParametersSchema, async (req, res) => {
    const { id } = req.parsedParams

    const response = await s3Service.get(id, bucket)

    if (!response.Body) {
        return res.respond(Response.notFound({ message: 'File not found' }))
    }

    const contentType = mime.lookup(id) ?? response.ContentType

    if (contentType) {
        res.set('Content-Type', contentType)
    }

    if (response.ContentLength) {
        res.set('Content-Length', response.ContentLength.toString())
    }

    if (response.LastModified) {
        res.set('Last-Modified', response.LastModified.toUTCString())
    }

    res.set('Content-Disposition', 'inline')
    res.set('Cache-Control', 'public, max-age=31536000')

    if (response.ETag) {
        res.set('ETag', response.ETag)
    }

    const stream = response.Body as NodeJS.ReadableStream
    stream.pipe(res)
})