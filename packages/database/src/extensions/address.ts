import { Prisma } from '../../generated/prisma';

export const address = Prisma.defineExtension({
    name: 'address',
    result: {
        address: {
            fullAddress: {
                needs: {
                    street: true,
                    city: true,
                    state: true,
                    zipCode: true
                },
                compute: ({ street, city, state, zipCode }) => {
                    const parts = [ street, city, state, zipCode ].filter(Boolean);
                    return parts.join(', ');
                }
            }
        }
    }
})