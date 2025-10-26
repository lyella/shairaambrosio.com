import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Lottie = dynamic(() => import("react-lottie").then((mod) => mod.default), { ssr: false });

import { ContactForm } from "components/contact/contactForm/ContactForm";

import messageSending from '../../public/lottie/message_sending.json';
import messageSent from '../../public/lottie/message_sent.json';


import styles from "./contact.module.scss";
const sending = {
  loop: true,
  autoplay: true,
  animationData: messageSending,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};
const sent = {
  loop: true,
  autoplay: true,
  animationData: messageSent,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};
export const Contact = () => {
  const [isSent, setIsSent] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <section className={styles.wrapper}>
      <ContactForm handleIsSent={(val: boolean) => setIsSent(val)} />
      <div className={styles.avatar}>
        {isMounted && (isSent ? (
          <Lottie options={sent} height={400} />
        ) : (
          <Lottie options={sending} height={500} />
        ))}
      </div>
    </section>
  );
};
