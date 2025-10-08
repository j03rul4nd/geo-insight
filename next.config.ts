import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    
    // Tu configuración webpack existente
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                "punycode": false,
            };
        }
        return config;
    },
    eslint: {
    ignoreDuringBuilds: true,
    },
};

export default nextConfig;