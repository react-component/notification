import * as React from 'react';
import raf from '@rc-component/util/es/raf';
import useEvent from '@rc-component/util/es/hooks/useEvent';

/**
 * Runs the notice auto-close timer and reports progress updates.
 * Returns controls to pause and resume the timer.
 */
export default function useNoticeTimer(
  duration: number | false | null,
  onClose: VoidFunction,
  onUpdate: (ptg: number) => void,
) {
  const mergedDuration = typeof duration === 'number' ? duration : 0;
  const durationMs = Math.max(mergedDuration, 0) * 1000;
  const onEventClose = useEvent(onClose);
  const onEventUpdate = useEvent(onUpdate);

  const [walking, setWalking] = React.useState(durationMs > 0);
  const passTimeRef = React.useRef(0);
  const lastRafTimeRef = React.useRef<number | null>(null);

  function syncPassTime() {
    const now = Date.now();
    const lastRafTime = lastRafTimeRef.current;

    if (lastRafTime !== null) {
      passTimeRef.current += now - lastRafTime;
    }

    lastRafTimeRef.current = now;
  }

  const onPause = React.useCallback(() => {
    syncPassTime();
    setWalking(false);
  }, []);

  const onResume = React.useCallback(() => {
    if (durationMs > 0) {
      lastRafTimeRef.current = Date.now();
      setWalking(true);
    } else {
      onEventUpdate(0);
    }
  }, [durationMs]);

  // Reset when durationMs changed.
  React.useEffect(() => {
    passTimeRef.current = 0;
    setWalking(durationMs > 0);
  }, [durationMs]);

  // Trigger update when walking changed.
  React.useEffect(() => {
    if (!walking) {
      return;
    }

    let rafId: number | null = null;

    function step() {
      syncPassTime();

      if (passTimeRef.current >= durationMs) {
        onEventUpdate(1);
        onEventClose();
      } else {
        onEventUpdate(Math.min(passTimeRef.current / durationMs, 1));
        rafId = raf(step);
      }
    }

    step();

    return () => {
      raf.cancel(rafId!);
    };
  }, [durationMs, walking]);

  return [onResume, onPause] as const;
}
