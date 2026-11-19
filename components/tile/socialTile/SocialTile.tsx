import { memo } from "react";
import { motion } from "framer-motion";

import { SOCIALS } from "utils/consts";
import Arrow from "public/svg/right-top-arrow.svg";
import XIcon from "public/svg/x.svg";
import LinkedInIcon from "public/svg/linkedin.svg";
import GithubIcon from "public/svg/github.svg";

import styles from "./socialTile.module.scss";

// Module-scope map instead of `dynamic(() => import(...))` inside render: the old
// form produced a new component type every render and remounted the icon.
const icons = {
  x: XIcon,
  linkedin: LinkedInIcon,
  github: GithubIcon,
} as const;

type SocialTileProps = {
  readonly social: (typeof SOCIALS)[number]["name"];
};

export const SocialTile = memo<SocialTileProps>(({ social }) => {
  const selectedSocial = SOCIALS.find(({ name }) => name === social);
  const Icon = icons[social];

  const iconVariants = {
    hover: { scale: 1.05 },
  };

  return (
    <motion.a
      href={selectedSocial?.link}
      className={styles.tile}
      style={{ backgroundColor: selectedSocial?.color }}
      target="_blank"
      rel="noreferrer"
      whileHover="hover"
      // The whole tile is the link, so its accessible name has to say where it
      // goes; the icon is decorative.
      aria-label={`Visit my ${social} profile`}
    >
      <motion.div className={styles.icon} variants={iconVariants} initial={{ x: "-50%", y: "-50%" }} aria-hidden="true">
        <Icon />
      </motion.div>
      <div className={styles.arrow} aria-hidden="true">
        <Arrow />
      </div>
    </motion.a>
  );
});

SocialTile.displayName = "SocialTile";
