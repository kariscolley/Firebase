import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    // This is a dev-only configuration that allows the development server
    // to accept requests from the specified origin.
    allowedDevOrigins: [
      'https://6000-firebase-studio-1753376932492.cluster-fnjdffmttjhy2qqdugh3yehhs2.cloudworkstations.dev',
    ],
  },
};

export default nextConfig;
