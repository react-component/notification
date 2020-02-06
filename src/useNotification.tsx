import * as React from 'react';
import Notification, { NoticeFunc, NoticeContent } from './Notification';
import Notice from './Notice';

export default function useNotification(
  notificationInstance: Notification,
): [NoticeFunc, React.ReactElement] {
  const createdRef = React.useRef<Record<React.Key, boolean>>({});
  const [elements, setElements] = React.useState<React.ReactElement[]>([]);
  const holder = <>{elements}</>;

  function notify(noticeProps: NoticeContent) {
    notificationInstance.add(noticeProps, (div, props) => {
      const { key } = props;

      if (div && !createdRef.current[key]) {
        createdRef.current[key] = true;
        setElements(originElements => [...originElements, <Notice {...props} holder={div} />]);
      }
    });
  }

  return [notify, holder];
}
