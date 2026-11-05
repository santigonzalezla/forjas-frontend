import type {NextConfig} from 'next';

const apiUrl = new URL(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api');

// Dominio público de Cloudflare R2 donde viven las fotos subidas desde el panel.
// Se acepta con o sin protocolo ("https://pub-xxx.r2.dev" o "pub-xxx.r2.dev").
const mediaHost = process.env.NEXT_PUBLIC_MEDIA_HOST?.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || undefined;

const nextConfig: NextConfig = {
    cacheComponents:    true,
    partialPrefetching: true,
    reactCompiler:      true,
    images: {
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            {
                // Imágenes servidas por el backend (proxy a R2)
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
            // Íconos SVG como componentes React (mismo patrón que LegalDocs)
            '*.svg': {
                loaders: ['@svgr/webpack'],
                as:      '*.js',
            },
        },
    },
};

export default nextConfig;
