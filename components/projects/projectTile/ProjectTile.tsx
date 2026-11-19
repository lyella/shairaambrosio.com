import { motion } from "framer-motion";

import Image from "next/image";
import Link from "next/link";

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

  // The tile is a tall, narrow grid cell; prefer portrait artwork when a project
  // supplies it, because cropping a wide screenshot to this shape leaves a slice.
  const artwork = project.imageTall ?? project.image;

  // Intrinsic size must describe the ACTUAL file. Hardcoding 1200x880 made the
  // browser reserve a 1.36 box for a 0.349 portrait image, so the tile painted a
  // zoomed-in corner of it.
  const isPortrait = Boolean(project.imageTall);
  const intrinsic = isPortrait ? { width: 700, height: 2006 } : { width: 1200, height: 880 };

  return (
    // next/link instead of a raw <a>: this is an internal route, so it should be
    // prefetched and use client navigation instead of a full document load.
    <Link href={`/projects/${project.slug}`} className={styles.project}>
      <span className="sr-only">check my project - {project.title}</span>
      <motion.div className={styles.mockup} variants={imageVariants} whileHover="hover">
        <Image
          src={artwork}
          alt={project.title}
          width={intrinsic.width}
          height={intrinsic.height}
          sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 420px"
        />
      </motion.div>
      <div className={styles.arrow}>
        <Arrow />
      </div>
    </Link>
  );
});

ProjectTile.displayName = "ProjectTile";
