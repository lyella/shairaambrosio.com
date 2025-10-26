import Link from "next/link";
import { memo } from "react";

import { allCategories } from "data/categories";
import type { Category as CategoryType } from "types";

import styles from "./categoryCard.module.scss";

type CategoryCardProps = {
  readonly category: CategoryType;
};

export const CategoryCard = memo<CategoryCardProps>(({ category }) => {
  const categoryObj = allCategories.find((c) => c.slug === category);

  let categoryClass = "";

  switch (categoryObj?.name) {
    case "CSS":
      categoryClass = styles.css;
      break;
    case "HTML":
      categoryClass = styles.html;
      break;
    case "JavaScript":
      categoryClass = styles.js;
      break;
    case "Design":
      categoryClass = styles.design;
      break;
    case "Other":
      categoryClass = styles.other;
      break;
    case "Life":
      categoryClass = styles.life;
      break;
    default:
      categoryClass = styles.default;
      break;
  }

  return (
    <Link href={`/blog?category=${category}`} key={category} className={`${styles.category} ${categoryClass}`}>
      {categoryObj?.name}
    </Link>
  );
});

CategoryCard.displayName = "CategoryCard";
