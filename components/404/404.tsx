import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.lottie}>
        {isMounted && <Lottie options={defaultOptions} />}
      </div>
      <p className={styles.description}>
        The URL you entered seems to be incorrect or the page has been moved or removed.
      </p>
    </div>
  );
};
