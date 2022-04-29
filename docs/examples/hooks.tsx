/* eslint-disable no-console */
import React from 'react';
import '../../assets/index.less';
import { useNotification } from '../../src';

export default () => {
  const [notification, contextHolder] = useNotification();

  return (
    <>
      <button onClick={() => {}}>Show</button>
      {contextHolder}
    </>
  );
};
