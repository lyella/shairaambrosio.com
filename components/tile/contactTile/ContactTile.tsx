import Image from "next/image";

import { Link } from "components/common/link/Link";

import styles from "./contactTile.module.scss";

export const ContactTile = () => {
  return (
    <div className={styles.tile}>
      <div className={styles.avatar}>
        <Image src="/img/mail.png" alt="message me" width={100} height={100} />
      </div>
      <h1 className={styles.title}> Let's build something together!</h1>
      <p className={styles.message}>
        Don't hesitate to get in touch if you're seeking a developer, have an inquiry, or simply want to make a
        connection.
      </p>
      <div className={styles.title}>
        <Link href="mailto:hello@shairaambrosio.com">hello@shairaambrosio.com</Link>
      </div>
    </div>
  );
};
