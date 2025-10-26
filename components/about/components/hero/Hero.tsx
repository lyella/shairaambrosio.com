import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import animationData from "../../../../public/lottie/shai-waving.json";

import styles from "./hero.module.scss";

const Lottie = dynamic(() => import("react-lottie").then((mod) => mod.default), { ssr: false });

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

export const Hero = ({ views }: { views: number }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <section className={styles.hero}>
      <div className={styles.text}>
        <h2 className={styles.title}>Hi, I'm Shaira Ambrosio</h2>
        <p className={styles.description}>
          <span className={styles.paragraph}>
            I'm a passionate Frontend Developer based in the Philippines. With a unique perspective, I deliver innovative
            and high-quality solutions to make people's lives easier, more enjoyable, and productive. From user-friendly
            interfaces to optimized websites, I strive to exceed my clients' expectations and inspire others to see the
            potential of technology.
          </span>
          <span className={styles.paragraph}>
            As a freelancer, I'm open to innovative ideas and solutions and enjoy conversing with interesting people.
          </span>
          <span className={styles.paragraph}>
            In my free time, I enjoy reading, playing video games, and watching anime. If this sounds intriguing, please
            contact me.
          </span>
        </p>
      </div>

      <div className={styles.image}>
        {isMounted && <Lottie options={defaultOptions} height={400} />}
      </div>
    </section>
  );
};
