import NextImage from "next/image";
import { memo } from "react";

import styles from "./image.module.scss";

type ImageProps = {
  readonly src: string;
  readonly alt: string;
  /** Intrinsic width in px. Defaults to 1200 (the site's standard capture width). */
  readonly width?: string | number;
  /** Intrinsic height in px. Defaults to the 1200x880 banner ratio. */
  readonly height?: string | number;
  /**
   * Optional presentation. `phone` constrains a tall mobile screenshot to a device
   * frame; `wide` is the default for desktop screenshots.
   */
  readonly variant?: "wide" | "phone";
};

const parseDimension = (value: string | number | undefined) => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && /^\d+$/.test(value)) return parseInt(value, 10);

  return undefined;
};

const ImageComponent = memo<ImageProps>(({ src, alt = "", width, height, variant = "wide" }) => {
  // next/image lays out from intrinsic dimensions, so an <Image> without them
  // rendered zero pixels tall (the phone screenshot did exactly that). These
  // defaults match how the existing posts call the component (1200x880 capture) and
  // callers can override per image; the CSS below additionally caps the rendered
  // size so a mismatched ratio can never stretch the layout.
  const numericWidth = parseDimension(width) ?? 1200;
  const numericHeight = parseDimension(height) ?? 880;

  // Screenshots are captured at 1440px or 375px. Telling the browser the rendered
  // width stops Next shipping a 1440w file to a phone.
  const sizes = variant === "phone" ? "(max-width: 600px) 70vw, 320px" : "(max-width: 700px) 92vw, 666px";

  return (
    <figure className={`${styles.wrapper} ${styles[variant]}`}>
      <div className={styles.frame}>
        <NextImage
          className={styles.image}
          src={src}
          alt={alt}
          width={numericWidth}
          height={numericHeight}
          sizes={sizes}
          loading="lazy"
          decoding="async"
        />
      </div>
      {alt ? <figcaption className={styles.caption}>{alt}</figcaption> : null}
    </figure>
  );
});

ImageComponent.displayName = "Image";

export { ImageComponent as Image };
export default ImageComponent;
