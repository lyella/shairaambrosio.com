/** @type {import('next').NextConfig} */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import withPWA from 'next-pwa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['react-github-btn'],
  eslint: {
    // Allow building even if there are ESLint errors. We'll fix them later.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip type checking during next build so we can iterate. Run `yarn tsc` locally to see errors.
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['avatars.githubusercontent.com', 'github.com', 'i.scdn.co'],
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
  async rewrites() {
    return [
      {
        source: '/feed',
        destination: '/feed.xml',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/new-post',
        destination: '/blog/THE_NEWEST_POST_SLUG_HERE',
        permanent: false,
      },
      {
        source: '/new',
        destination: '/blog/THE_NEWEST_POST_SLUG_HERE',
        permanent: false,
      },
      {
        source: '/newest-post',
        destination: '/blog/THE_NEWEST_POST_SLUG_HERE',
        permanent: false,
      },
      {
        source: '/x',
        destination: `https://x.com/${process.env.NEXT_PUBLIC_x_USERNAME}`,
        permanent: true,
      },
      {
        source: '/linkedin',
        destination: `https://www.linkedin.com/in/${process.env.NEXT_PUBLIC_LINKEDIN_USERNAME}`,
        permanent: true,
      },
      {
        source: '/github',
        destination: `https://github.com/${process.env.NEXT_PUBLIC_GITHUB_USERNAME}`,
        permanent: true,
      },
      {
        source: '/gumroad',
        destination: `https://xxxxxxxx.gumroad.com/`,
        permanent: true,
      },
    ];
  },
};

export default withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
})(nextConfig);