import { memo, useRef, useEffect, useCallback, useMemo } from "react";
import { renderToString } from "react-dom/server";
import { motion } from "framer-motion";
import NextImage from "next/image";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import advancedFormat from "dayjs/plugin/advancedFormat";

import * as CustomPostsComponents from "components/mdx/custom";
import { useTheme } from "context/ThemeContext";
import { Author } from "components/mdx/author/Author";
import type { Project, Post } from "types";
import { getHeadings } from "utils/getHeadings";
import { absoluteUrl } from "utils/consts";
import { useRunningHeader } from "hooks/useRunningHeader";
import Arrow from "public/svg/right-top-arrow.svg";
import { Image } from "components/mdx/image/Image";
import { Heading } from "components/mdx/heading/Heading";
import { Link } from "components/mdx/link/Link";
import { Edit } from "components/mdx/edit/Edit";
import { Share } from "components/mdx/share/Share";
import { Quote } from "components/mdx/quote/Quote";
import { Pre } from "components/mdx/pre/Pre";
import { Info } from "components/mdx/info/Info";
import { Highlight } from "components/mdx/highlight/Highlight";
import { Sandbox } from "components/mdx/sandbox/Sandbox";

import { TableOfContents } from "./tableOfContents/TableOfContents";
import styles from "./mdx.module.scss";

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);

type MdxProps = {
  readonly resource: Project | Post;
  readonly content: MDXRemoteSerializeResult<Record<string, unknown>>;
};

type HeadingComponentProps = {
  readonly children?: React.ReactNode;
};

// MDXRemote types every component map value against MDX's `Component<any>` union.
// With React 19 these are function components, so `Record<string, FunctionComponent>`
// satisfies MDX's index signature without a cast. (The earlier `ComponentType`
// version failed: `ComponentType` includes class components, and the literal's
// specific prop types were then checked contra-variantly against `unknown`.)
type MdxComponentMap = Record<string, React.FunctionComponent<any>>;

export const Mdx = memo<MdxProps>(({ resource, content }) => {
  const contentElRef = useRef<HTMLDivElement | null>(null);
  const { id, setRunningHeader } = useRunningHeader(contentElRef.current);
  const url = absoluteUrl(`/${resource.type === "project" ? "projects" : "blog"}/${resource.slug}`);
  const { theme } = useTheme();

  const getHeadingProps = useCallback(
    ({ children }: HeadingComponentProps) => {
      return {
        slug: String(children ?? ""),
        url,
      };
    },
    [url],
  );

  const customMdxComponents: MdxComponentMap = useMemo(
    () => ({
      h2: (props: HeadingComponentProps) => <Heading level="h2" {...getHeadingProps(props)}></Heading>,
      h3: (props: HeadingComponentProps) => <Heading level="h3" {...getHeadingProps(props)}></Heading>,
      h4: (props: HeadingComponentProps) => <Heading level="h4" {...getHeadingProps(props)}></Heading>,
      h5: (props: HeadingComponentProps) => <Heading level="h5" {...getHeadingProps(props)}></Heading>,
      h6: (props: HeadingComponentProps) => <Heading level="h6" {...getHeadingProps(props)}></Heading>,
      Image,
      Link,
      Quote,
      Highlight,
      Sandbox: ({ id }: { id: string }) => <Sandbox id={id} theme={theme as "light" | "dark"} />,
      pre: Pre,
      ...CustomPostsComponents,
    }),
    // The old empty dependency list froze `theme` at first render, so the embedded
    // sandbox never switched themes with the rest of the page.
    [getHeadingProps, theme],
  );

  const contentString = renderToString(<MDXRemote {...content} components={customMdxComponents} />);

  useEffect(() => {
    // contentElRef.current is null on the first pass (the ref attaches after
    // commit), so re-run once `content` has been mounted.
    setRunningHeader(contentElRef.current);
  }, [content, setRunningHeader]);

  const imageVariants = {
    hover: {
      scale: 1.05,
    },
  };

  return (
    <article className={styles.container}>
      <header className={styles.header}>
        <Info resource={resource} />
      </header>
      <div className={styles.main}>
        <TableOfContents contents={getHeadings(contentString)} currentActiveHeaderId={id} />
        <div className={styles.wrapper}>
          {resource.type === "project" ? (
            <motion.a
              layoutId={`image-container-${resource.slug}`}
              className={styles.thumbnail}
              href={resource.url}
              key="thumbnail"
              whileHover="hover"
              variants={imageVariants}
              target="_blank"
            >
              <NextImage
                src={resource.image}
                alt={resource.title}
                width={1200}
                height={880}
                sizes="(max-width: 1100px) 92vw, 666px"
                priority
              />
              <div className={styles.arrow}>
                <Arrow />
              </div>
            </motion.a>
          ) : (
            <div className={styles.thumbnail}>
              <NextImage
                src={resource.image}
                alt={resource.title}
                width={1200}
                height={880}
                sizes="(max-width: 1100px) 92vw, 666px"
                priority
              />
            </div>
          )}

          <div className="content" ref={contentElRef}>
            <MDXRemote {...content} components={customMdxComponents} />
          </div>

          {resource.type === "post" ? (
            <div className={styles.date}>
              Published on {dayjs(resource.publishedAt, "DD-MM-YYYY").format("Do MMMM, YYYY")}
            </div>
          ) : null}
          <div className={styles.links}>
            {/* The content directory is content/posts, but the type is "post", and
                the old template produced .../content/posts/<slug>.mdx — a path that
                does not exist, so every "Edit on Github" link 404'd. */}
            <Edit href={`/${resource.type === "project" ? "projects" : "blog"}/${resource.slug}`} />
            <Share href={url} title={resource.title} type={resource.type} />
          </div>

          <div className={styles.author}>
            <Author name={resource.author} />
          </div>
        </div>
      </div>
    </article>
  );
});

Mdx.displayName = "Mdx";
