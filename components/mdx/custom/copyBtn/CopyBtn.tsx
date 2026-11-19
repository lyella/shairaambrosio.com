import { memo, useState, useEffect } from "react";
import clsx from "clsx";
import Confetti from "react-dom-confetti";

import { copyToClipboard } from "utils/clipboard";

import styles from "./copyBtn.module.scss";

type CopyBtnProps = {
  readonly label: string;
  readonly textToCopy: string;
};

export const CopyBtn = memo<CopyBtnProps>(({ label, textToCopy }) => {
  const [isCopied, setIsCopied] = useState(false);
  const handleCopyBtnClick = async () => {
    try {
      await copyToClipboard(textToCopy);
      setIsCopied(true);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // Only run the "revert the label" timer after a copy actually happened;
    // otherwise it re-armed on every render.
    if (!isCopied) {
      return;
    }

    const timer = setTimeout(() => setIsCopied(false), 2000);

    return () => clearTimeout(timer);
  }, [isCopied]);

  const confettiConfig = {
    spread: 360,
    startVelocity: 20,
  };

  return (
    // A single wrapper element (not a fragment): MDX needs a component to render
    // an element, and React 19 widened fragment return types to ReactNode.
    <div className={styles.wrapper}>
      <Confetti active={isCopied} config={confettiConfig} />
      <button onClick={handleCopyBtnClick} className={clsx(styles.btn, { [styles.copied]: isCopied })}>
        <span>{isCopied ? "Copied! 🎉" : label}</span>
      </button>
    </div>
  );
});

CopyBtn.displayName = "CopyBtn";
