/* eslint-disable no-console */
import React from 'react';
import Notification from '../src';
import '../assets/index.less';
import { NotificationInstance } from '../src/Notification';

let notificationInstance: NotificationInstance = null;
Notification.newInstance({}, n => {
  notificationInstance = n;
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
  const [notice, holder] = notificationInstance.useNotification();

  return (
    <Context.Provider value={{ name: 'bamboo' }}>
      <button
        type="button"
        onClick={() => {
          notificationInstance.notice({ ...NOTICE });
          notice({
            ...NOTICE,
            content: 'I am Hook!',
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
