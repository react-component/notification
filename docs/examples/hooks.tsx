/* eslint-disable no-console */
import React from 'react';
import '../../assets/index.less';
import { useNotification } from '../../src';
import motion from './motion';

export default () => {
  const [notice, contextHolder] = useNotification({ motion });

  return (
    <>
      <div>
        <button
          onClick={() => {
            notice.open({
              content: 'Notification content',
              // duration: 2,
            });
          }}
        >
          Show
        </button>
      </div>
      {contextHolder}
    </>
  );
};
