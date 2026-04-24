import React from 'react';
import type { CSSMotionProps } from '@rc-component/motion';
import '../../assets/index.less';
import NotificationList, { type NotificationListConfig } from '../../src/NotificationList';

const motion: CSSMotionProps = {
  motionName: 'rc-notification-fade',
  motionAppear: true,
  motionEnter: true,
  motionLeave: true,
};

const Demo = () => {
  const [configList, setConfigList] = React.useState<NotificationListConfig[]>([]);
  const [stack, setStack] = React.useState(false);
  const keyRef = React.useRef(0);
  const createNotification = React.useCallback(
    (key: number): NotificationListConfig => ({
      key,
      duration: false,
      description: `Config ${key + 1}`,
    }),
    [],
  );

  const createConfig = React.useCallback(() => {
    const key = keyRef.current;
    keyRef.current += 1;

    setConfigList((prevConfigList) => [...prevConfigList, createNotification(key)]);
  }, [createNotification]);

  const createFiveConfigs = React.useCallback(() => {
    setConfigList((prevConfigList) => {
      const startKey = keyRef.current;
      keyRef.current += 5;

      return [
        ...prevConfigList,
        ...Array.from({ length: 5 }, (_, index) => createNotification(startKey + index)),
      ];
    });
  }, [createNotification]);

  const removeLastConfig = React.useCallback(() => {
    setConfigList((prevConfigList) => prevConfigList.slice(0, -1));
  }, []);

  const removeFirstConfig = React.useCallback(() => {
    setConfigList((prevConfigList) => prevConfigList.slice(1));
  }, []);

  const removeMiddleConfig = React.useCallback(() => {
    setConfigList((prevConfigList) => {
      if (!prevConfigList.length) {
        return prevConfigList;
      }

      const middleIndex = Math.floor(prevConfigList.length / 2);

      return prevConfigList.filter((_, index) => index !== middleIndex);
    });
  }, []);

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <button type="button" onClick={createConfig}>
          Add Config
        </button>
        <button type="button" onClick={createFiveConfigs}>
          Add 5 Config
        </button>
        <button type="button" onClick={removeLastConfig}>
          Remove Last Config
        </button>
        <button type="button" onClick={removeFirstConfig}>
          Remove First Config
        </button>
        <button type="button" onClick={removeMiddleConfig}>
          Remove Middle Config
        </button>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={stack}
            onChange={(event) => {
              setStack(event.target.checked);
            }}
          />
          Enable Stack
        </label>
      </div>

      <NotificationList
        configList={configList}
        motion={motion}
        placement="topRight"
        stack={stack ? { threshold: 3, offset: 20 } : undefined}
      />
    </>
  );
};

export default Demo;
