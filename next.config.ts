import type {NextConfig} from 'next';

if (process.env.VERCEL && !/^https:\/\//.test(process.env.NEXT_PUBLIC_API_BASE_URL ?? ''))
    throw new Error(
        'Falta NEXT_PUBLIC_API_BASE_URL (o no empieza por https://). Agrégala en Vercel → Settings → '
        + 'Environment Variables para el entorno Production, por ejemplo https://<backend>.up.railway.app/api, y vuelve a desplegar.',
    );

const apiUrl = new URL(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api');

const mediaHost = process.env.NEXT_PUBLIC_MEDIA_HOST?.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || undefined;

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL
    || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

const nextConfig: NextConfig = {
    env: {
        NEXT_PUBLIC_SERVER_URL: serverUrl,
    },
    cacheComponents:    true,
    partialPrefetching: true,
    reactCompiler:      true,
    images: {
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            {
                protocol: apiUrl.protocol.replace(':', '') as 'http' | 'https',
                hostname: apiUrl.hostname,
                port:     apiUrl.port || undefined,
                pathname: '/api/files/**',
            },
            ...(mediaHost ? [{protocol: 'https' as const, hostname: mediaHost, pathname: '/**'}] : []),
        ],
    },
    turbopack: {
        rules: {
            '*.svg': {
                loaders: ['@svgr/webpack'],
                as:      '*.js',
            },
        },
    },
};

export default nextConfig;
