import clsx from "clsx";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { memo } from "react";

import Arrow from "public/svg/right-top-arrow.svg";
import type { Project } from "types";

import styles from "./projectTile.module.scss";

type ProjectTileProps = {
  readonly project: Readonly<Project>;
  readonly mockupPosition: "left" | "right";
};

export const ProjectTile = memo<ProjectTileProps>(({ project, mockupPosition }) => {
  const imageVariants = {
    hover: {
      rotate: mockupPosition === "right" ? "-23.5deg" : "23.5deg",
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
        initial={{
          rotate: mockupPosition === "right" ? "-20deg" : "20deg",
          y: "-45%",
        }}
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
