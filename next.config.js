/** @type {import('next').NextConfig} */
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import withPWA from "next-pwa";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["react-github-btn"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "github.com" },
      { protocol: "https", hostname: "i.scdn.co" },
    ],
  },
  sassOptions: {
    includePaths: [join(__dirname, "styles")],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // 'unsafe-inline' is required: Next.js pages router injects inline __NEXT_DATA__
              // and the gtag init snippet. 'unsafe-eval' is required: next-mdx-remote's
              // MDXRemote evaluates the compiled MDX via new Function at runtime, which CSP
              // blocks without it (client-side exception on every /blog/[slug] and
              // /projects/[slug] page). frame-ancestors/object-src below still block
              // clickjacking and plugin abuse.
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://accounts.spotify.com https://api.spotify.com https://api.mailerlite.com https://*.algolia.net https://*.algolianet.com https://va.vercel-scripts.com https://*.ingest.vercel.com",
              "frame-src https://github.com https://codesandbox.io",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/feed",
        destination: "/feed.xml",
      },
    ];
  },
  async redirects() {
    // Resolved at request time from the content directory instead of being baked
    // into this file by generateNewPostRedirect.ts.
    //
    // That script rewrote only the FIRST occurrence of the placeholder, so
    // `/new` and `/newest-post` kept redirecting to
    // /blog/dunning-kruger-effect-in-programming — a permanently broken 404 — and in a
    // development run it also overwrote the `/new-post` source itself.
    const { readdirSync } = await import("fs");
    const postsDir = join(__dirname, "content", "posts");
    const newestSlug = readdirSync(postsDir)
      .filter((file) => file.endsWith(".mdx"))
      .map((file) => file.replace(/\.mdx$/, ""))
      .sort()
      .pop();

    const newestPostRedirects = newestSlug
      ? ["/new-post", "/new", "/newest-post"].map((source) => ({
          source,
          destination: `/blog/${newestSlug}`,
          permanent: false,
        }))
      : [];

    return [
      ...newestPostRedirects,
      {
        source: "/x",
        destination: `https://x.com/${process.env.NEXT_PUBLIC_x_USERNAME || "shaicodes"}`,
        permanent: true,
      },
      {
        source: "/linkedin",
        destination: `https://www.linkedin.com/in/${process.env.NEXT_PUBLIC_LINKEDIN_USERNAME}`,
        permanent: true,
      },
      {
        source: "/github",
        destination: `https://github.com/${process.env.NEXT_PUBLIC_GITHUB_USERNAME}`,
        permanent: true,
      },
    ];
  },
};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
