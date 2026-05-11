import { useState, useEffect, useRef } from 'react';

export function useTimer(
  startTime: string | null,
  pausedDuration: number,
  lastPausedAt: string | null
): number {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    if (!startTime) {
      setElapsed(0);
      return;
    }

    const update = () => {
      const now = Date.now();
      const start = new Date(startTime).getTime();
      let paused = pausedDuration;
      if (lastPausedAt) {
        paused += Math.floor((now - new Date(lastPausedAt).getTime()) / 1000);
      }
      setElapsed(Math.max(0, Math.floor((now - start) / 1000) - paused));
    };

    update();
    intervalRef.current = setInterval(update, 1000);
    return () => clearInterval(intervalRef.current);
  }, [startTime, pausedDuration, lastPausedAt]);

  return elapsed;
}
