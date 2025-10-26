import dynamic from "next/dynamic";
import NextLink from "next/link";

import { Link } from "components/mdx/link/Link";
import { useTheme } from "context/ThemeContext";
import { useWindowSize } from "hooks/useWindowSize";
import Logo from "public/svg/logo.svg";
import { SOCIALS } from "utils/consts";
import { ThemeSwitcher } from "components/common/themeSwitcher/ThemeSwitcher";

import styles from "./footer.module.scss";

const Social = ({ social }: { social: typeof SOCIALS[number] }) => {
  const selectedSocial = SOCIALS.find(({ name }) => name === social.name) as typeof SOCIALS[number];
  const Icon = dynamic(() => import(`public/svg/${selectedSocial?.name}.svg`));
  const { width } = useWindowSize();
  const { theme } = useTheme();

  return (
    <>
      {width! > 640 ? (
        <Link href={selectedSocial.link}>{selectedSocial?.name}</Link>
      ) : (
        <a
          href={selectedSocial.link}
          className={styles.social}
          style={{ color: theme === "dark" ? "#fff" : selectedSocial?.color } as React.CSSProperties}
        >
          <span className="sr-only">check my {selectedSocial?.name}</span>
          <Icon />
        </a>
      )}
    </>
  );
};

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.wrapper}>
        <div className={styles.links}>
          <div className={styles.themeWrap}>
            <NextLink href="/" className={styles.home}>
              <span className="sr-only">home</span>
              <Logo />
            </NextLink>
            <label className={styles.theme}>
              <ThemeSwitcher />
            </label>
          </div>
          <div className={styles.socials}>
            {SOCIALS.map((social) => (
              <Social social={social} key={social.name} />
            ))}
          </div>
        </div>
        <span className={styles.copyright}>
          &copy; {new Date().getFullYear()} Shaira Ambrosio. All rights reserved.
        </span>
      </div>
    </footer>
  );
};
