import Link from "next/link";
import { memo } from "react";

import type { Category } from "types";

import styles from "./categoriesList.module.scss";
import { CategoryCard } from "./categoryCard/CategoryCard";

type CategoriesListProps = {
  readonly categories: Category[];
};

export const CategoriesList = memo<CategoriesListProps>(({ categories }) => {
  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>categories</h2>
      <div className={styles.categories}>
        <Link href="/blog">
          <a className={styles.category}>All</a>
        </Link>
        {categories.map((category) => (
          <CategoryCard category={category} key={category} />
        ))}
      </div>
    </section>
  );
});

CategoriesList.displayName = "CategoriesList";
