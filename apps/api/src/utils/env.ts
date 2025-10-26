import 'dotenv/config';
import { cleanEnv, num, str, testOnly } from 'envalid'
import * as process from 'node:process'

export const env = cleanEnv(process.env, {
    NODE_ENV: str({ choices: [ 'development', 'production', 'test' ], default: 'development' }),
    PORT: num({ default: 8000 }),
    JWT_SECRET: str({ devDefault: testOnly('') }),
    FRONTEND_URL: str({ devDefault: 'http://localhost:3000' }),
    DATABASE_URL: str(),
    BETTER_AUTH_SECRET: str({ devDefault: testOnly('') }),
    BETTER_AUTH_URL: str({ devDefault: 'http://localhost:8000' }),
    RESEND_API_KEY: str({ devDefault: testOnly('') }),
    COOKIE_DOMAIN: str({ devDefault: 'localhost' }),
    PHILSMS_API_KEY: str({ devDefault: testOnly('') }),
    GOOGLE_MAPS_API_KEY: str({ devDefault: testOnly('') }),
    AWS_S3_ENDPOINT: str({ devDefault: 'http://localhost:9000' }),
    AWS_REGION: str({ devDefault: 'us-east-1' }),
    AWS_ACCESS_KEY_ID: str({ devDefault: testOnly('') }),
    AWS_SECRET_ACCESS_KEY: str({ devDefault: testOnly('') }),
    AWS_S3_IMAGES_BUCKET: str({ devDefault: 'images' }),
    AWS_S3_CREDENTIALS_BUCKET: str({ devDefault: 'credentials' })
});
