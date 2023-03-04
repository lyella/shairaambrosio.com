import Lottie from "react-lottie";
import { useState } from "react";

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

  return (
    <section className={styles.wrapper}>
      <ContactForm handleIsSent={(val: boolean) => setIsSent(val)} />
      <div className={styles.avatar}>
        {isSent ? (
          <Lottie options={sent} height={400} />
        ) : (
          <Lottie options={sending} height={500} />
        )}
      </div>
    </section>
  );
};
