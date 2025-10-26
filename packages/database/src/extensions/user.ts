import { Prisma } from '../../generated/prisma';

export const user = Prisma.defineExtension({
    name: 'user',
    result: {
        // user: {
        //     name: {
        //         needs: {
        //             firstName: true,
        //             lastName: true
        //         },
        //         compute: ({ firstName, lastName }) => `${ firstName } ${ lastName }`
        //     }
        // }
    }
})