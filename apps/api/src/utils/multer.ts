import multer from 'multer'
import { DateTime } from 'luxon'
import crypto from 'crypto'
import mime from 'mime-types'
import path from 'node:path'
import multerS3 from 'multer-s3'
import { s3Service } from '@lib/external'
import { env } from '@utils/env'

const imageStorage = multerS3({
    s3: s3Service.s3,
    bucket: env.AWS_S3_IMAGES_BUCKET,
    metadata: (req, file, callback) => {
        callback(null, { fieldName: file.fieldname })
    },
    key: (req, file, cb) => {
        const filename = `${ DateTime.utc().toSeconds() }${ crypto.randomBytes(8).toString('hex') }`
        const ext = path.extname(file.originalname)

        cb(null, `${ filename }${ ext }`)
    }
})

const credentialsStorage = multerS3({
    s3: s3Service.s3,
    bucket: env.AWS_S3_CREDENTIALS_BUCKET,
    metadata: (req, file, callback) => {
        callback(null, { fieldName: file.fieldname })
    },
    key: (req, file, cb) => {
        const filename = `${ DateTime.utc().toSeconds() }${ crypto.randomBytes(8).toString('hex') }`
        const ext = path.extname(file.originalname)

        cb(null, `${ filename }${ ext }`)
    }
})

export const image = multer({
    storage: imageStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    },
    fileFilter: (req, file, cb) => {
        const mimeType = mime.lookup(file.originalname)

        if (!mimeType || !mimeType.startsWith('image/')) {
            return cb(new Error('Only image files are allowed'))
        }

        cb(null, true)
    }
})

export const credentials = multer({
    storage: credentialsStorage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB
    },
    fileFilter: (req, file, cb) => {
        const mimeType = mime.lookup(file.originalname)

        if (!mimeType || ![ 'image/jpeg', 'image/png', 'application/pdf' ].includes(mimeType)) {
            return cb(new Error('Only JPEG, PNG, and PDF files are allowed'))
        }

        cb(null, true)
    }
})