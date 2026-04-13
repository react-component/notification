/* eslint-disable no-console */
import React from 'react';
import type { CSSMotionProps } from '@rc-component/motion';
import '../../assets/geek.less';
import { useNotification } from '../../src';

const motion: CSSMotionProps = {
  motionName: 'notification-fade',
  motionAppear: true,
  motionEnter: true,
  motionLeave: true,
};

export default () => {
  const [notice, contextHolder] = useNotification({
    motion,
    maxCount: 3,
    prefixCls: 'notification',
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
        Max Count 3
      </button>
      {contextHolder}
    </>
  );
};
