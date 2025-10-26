import Image from "next/image";

import styles from "./avatarTile.module.scss";

export const AvatarTile = () => {
  return (
    <a className={styles.tile}>
      <div className={styles.avatar}>
        <Image src="/img/avatars/shai.png" alt="Shaira Ambrosio avatar" width={400} height={400} />
      </div>
      <h1 className={styles.name}> SHAIRA AMBROSIO</h1>
      <div className={styles.title}>
        <p>Frontend Developer</p>
        <p>Based in the PH</p>
      </div>
    </a>
  );
};
