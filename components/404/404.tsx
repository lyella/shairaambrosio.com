import Lottie from "react-lottie";

import animationData from "../../public/lottie/error-404.json";

import styles from "./404.module.scss";

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

export const Custom404 = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.lottie}>
        <Lottie options={defaultOptions} />
      </div>
      <p className={styles.description}>
        The URL you entered seems to be incorrect or the page has been moved or removed.
      </p>
    </div>
  );
};
