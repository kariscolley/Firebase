import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
    // This is a dev-only option and will be ignored in production builds.
    // It is required to allow requests from the Firebase Studio environment.
    allowedDevOrigins: ["https://*.cloudworkstations.dev"],
};

export default nextConfig;
