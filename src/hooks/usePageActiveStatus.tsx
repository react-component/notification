import { useState, useEffect } from 'react';

export default function usePageActiveStatus() {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const onFocus = function () {
      setActive(true);
    };
    const onblur = function () {
      setActive(false);
    };
    const onVisibilitychange = function () {
      if (document.visibilityState === 'visible') {
        onFocus();
      } else {
        onblur();
      }
    };
    window.addEventListener('focus', onFocus, false);
    window.addEventListener('blur', onblur, false);
    document.addEventListener('visibilitychange', onVisibilitychange, false);

    return function () {
      window.removeEventListener('focus', onFocus, false);
      window.removeEventListener('blur', onblur, false);
      window.removeEventListener('visibilitychange', onVisibilitychange, false);
    };
  }, []);

  return active;
}
