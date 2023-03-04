import { memo } from "react";

import type { Fact as FactType } from "../../types";

import { Fact } from "./fact/Fact";
import styles from "./facts.module.scss";

type FactsProps = {
  readonly facts: readonly FactType[];
};

export const Facts = memo<FactsProps>(({ facts }) => {
  return (
    <section className={styles.facts}>
      <h2 className={styles.title}>Interesting pieces of information about me</h2>
      <p className={styles.description}>Here are a few distinct qualities that make me unique</p>

      <ul className={styles.list}>
        {facts.map((fact) => (
          <Fact key={fact.title} fact={fact} />
        ))}
      </ul>
    </section>
  );
});

Facts.displayName = "Facts";
