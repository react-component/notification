import React from 'react';
import type { CSSMotionProps } from '@rc-component/motion';
import '../../assets/geek.less';
import NotificationList, { type NotificationListConfig } from '../../src/NotificationList';

const motion: CSSMotionProps = {
  motionName: 'notification-fade',
  motionAppear: true,
  motionEnter: true,
  motionLeave: true,
  onLeaveStart: (ele) => {
    const { offsetHeight } = ele;
    return { height: offsetHeight };
  },
  onLeaveActive: () => ({ height: 0, opacity: 0, margin: 0 }),
};

const Demo = () => {
  const [configList, setConfigList] = React.useState<NotificationListConfig[]>([]);
  const keyRef = React.useRef(0);

  const createConfig = React.useCallback(() => {
    const key = keyRef.current;
    keyRef.current += 1;

    setConfigList((prevConfigList) => [
      ...prevConfigList,
      {
        key,
        duration: false,
        content: `Config ${key + 1}`,
      },
    ]);
  }, []);

  const removeLastConfig = React.useCallback(() => {
    setConfigList((prevConfigList) => prevConfigList.slice(0, -1));
  }, []);

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <button type="button" onClick={createConfig}>
          Add Config
        </button>
        <button type="button" onClick={removeLastConfig}>
          Remove Last Config
        </button>
      </div>

      <NotificationList
        configList={configList}
        prefixCls="notification"
        classNames={{ root: 'notification-notice' }}
        motion={motion}
        placement="topRight"
      />
    </>
  );
};

export default Demo;
