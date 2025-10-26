import bcrypt from 'bcrypt';

export const hash = async (data: string) => bcrypt.hash(data, 12);

export const compare = async (data: string, hash: string) => bcrypt.compare(data, hash);

export default {
    hash,
    compare
}