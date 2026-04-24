/* eslint-disable no-console */
import React from 'react';
import type { CSSMotionProps } from '@rc-component/motion';
import '../../assets/index.less';
import { useNotification } from '../../src';

const motion: CSSMotionProps = {
  motionName: 'rc-notification-fade',
  motionAppear: true,
  motionEnter: true,
  motionLeave: true,
};

const Context = React.createContext({ name: 'light' });

const NOTICE = {
  description: <span>simple show</span>,
  onClose() {
    console.log('simple close');
  },
  // duration: null,
};

const Demo = () => {
  const [{ open }, holder] = useNotification({
    motion,
  });

  return (
    <Context.Provider value={{ name: 'bamboo' }}>
      <button
        type="button"
        onClick={() => {
          open({
            ...NOTICE,
            description: <Context.Consumer>{({ name }) => `Hi ${name}!`}</Context.Consumer>,
            props: {
              'data-testid': 'my-data-testid',
            },
          });
        }}
      >
        simple show
      </button>
      {holder}
    </Context.Provider>
  );
};

export default Demo;
