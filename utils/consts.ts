export const ORIGIN =
  process.env.NEXT_PUBLIC_HOST || process.env.NEXT_PUBLIC_VERCEL_URL || ("shairaambrosio.com" as const);
export const PROTOCOL = process.env.NODE_ENV === "production" ? "https" : "http";
export const HOST = `${PROTOCOL}://${ORIGIN}` as const;

export const SEPARATOR = " • ";

export const SITE_TITLE = "Shaira Ambrosio";
export const SITE_TITLE_TEMPLATE = `%s ${SEPARATOR} ${SITE_TITLE}`;
export const SHORT_DESCRIPTION = "My personal website";
export const DEFAULT_DESCRIPTION =
  "Hello, I'm Shaira - a Frontend Developer, freelancer, blogger, and passionate about new technologies. I hope you enjoy my website!";

export const DEFAULT_IMAGE_URL = `/img/banner.png`;

export const SOCIALS = [
  {
    name: "x",
    color: "#94ccff",
    link: `https://x.com/${process.env.NEXT_PUBLIC_x_USERNAME}`,
  },
  {
    name: "linkedin",
    color: "#2867B2",
    link: `https://www.linkedin.com/in/${process.env.NEXT_PUBLIC_LINKEDIN_USERNAME}`,
  },
  {
    name: "github",
    color: "#333",
    link: `https://github.com/${process.env.NEXT_PUBLIC_GITHUB_USERNAME}`,
  },
  // {
  //   name: "rss",
  //   color: "#ee802f",
  //   link: "/feed",
  // },
] as const;

export const EMAIL_REGEX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/;
