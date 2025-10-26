import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    experimental: { authInterrupts: true },
    /* config options here */
    rewrites: async () => [
        {
            source: '/api/:path*',
            destination: `${ process.env.NEXT_PUBLIC_API_URL }/:path*`
        },
        {
            source: '/images/:path*',
            destination: `${ process.env.NEXT_PUBLIC_API_URL }/images/:path*`
        },
        {
            source: '/credentials/:path*',
            destination: `${ process.env.NEXT_PUBLIC_API_URL }/credentials/:path*`
        }
    ]
};

export default nextConfig;
