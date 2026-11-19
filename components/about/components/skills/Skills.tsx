import { memo } from "react";

import HtmlIcon from "public/svg/techs/html.svg";
import CssIcon from "public/svg/techs/css.svg";
import ScssIcon from "public/svg/techs/scss.svg";
import JsIcon from "public/svg/techs/js.svg";
import TsIcon from "public/svg/techs/ts.svg";
import VueIcon from "public/svg/techs/vue.svg";
import ReactIcon from "public/svg/techs/react.svg";
import NextjsIcon from "public/svg/techs/nextjs.svg";
import NodejsIcon from "public/svg/techs/nodejs.svg";
import PostgresqlIcon from "public/svg/techs/postgresql.svg";
import MongodbIcon from "public/svg/techs/mongodb.svg";
import PhpIcon from "public/svg/techs/php.svg";
import GitIcon from "public/svg/techs/git.svg";
import WordpressIcon from "public/svg/techs/wordpress.svg";
import WebflowIcon from "public/svg/techs/webflow.svg";
import ShopifyIcon from "public/svg/techs/shopify.svg";
import JestIcon from "public/svg/techs/jest.svg";
import CypressIcon from "public/svg/techs/cypress.svg";
import MjmlIcon from "public/svg/techs/mjml.svg";
import EmailIcon from "public/svg/techs/email.svg";

import type { Skill } from "../../types";

import styles from "./skills.module.scss";

// One stable component type per icon for the whole module.
//
// Importing each icon with `dynamic(() => import(...))` inside `.map()` created a
// fresh component type on every render, so React unmounted and remounted all 21
// SVGs each time the page updated instead of reconciling them.
const icons: Record<string, React.ComponentType> = {
  html: HtmlIcon,
  css: CssIcon,
  scss: ScssIcon,
  js: JsIcon,
  ts: TsIcon,
  vue: VueIcon,
  react: ReactIcon,
  nextjs: NextjsIcon,
  nodejs: NodejsIcon,
  postgresql: PostgresqlIcon,
  mongodb: MongodbIcon,
  php: PhpIcon,
  git: GitIcon,
  wordpress: WordpressIcon,
  webflow: WebflowIcon,
  shopify: ShopifyIcon,
  jest: JestIcon,
  cypress: CypressIcon,
  mjml: MjmlIcon,
  email: EmailIcon,
};

type SkillsProps = {
  readonly skills: readonly Skill[];
};

export const Skills = memo<SkillsProps>(({ skills }) => {
  return (
    <section className={styles.skills}>
      <h2 className={styles.title}>Skills</h2>
      <p className={styles.description}>The technologies with which I feel at ease.</p>

      <ul className={styles.list}>
        {skills.map((skill) => {
          const Icon = icons[skill.slug];

          return (
            <li className={styles.skill} key={skill.slug} style={{ color: skill.color }}>
              <a href={skill.link} rel="noreferrer noopener" target="_blank" className={styles.link}>
                <span className={styles.label}>{skill.name}</span>
                {Icon ? <Icon /> : null}
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
});

Skills.displayName = "Skills";
