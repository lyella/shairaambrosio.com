import { format } from "date-fns";
import { useEffect, useState } from "react";

import styles from "./clockTile.module.scss";

const ClockTile: React.FC = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();

  const formattedDate = format(today, "MMMM do, yyyy");
  const day = format(today, "EEEE");

  const [time, setTime] = useState<Date>(new Date());

  const getCurrentTime = () => {
    return new Date();
  };

  const getRotationDegrees = (time: Date) => {
    const hour = time.getHours() % 12;
    const minute = time.getMinutes();
    const second = time.getSeconds();

    const hourDegrees = hour * 30 + minute * 0.5;
    const minuteDegrees = minute * 6 + second * 0.1;
    const secondDegrees = second * 6;

    return { hour: hourDegrees, minute: minuteDegrees, second: secondDegrees };
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getCurrentTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const { hour, minute, second } = getRotationDegrees(time);

  return (
    <div className={styles.tile}>
      <div>
        <p className={styles.dateTitle}>Today's date is:</p>
        <p className={styles.date}>{formattedDate}</p>
        <h2>{day}</h2>
      </div>
      <div className={styles.analogClock}>
        <div className={styles.hourHand} style={{ transform: `rotate(${hour}deg)` }} />
        <div className={styles.minuteHand} style={{ transform: `rotate(${minute}deg)` }} />
        <div className={styles.secondHand} style={{ transform: `rotate(${second}deg)` }} />
      </div>
    </div>
  );
};

export default ClockTile;
