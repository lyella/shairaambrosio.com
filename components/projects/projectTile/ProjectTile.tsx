import clsx from "clsx";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { memo } from "react";

import Arrow from "public/svg/right-top-arrow.svg";
import { useWindowSize } from "hooks/useWindowSize";
import type { Project } from "types";

import styles from "./projectTile.module.scss";

type ProjectTileProps = {
  readonly project: Readonly<Project>;
  readonly mockupPosition: "left" | "right";
};

export const ProjectTile = memo<ProjectTileProps>(({ project, mockupPosition }) => {
  const { width } = useWindowSize();
  // Below the lg breakpoint the grid is narrow and tiles stretch over two rows;
  // the rotated "peeking mockup" then renders as an empty slab, so fill the tile instead.
  const isCompact = (width ?? 1440) <= 900;
  const angle = mockupPosition === "right" ? -1 : 1;

  const mockupMotion = {
    rotate: isCompact ? 0 : angle * 20,
    y: isCompact ? "0%" : "-45%",
  };

  const imageVariants = {
    hover: {
      rotate: isCompact ? 0 : angle * 23.5,
    },
  };

  return (
    <motion.a
      href={`/projects/${project.slug}`}
      className={styles.project}
      whileHover="hover"
    >
      <span className="sr-only">check my project - {project.title}</span>
      <motion.div
        className={clsx(styles.mockup, styles[mockupPosition])}
        variants={imageVariants}
        initial={mockupMotion}
        animate={mockupMotion}
      >
        <Image src={project.image} alt={project.title} height="880" width="1200" />
      </motion.div>
      <div className={styles.arrow}>
        <Arrow />
      </div>
    </motion.a>
  );
});

ProjectTile.displayName = "ProjectTile";
