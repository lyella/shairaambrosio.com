import Link from "next/link";
import { memo } from "react";

import { allCategories } from "data/categories";
import Arrow from "public/svg/right-top-arrow.svg";
import type { Post } from "types";

import styles from "./postThumbnail.module.scss";

type PostThumbnailProps = {
  readonly post: Post;
};

export const PostThumbnail = memo<PostThumbnailProps>(({ post }) => {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`${styles.post} 
          ${post.category === "design" ? styles.blueBg : ""} 
          ${post.category === "html" ? styles.orangeBg : ""}
          ${post.category === "other" ? styles.redBg : ""} 
          ${post.category === "life" ? styles.violetBg : ""}
          ${post.category === "js" ? styles.yellowBg : ""} 
          ${post.category === "css" ? styles.pinkBg : ""}`}
      >
        <article className={styles.group}>
          <div>
            <h2 className={styles.title}>{post.title}</h2>
            <p className={styles.excerpt}>{post.excerpt}</p>
          </div>
          <div>
            <div className={styles.image} style={{ backgroundImage: `url(${post.image})` }}></div>
            <div className={styles.info}>
              <div className={styles.mainInfo}>
                <span className={styles.category}>{allCategories.find((c) => c.slug === post.category)?.name}</span>•
                <span className={styles.time}>{Math.round(post.timeToRead)} minutes</span>
              </div>
              <div className={styles.more}>
                Read More
                <span className={styles.arrow}>
                  <Arrow />
                </span>
              </div>
            </div>
          </div>
        </article>
    </Link>
  );
});

PostThumbnail.displayName = "PostThumbnail";
