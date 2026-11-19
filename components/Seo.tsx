import Head from "next/head";
import { useRouter } from "next/router";
import { memo } from "react";
import { NextSeo, ArticleJsonLd } from "next-seo";

import type { Author } from "types";
import {
  absoluteUrl,
  DEFAULT_DESCRIPTION,
  DEFAULT_IMAGE_URL,
  HOST,
  OG_LOCALE,
  PERSON_JOB_TITLE,
  PERSON_NAME,
  SITE_TITLE,
  SITE_TITLE_TEMPLATE,
  SOCIAL_PROFILES,
} from "utils/consts";

type SeoProps = {
  readonly title?: string;
  readonly description?: string;
  readonly author?: Author;
  readonly type?: "website" | "article";
  readonly imageUrl?: string;
  readonly publishedAt?: string;
  /** Trail of ancestors (excluding this page) used for BreadcrumbList JSON-LD. */
  readonly breadcrumbs?: { name: string; path: string }[];
  /** Omit the site-level Person/WebSite graph, e.g. on the 404 page. */
  readonly withoutSiteGraph?: boolean;
};

// Site-level structured data. A portfolio is a person, so Person + WebSite + the
// social profiles in sameAs is what lets search engines and AI answer engines
// attribute the site to Shaira rather than to a generic blog.
const buildSiteGraph = () => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": absoluteUrl("/#person"),
      name: PERSON_NAME,
      alternateName: "shaicodes",
      url: HOST,
      image: absoluteUrl(DEFAULT_IMAGE_URL),
      jobTitle: PERSON_JOB_TITLE,
      description: DEFAULT_DESCRIPTION,
      sameAs: SOCIAL_PROFILES.filter(Boolean),
    },
    {
      "@type": "WebSite",
      "@id": absoluteUrl("/#website"),
      url: HOST,
      name: SITE_TITLE,
      description: DEFAULT_DESCRIPTION,
      inLanguage: "en",
      author: { "@id": absoluteUrl("/#person") },
      publisher: { "@id": absoluteUrl("/#person") },
    },
  ],
});

const buildBreadcrumbList = (trail: { name: string; path: string }[], currentName: string, currentPath: string) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [...trail, { name: currentName, path: currentPath }].map((crumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: crumb.name,
    item: absoluteUrl(crumb.path),
  })),
});

export const Seo = memo<SeoProps>(
  ({
    title,
    description = DEFAULT_DESCRIPTION,
    imageUrl = DEFAULT_IMAGE_URL,
    author,
    type = "website",
    publishedAt,
    breadcrumbs,
    withoutSiteGraph = false,
  }) => {
    const { asPath } = useRouter();
    // Strip the query string and trailing slash so /blog?category=css and /blog
    // never compete as two different canonicals.
    const cleanPath = asPath.split("?")[0].replace(/\/$/, "") || "/";
    const canonical = absoluteUrl(cleanPath);
    const pageTitle = title ? SITE_TITLE_TEMPLATE.replace("%s", title) : SITE_TITLE;
    const socialImage = absoluteUrl(imageUrl);

    return (
      <>
        <NextSeo
          title={pageTitle}
          description={description}
          canonical={canonical}
          openGraph={{
            type,
            url: canonical,
            locale: OG_LOCALE,
            title: pageTitle,
            description,
            site_name: SITE_TITLE,
            images: [{ width: 1200, height: 880, alt: title || SITE_TITLE, url: socialImage }],
            ...(type === "article" ? { article: { publishedTime: publishedAt, authors: [author as Author] } } : {}),
          }}
          twitter={{
            cardType: "summary_large_image",
          }}
        />
        {type === "article" ? (
          <ArticleJsonLd
            url={canonical}
            title={title || ""}
            description={description}
            datePublished={publishedAt as string}
            dateModified={publishedAt as string}
            authorName={author || PERSON_NAME}
            publisherName={PERSON_NAME}
            publisherLogo={absoluteUrl("/regular-android-icon-192x192.png")}
            images={[socialImage]}
          />
        ) : null}
        {withoutSiteGraph ? null : (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildSiteGraph()) }} />
        )}
        {breadcrumbs?.length ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(buildBreadcrumbList(breadcrumbs, title || SITE_TITLE, cleanPath)),
            }}
          />
        ) : null}
        <Head>
          <link
            rel="alternate"
            type="application/rss+xml"
            title="Shaira Ambrosio &raquo; Posts feed"
            href={absoluteUrl("/feed.xml")}
          />
          <link
            rel="alternate"
            type="application/json"
            title="Shaira Ambrosio &raquo; Posts feed"
            href={absoluteUrl("/feed.json")}
          />
          <link rel="apple-touch-icon" sizes="57x57" href="/regular-apple-icon-57x57.png" />
          <link rel="apple-touch-icon" sizes="60x60" href="/regular-apple-icon-60x60.png" />
          <link rel="apple-touch-icon" sizes="72x72" href="/regular-apple-icon-72x72.png" />
          <link rel="apple-touch-icon" sizes="76x76" href="/regular-apple-icon-76x76.png" />
          <link rel="apple-touch-icon" sizes="114x114" href="/regular-apple-icon-114x114.png" />
          <link rel="apple-touch-icon" sizes="120x120" href="/regular-apple-icon-120x120.png" />
          <link rel="apple-touch-icon" sizes="144x144" href="/regular-apple-icon-144x144.png" />
          <link rel="apple-touch-icon" sizes="152x152" href="/regular-apple-icon-152x152.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/regular-apple-icon-180x180.png" />
          <link rel="icon" type="image/png" sizes="192x192" href="/regular-android-icon-192x192.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="manifest" href="/manifest.json" />
          <meta name="msapplication-TileColor" content="#F7F1F3" />
          <meta name="msapplication-TileImage" content="/regular-ms-icon-144x144.png" />
          <meta name="theme-color" content="#855B52" />
        </Head>
      </>
    );
  },
);

Seo.displayName = "Seo";
