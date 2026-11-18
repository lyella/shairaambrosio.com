type Heading = {
  readonly text: string | null;
  readonly id: string;
  readonly level: string;
};

const decodeEntities = (text: string) =>
  text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

// Isomorphic on purpose: DOMParser is browser-only, so the old window guard made
// this return undefined during SSR and an array on the client, which broke
// hydration on every MDX page (React #418). Regex parsing renders identically
// on both sides.
export const getHeadings = (source: string): Heading[] => {
  const HEADING_REGEX = /<h([2-6])\b([^>]*)>([\s\S]*?)<\/h\1>/g;

  const headings: Heading[] = [];
  let match: RegExpExecArray | null;

  while ((match = HEADING_REGEX.exec(source))) {
    const id = /id="([^"]*)"/.exec(match[2])?.[1] ?? "";
    const text = decodeEntities(match[3].replace(/<[^>]*>/g, "")).trim();

    headings.push({ text, level: `h${match[1]}`, id });
  }

  return headings;
};
