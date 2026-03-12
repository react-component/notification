import * as React from 'react';
import raf from '@rc-component/util/es/raf';
import useEvent from '@rc-component/util/es/hooks/useEvent';

export default function useNoticeTimer(
  duration: number | false,
  onClose: VoidFunction,
  onUpdate: (ptg: number) => void,
) {
  const mergedDuration = typeof duration === 'number' ? duration : 0;
  const durationMs = Math.max(mergedDuration, 0) * 1000;
  const onEventClose = useEvent(onClose);
  const onEventUpdate = useEvent(onUpdate);

  const [walking, setWalking] = React.useState(durationMs > 0);
  const startTimestampRef = React.useRef<number | null>(null);
  const passTimeRef = React.useRef(0);

  function onPause() {
    setWalking(false);
  }

  function onResume() {
    setWalking(true);
  }

  function updateProgress() {
    if (durationMs) {
      const now = Date.now();
      const passedTime = now - (startTimestampRef.current || now);
      startTimestampRef.current = now;
      passTimeRef.current += passedTime;
      onEventUpdate(Math.min(passTimeRef.current / durationMs, 1));

      // Return true if timesup
      return passTimeRef.current >= durationMs;
    }
    return false;
  }

  React.useEffect(() => {
    if (walking && durationMs > 0) {
      let rafId: number | null = null;

      function step() {
        if (updateProgress()) {
          onEventClose();
        } else {
          rafId = raf(step);
        }
      }

      startTimestampRef.current = Date.now();
      rafId = raf(step);

      return () => {
        raf.cancel(rafId);
      };
    }
  }, [walking]);

  return [onResume, onPause] as const;
}
