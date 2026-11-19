import { useEffect, useState } from "react";

import styles from "./clockTile.module.scss";

const FormattedClock = () => {
  // The 1s tick lives in this component so the interval only exists while the tile
  // is mounted. The first value is set from a deferred task, never synchronously in
  // the effect body, and never during render, because the server and the browser
  // disagree on "now" and rendering it on the server caused a hydration mismatch.
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    const starter = setTimeout(() => setTime(new Date()), 0);
    const interval = setInterval(() => setTime(new Date()), 1000);

    return () => {
      clearTimeout(starter);
      clearInterval(interval);
    };
  }, []);

  if (!time) {
    return <div className={styles.clockPlaceholder} aria-hidden="true" />;
  }

  const formattedDate = time.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const day = time.toLocaleDateString("en-US", { weekday: "long" });

  const hour = time.getHours() % 12;
  const minute = time.getMinutes();
  const second = time.getSeconds();

  const hourDegrees = hour * 30 + minute * 0.5;
  const minuteDegrees = minute * 6 + second * 0.1;
  const secondDegrees = second * 6;

  return (
    <>
      <div>
        <p className={styles.dateTitle}>Today&apos;s date is:</p>
        <p className={styles.date}>{formattedDate}</p>
        <p className={styles.day}>{day}</p>
      </div>
      <div
        className={styles.analogClock}
        role="img"
        aria-label={`Analog clock showing ${String(time.getHours()).padStart(2, "0")}:${String(minute).padStart(
          2,
          "0",
        )}`}
      >
        <div className={styles.hourHand} style={{ transform: `rotate(${hourDegrees}deg)` }} />
        <div className={styles.minuteHand} style={{ transform: `rotate(${minuteDegrees}deg)` }} />
        <div className={styles.secondHand} style={{ transform: `rotate(${secondDegrees}deg)` }} />
      </div>
    </>
  );
};

const ClockTile: React.FC = () => {
  return (
    <div className={styles.tile}>
      <FormattedClock />
    </div>
  );
};

export default ClockTile;
