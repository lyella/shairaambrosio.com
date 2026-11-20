import Image from "next/image";

import styles from "./avatarTile.module.scss";

// This was an `<a>` with no href: not focusable, not announced as a link, and
// skipped entirely by keyboard users. It is a name plate, not a control, so it is
// a plain element and the name is the page's single <h1>.
export const AvatarTile = () => {
  return (
    <div className={styles.tile}>
      <div className={styles.avatar}>
        <Image
          src="/img/avatars/shai.png"
          alt="Shaira Ambrosio"
          width={400}
          height={400}
          // The tiles sit above the fold on every viewport, so let this one fetch
          // eagerly instead of waiting for the lazy-load threshold.
          priority
          sizes="(max-width: 640px) 220px, 220px"
        />
      </div>
      <h1 className={styles.name}>SHAIRA AMBROSIO</h1>
      <p className={styles.title}>
        <span className={styles.role}>Full-Stack Developer</span>
        <span className={styles.role}>Based in the PH</span>
      </p>
    </div>
  );
};
