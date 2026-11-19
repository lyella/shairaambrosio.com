import dynamic from "next/dynamic";
import { useCallback, useState } from "react";

import { useMounted } from "hooks/useMounted";

const Lottie = dynamic(() => import("react-lottie"), { ssr: false });

import { ContactForm } from "components/contact/contactForm/ContactForm";

import messageSending from "../../public/lottie/message_sending.json";
import messageSent from "../../public/lottie/message_sent.json";

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
  const isMounted = useMounted();

  // Stable identity: ContactForm depends on this callback inside an effect, so an
  // inline arrow would re-run that effect on every parent render.
  const handleIsSent = useCallback((val: boolean) => setIsSent(val), []);

  return (
    <section className={styles.wrapper}>
      <ContactForm handleIsSent={handleIsSent} />
      <div className={styles.avatar}>
        {isMounted && (isSent ? <Lottie options={sent} height={400} /> : <Lottie options={sending} height={500} />)}
      </div>
    </section>
  );
};
