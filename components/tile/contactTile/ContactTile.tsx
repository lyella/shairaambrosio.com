import NextImage from "next/image";
import NextLink from "next/link";

import styles from "./contactTile.module.scss";

// The real page <h1> is the avatar name, so this headline is an <h2>: it used to be
// a second <h1> on the homepage.
export const ContactTile = () => {
  return (
    <div className={styles.tile}>
      <div className={styles.avatar}>
        <NextImage src="/img/mail.png" alt="" width={100} height={100} />
      </div>
      <h2 className={styles.title}>Let&apos;s build something together!</h2>
      <p className={styles.message}>
        Don&apos;t hesitate to get in touch if you&apos;re seeking a developer, have an inquiry, or simply want to make
        a connection.
      </p>
      <p className={styles.mail}>
        <NextLink href="mailto:hello@shairaambrosio.com">hello@shairaambrosio.com</NextLink>
      </p>
    </div>
  );
};
