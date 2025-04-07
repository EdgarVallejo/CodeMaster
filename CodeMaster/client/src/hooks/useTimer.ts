import { useState, useEffect } from "react";

export function useTimer(initialMinutes: number) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isTimeWarning, setIsTimeWarning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Set warning when less than 5 minutes remaining
  useEffect(() => {
    if (timeLeft <= 300 && !isTimeWarning) {
      setIsTimeWarning(true);
    }
  }, [timeLeft, isTimeWarning]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return { minutes, seconds, isTimeWarning };
}
