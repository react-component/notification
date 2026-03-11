import * as React from 'react';

export default function useNoticeTimer(duration: number | false, onClose: VoidFunction) {
  // Normalize: `false` means no auto-close
  const mergedDuration: number = typeof duration === 'number' ? duration : 0;

  const startTimestampRef = React.useRef(0);
  const leftTimeRef = React.useRef(mergedDuration * 1000);
  const timerRef = React.useRef<NodeJS.Timeout>();

  const clear = () => {
    clearTimeout(timerRef.current);
  };

  const onResume = () => {
    clear();

    // Only start timer when there is remaining time
    if (leftTimeRef.current > 0) {
      startTimestampRef.current = Date.now();
      timerRef.current = setTimeout(() => {
        onClose();
      }, leftTimeRef.current);
    }
  };

  const onPause = () => {
    clear();

    // Record how much time is left so onResume can continue from here
    leftTimeRef.current -= Date.now() - startTimestampRef.current;
  };

  React.useEffect(() => {
    // Reset remaining time whenever duration changes, then (re)start the timer
    leftTimeRef.current = mergedDuration * 1000;
    onResume();

    // Clear the timer on unmount or before next effect run
    return clear;
  }, []);

  return [onResume, onPause] as const;
}
