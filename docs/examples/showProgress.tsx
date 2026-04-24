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

export default () => {
  const [notice, contextHolder] = useNotification({
    motion,
    showProgress: true,
  });

  return (
    <>
      <button
        onClick={() => {
          notice.open({
            description: `${new Date().toISOString()}`,
          });
        }}
      >
        Show With Progress
      </button>
      <button
        onClick={() => {
          notice.open({
            description: `${new Date().toISOString()}`,
            pauseOnHover: false,
          });
        }}
      >
        Not Pause On Hover
      </button>
      {contextHolder}
    </>
  );
};
