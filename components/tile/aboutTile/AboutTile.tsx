import Link from "next/link";

import Arrow from "public/svg/right-top-arrow.svg";

import styles from "./aboutTile.module.scss";

export const AboutTile = () => {
  return (
    <Link href="/about">
      <div className={styles.tile}>
        <p className={styles.description}>
          Kumusta! I'm a frontend developer who loves creating intuitive digital experiences with clean, modern code. I
          use my understanding of design, user behavior, and technology to bring ideas to life and deliver outstanding
          user experiences. Nice to meet you!
        </p>
        <div className={styles.more}>
          Learn More
          <span className={styles.arrow}>
            <Arrow />
          </span>
        </div>
      </div>
    </Link>
  );
};
