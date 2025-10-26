import { Link } from "components/mdx/link/Link";
import { useTheme } from "context/ThemeContext";
import { allPositions } from "data/experience";
import { allFacts } from "data/facts";
import { allSkills } from "data/skills";

import styles from "./aboutView.module.scss";
import { Experience } from "./components/experience/Experience";
import { Facts } from "./components/facts/Facts";
import { Hero } from "./components/hero/Hero";
import { Skills } from "./components/skills/Skills";

type Position = {
  id: number;
  position: string;
  company: string;
  date: string;
  link: string;
};

export const AboutView = ({ views }: { views: number }) => {
  const { theme } = useTheme();

  return (
    <div className={styles.about}>
      <Hero views={views} />
      <div className={styles.container}>
        <Skills skills={allSkills} />
        <Experience positions={allPositions} />
      </div>
      <Facts facts={allFacts} />
      <div className={styles.container}>
        <div className={styles.collaboration}>
          <h2 className={styles.title}>Collaboration</h2>
          <p className={styles.description}>
            I'm always open to new suggestions. If you have an unconventional offer or want to see what else I have to
            offer, contact me at <Link href="mailto:hello@shairaambrosio.com">hello@shairaambrosio.com</Link>
          </p>
        </div>
        {/* <div className={styles.contact}>
          <h2 className={styles.title}>Contact</h2>
          <p className={styles.description}>
            You can contact me directly from my <Link href="/contact">website</Link>, via{" "}
            <Link href="mailto:hello@shairaambrosio.com">email</Link>,{" "}
            <Link href="https://facebook.com/shaicodes">Facebook</Link>,{" "}
            <Link href="https://x.com/shaicodes">x</Link> or other social media. I reply to all messages!
            Ask me anything, I'm not afraid of any topics.
          </p>
        </div> */}
      </div>
      {/* <Recommendations recommendations={allRecommendations} /> */}
      {/* <figure className={styles.githubGraph}>
        <Image src={`/img/gh-graph-${theme}.png`} width="1127" height="297" alt="My Github contributions graph" />
        <figcaption className={styles.caption}>My Github graph looks impressing!</figcaption>
      </figure> */}
    </div>
  );
};
