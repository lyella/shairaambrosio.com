// The canonical origin must never be a preview deployment. Vercel sets
// NEXT_PUBLIC_VERCEL_URL on every build to the per-deploy preview host, so using it
// as the canonical origin made every page declare a preview URL as its canonical,
// OG url, RSS link and JSON-LD id. Production is pinned to the real domain;
// previews fall back to whatever Vercel exposes so local/staging links still work.
const PRODUCTION_ORIGIN = "shairaambrosio.com";

export const ORIGIN =
  process.env.NEXT_PUBLIC_HOST ||
  (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "preview"
    ? PRODUCTION_ORIGIN
    : process.env.NEXT_PUBLIC_VERCEL_URL || PRODUCTION_ORIGIN);

// The canonical origin must always be https: build-time generators (feed, sitemap)
// run outside `next build`, where NODE_ENV is not "production", and a http://
// canonical would split every URL in Google's index.
export const PROTOCOL = "https";
export const HOST = `${PROTOCOL}://${ORIGIN}` as const;

// A single source of truth for absolute URLs, so no page can emit a relative one
// where a crawler or a scraper expects an absolute URL.
export const absoluteUrl = (path = "/") => `${HOST}${path.startsWith("/") ? path : `/${path}`}`;

export const SEPARATOR = " • ";

export const SITE_TITLE = "Shaira Ambrosio";
export const SITE_TITLE_TEMPLATE = `%s ${SEPARATOR} ${SITE_TITLE}`;
export const SHORT_DESCRIPTION = "My personal website";
export const DEFAULT_DESCRIPTION =
  "Hello, I'm Shaira - a Full-Stack Developer, freelancer, blogger, and passionate about new technologies. I hope you enjoy my website!";

export const DEFAULT_IMAGE_URL = `/img/banner.png`;

// Open Graph locale must be language_COUNTRY, not the two-letter language twice.
export const OG_LOCALE = "en_US";

export const PERSON_NAME = "Shaira Ambrosio";
export const PERSON_JOB_TITLE = "Full-Stack Developer";

export const SOCIAL_PROFILES = [
  `https://x.com/${process.env.NEXT_PUBLIC_x_USERNAME || "shaicodes"}`,
  `https://www.linkedin.com/in/${process.env.NEXT_PUBLIC_LINKEDIN_USERNAME}`,
  `https://github.com/${process.env.NEXT_PUBLIC_GITHUB_USERNAME}`,
];

export const SOCIALS = [
  {
    name: "x",
    color: "#94ccff",
    link: SOCIAL_PROFILES[0],
  },
  {
    name: "linkedin",
    color: "#2867B2",
    link: SOCIAL_PROFILES[1],
  },
  {
    name: "github",
    color: "#333",
    link: SOCIAL_PROFILES[2],
  },
] as const;

export const EMAIL_REGEX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/;
