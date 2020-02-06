import * as React from 'react';
import Notification, { NoticeFunc, NoticeContent } from './Notification';
import Notice from './Notice';

export default function useNotification(
  notificationInstance: Notification,
): [NoticeFunc, React.ReactElement] {
  const createdRef = React.useRef<Record<React.Key, React.ReactElement>>({});
  const [elements, setElements] = React.useState<React.ReactElement[]>([]);

  function notify(noticeProps: NoticeContent) {
    notificationInstance.add(noticeProps, (div, props) => {
      const { key } = props;

      if (div && !createdRef.current[key]) {
        const noticeEle = <Notice {...props} holder={div} />;
        createdRef.current[key] = noticeEle;
        setElements(originElements => [...originElements, noticeEle]);
      }
    });
  }

  return [notify, <>{elements}</>];
}
