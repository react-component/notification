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

  function syncPassTime() {
    const now = Date.now();
    const passedTime = now - (startTimestampRef.current || now);
    startTimestampRef.current = now;
    passTimeRef.current += passedTime;
  }

  function onPause() {
    syncPassTime();
    setWalking(false);
  }

  function onResume() {
    if (durationMs > 0) {
      setWalking(true);
    } else {
      onEventUpdate(0);
    }
  }

  React.useEffect(() => {
    if (durationMs <= 0) {
      startTimestampRef.current = null;
      onEventUpdate(0);
      return;
    }

    syncPassTime();
    onEventUpdate(Math.min(passTimeRef.current / durationMs, 1));

    if (!walking) {
      startTimestampRef.current = null;
      return;
    }

    if (passTimeRef.current >= durationMs) {
      onEventClose();
      return;
    }

    let rafId: number | null = null;

    function step() {
      syncPassTime();
      onEventUpdate(Math.min(passTimeRef.current / durationMs, 1));

      if (passTimeRef.current >= durationMs) {
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
  }, [durationMs, walking]);

  return [onResume, onPause] as const;
}
