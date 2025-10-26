import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '@utils/env'
import { User } from '@repo/database'

export type Token = Omit<User, 'password'> & {
    sessionId: string
    iat?: Date
    exp?: Date
    jti?: string
};

export const generateToken = <T extends object>(payload: T, options?: SignOptions): string => {
    return jwt.sign(payload, env.JWT_SECRET, options);
};

export const verifyToken = <T extends object = Token>(token: string): T | null => {
    try {
        return jwt.verify(token, env.JWT_SECRET) as T;
    } catch {
        return null
    }
};

export default {
    generateToken,
    verifyToken
}
