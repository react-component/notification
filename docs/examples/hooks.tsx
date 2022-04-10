/* eslint-disable no-console */
import React from 'react';
import Notification from 'rc-notification';
import '../../assets/index.less';
import type { NotificationInstance } from 'rc-notification/Notification';

let notificationInstance: NotificationInstance = null;
Notification.newInstance({}, (n) => {
  notificationInstance = n;
  console.log('###:hooks.tsx回调结束, 更新instance:', n);
});

const Context = React.createContext({ name: 'light' });

const NOTICE = {
  content: <span>simple show</span>,
  onClose() {
    console.log('simple close');
  },
  // duration: null,
};

const Demo = () => {
  const [notice, holder] = notificationInstance?.useNotification() ?? [];
  console.log('$$$:Demo 组件开始渲染, 此时的instance:', notificationInstance);

  return (
    <Context.Provider value={{ name: 'bamboo' }}>
      <button
        type="button"
        onClick={() => {
          notificationInstance.notice({ ...NOTICE });
          notice({
            ...NOTICE,
            content: <Context.Consumer>{({ name }) => `Hi ${name}!`}</Context.Consumer>,
            props: {
              'data-testid': 'my-data-testid',
            },
          });
          notificationInstance.notice({ ...NOTICE });
        }}
      >
        simple show
      </button>
      {holder}
    </Context.Provider>
  );
};

export default Demo;
