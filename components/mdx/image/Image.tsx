import NextImage from "next/image";
import { memo } from "react";

import styles from "./image.module.scss";

type ImageProps = {
  readonly src: string;
  readonly alt: string;
  readonly width?: string | number;
  readonly height?: string | number;
};

export const Image = memo<ImageProps>(({ src, alt = "", width = "100%", height }) => {
  const numericWidth = typeof width === "string" ? parseInt(width, 10) : width;
  const numericHeight = typeof height === "string" ? parseInt(height, 10) : height;

  return (
    <figure className={styles.wrapper}>
      <NextImage
        className={styles.image}
        src={src}
        alt={alt}
        width={numericWidth}
        height={numericHeight}
        loading="lazy"
        decoding="async"
      />
      {alt ? <figcaption className={styles.caption}>{alt}</figcaption> : null}
    </figure>
  );
});

Image.displayName = "Image";
