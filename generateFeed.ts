import fs from "fs";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Feed } from "feed";

import type { Author } from "./types/index";

import { getPublishedPosts } from "./lib/posts";
import { absoluteUrl, DEFAULT_DESCRIPTION, HOST, SITE_TITLE } from "./utils/consts";

dayjs.extend(customParseFormat);

function run() {
  const publicUrl = HOST;

  const posts = getPublishedPosts();
  const feed = new Feed({
    title: SITE_TITLE,
    link: publicUrl,
    id: publicUrl,
    description: DEFAULT_DESCRIPTION,
    image: absoluteUrl("/regular-android-icon-192x192.png"),
    favicon: absoluteUrl("/favicon.ico"),
    copyright: `${new Date().getFullYear()} Shaira Ambrosio`,
    updated: new Date(),
    generator: SITE_TITLE,
    feedLinks: {
      rss: absoluteUrl("/feed.xml"),
      json: absoluteUrl("/feed.json"),
    },
    language: "en",
    author: {
      name: SITE_TITLE,
      link: publicUrl,
    },
  });

  posts.forEach(({ slug, title, excerpt, image, author, publishedAt }) => {
    const url = absoluteUrl(`/blog/${slug}`);
    const date = dayjs(publishedAt, "DD-MM-YYYY");

    feed.addItem({
      title,
      // Item ids must be absolute and stable. A bare slug made readers treat the
      // same post as new when the id format changed.
      id: url,
      description: excerpt,
      link: url,
      image: absoluteUrl(image),
      author: [{ name: author as Author }],
      date: date.isValid() ? date.toDate() : new Date(),
    });
  });

  fs.writeFileSync("./public/feed.xml", feed.rss2());
  fs.writeFileSync("./public/feed.json", feed.json1());
}

run();
