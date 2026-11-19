import { memo } from "react";

import { Link } from "../link/Link";

interface EditProps {
  /** Page path, e.g. "/blog/my-post" or "/projects/my-project". */
  readonly href: string;
}

// The content files live under content/<section>/<slug>.mdx. The route prefix and
// the content directory name differ for posts (route "blog", directory "posts"), so
// the directory is mapped explicitly instead of being copied from the route.
const contentDirectory = (section: string) => (section === "blog" ? "posts" : section);

export const Edit = memo<EditProps>(({ href }) => {
  const [section, slug] = href.split("/").filter(Boolean);
  const path = `content/${contentDirectory(section)}/${slug}.mdx`;

  return (
    <Link href={`https://github.com/${process.env.NEXT_PUBLIC_GITHUB_USERNAME}/shairaambrosio.com/tree/main/${path}`}>
      Edit on Github
    </Link>
  );
});
