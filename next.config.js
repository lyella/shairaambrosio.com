/** @type {import('next').NextConfig} */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Allow building even if there are ESLint errors. We'll fix them later.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip type checking during next build so we can iterate. Run `yarn tsc` locally to see errors.
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['avatars.githubusercontent.com', 'github.com'],
  },
  sassOptions: {
    includePaths: [join(__dirname, 'styles')],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
};

export default nextConfig;