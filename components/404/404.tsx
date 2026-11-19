import dynamic from "next/dynamic";

import { useMounted } from "hooks/useMounted";
import animationData from "../../public/lottie/error-404.json";

import styles from "./404.module.scss";

const Lottie = dynamic(() => import("react-lottie"), { ssr: false });

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

export const Custom404 = () => {
  const isMounted = useMounted();

  return (
    <div className={styles.wrapper}>
      {/* The page had no heading at all: screen-reader users landed on an
          unlabelled page. The Lottie animation is purely decorative. */}
      <h1 className={styles.title}>Page not found</h1>
      <div className={styles.lottie} aria-hidden="true">
        {isMounted && <Lottie options={defaultOptions} />}
      </div>
      <p className={styles.description}>
        The URL you entered seems to be incorrect or the page has been moved or removed.
      </p>
    </div>
  );
};
