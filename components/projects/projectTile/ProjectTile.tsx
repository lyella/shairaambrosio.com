import { motion } from "framer-motion";

import Image from "next/image";

import { memo } from "react";

import Arrow from "public/svg/right-top-arrow.svg";

import type { Project } from "types";

import styles from "./projectTile.module.scss";

type ProjectTileProps = {
  readonly project: Readonly<Project>;
};

export const ProjectTile = memo<ProjectTileProps>(({ project }) => {
  const imageVariants = {
    hover: {
      scale: 1.05,
    },
  };

  return (
    <motion.a
      href={`/projects/${project.slug}`}
      className={styles.project}
      whileHover="hover"
    >
      <span className="sr-only">check my project - {project.title}</span>
      <motion.div className={styles.mockup} variants={imageVariants}>
        <Image src={project.image} alt={project.title} height="880" width="1200" />
      </motion.div>
      <div className={styles.arrow}>
        <Arrow />
      </div>
    </motion.a>
  );
});

ProjectTile.displayName = "ProjectTile";
