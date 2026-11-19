import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import clsx from "clsx";

import SearchIcon from "public/svg/search.svg";

import styles from "./input.module.scss";

// React 19 removed the global JSX namespace, so `JSX.IntrinsicElements["input"]`
// no longer resolves. ComponentPropsWithoutRef is the supported equivalent.
type InputProps = ComponentPropsWithoutRef<"input"> & { isError?: boolean };

export const Input = forwardRef<HTMLInputElement, InputProps>(({ isError, children, ...props }, ref) => {
  return (
    <label className={styles.wrapper}>
      {children}
      {props.type === "search" && <SearchIcon className={styles.icon} />}
      <input
        ref={ref}
        {...props}
        className={clsx(styles.input, { [styles.error]: isError, [styles.search]: props.type === "search" })}
        type={props.type || "text"}
      />
    </label>
  );
});

Input.displayName = "Input";
