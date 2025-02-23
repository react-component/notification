/* eslint-disable no-console */
import React from 'react';
import '../../assets/index.less';
import { useNotification } from '../../src';
import motion from './motion';

export default () => {
  const [notice, contextHolder] = useNotification({ motion, showProgress: true });

  return (
    <>
      <button
        onClick={() => {
          notice.open({
            content: `${new Date().toISOString()}`,
          });
        }}
      >
        Show With Progress
      </button>
      <button
        onClick={() => {
          notice.open({
            content: `${new Date().toISOString()}`,
            pauseOnHover: false,
          });
        }}
      >
        Not Pause On Hover
      </button>
      <button
        onClick={() => {
          notice.open({
            content: `${new Date().toISOString()}`,
            progressBarColor: 'yellow',
          });
        }}
      >
        Show Progress Bar with custom color
      </button>
      {contextHolder}
    </>
  );
};
