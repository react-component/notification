/* eslint-disable no-console */
import React from 'react';
import type { CSSMotionProps } from '@rc-component/motion';
import '../../assets/index.less';
import { useNotification } from '../../src';

const Context = React.createContext({ name: 'light' });

const motion: CSSMotionProps = {
  motionName: 'rc-notification-fade',
  motionAppear: true,
  motionEnter: true,
  motionLeave: true,
};

const getConfig = () => ({
  description: `${Array(Math.round(Math.random() * 5) + 1)
    .fill(1)
    .map(() => new Date().toISOString())
    .join('\n')}`,
  duration: false as const,
});

const Demo = () => {
  const [{ open }, holder] = useNotification({
    motion,
    stack: { threshold: 3, offset: 20 },
    closable: true,
  });

  return (
    <Context.Provider value={{ name: 'bamboo' }}>
      <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button
          type="button"
          onClick={() => {
            open(getConfig());
          }}
        >
          Top Right
        </button>
        <button
          type="button"
          onClick={() => {
            open({ ...getConfig(), placement: 'bottomRight' });
          }}
        >
          Bottom Right
        </button>
      </div>
      {holder}
    </Context.Provider>
  );
};

export default Demo;
