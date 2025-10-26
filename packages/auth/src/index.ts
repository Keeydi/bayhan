import { statement } from './lib/auth'

export * from './lib/auth';
export * from './lib/client';
export * from './templates'

export type Resource = keyof typeof statement
export type Action<T extends Resource> = (typeof statement)[T][number]
