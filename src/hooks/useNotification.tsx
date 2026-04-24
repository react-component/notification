import { useEvent } from '@rc-component/util';
import * as React from 'react';
import Notifications, { type NotificationsProps, type NotificationsRef } from '../Notifications';
import type { NotificationListConfig } from '../NotificationList';
import type { Placement } from '../NotificationList';

const defaultGetContainer = () => document.body;

// ========================= Types ==========================
type OptionalConfig = Partial<NotificationListConfig>;
type SharedConfig = Pick<
  NotificationListConfig,
  'placement' | 'closable' | 'duration' | 'showProgress'
>;

export interface NotificationConfig extends Omit<NotificationsProps, 'container'> {
  // UI
  placement?: Placement;
  getContainer?: () => HTMLElement | ShadowRoot;

  // Behavior
  closable?: NotificationListConfig['closable'];
  duration?: number | false | null;
  showProgress?: NotificationListConfig['showProgress'];
}

export interface NotificationAPI {
  open: (config: OptionalConfig) => void;
  close: (key: React.Key) => void;
  destroy: () => void;
}

interface OpenTask {
  type: 'open';
  config: NotificationListConfig;
}

interface CloseTask {
  type: 'close';
  key: React.Key;
}

interface DestroyTask {
  type: 'destroy';
}

type Task = OpenTask | CloseTask | DestroyTask;

// ======================== Helper ==========================
let uniqueKey = 0;

function mergeConfig<T>(...objList: Partial<T>[]): T {
  const clone = {} as T;

  objList.forEach((obj) => {
    if (obj) {
      Object.keys(obj).forEach((key) => {
        const value = obj[key as keyof T];

        if (value !== undefined) {
          clone[key as keyof T] = value;
        }
      });
    }
  });

  return clone;
}

/**
 * Creates the notification API and the React holder element.
 * Queueing is handled internally until the notification instance is ready.
 */
export default function useNotification(
  rootConfig: NotificationConfig = {},
): [NotificationAPI, React.ReactElement] {
  // ========================= Config =========================
  const {
    getContainer = defaultGetContainer,
    motion,
    prefixCls,
    placement,
    closable,
    duration,
    showProgress,
    pauseOnHover,
    classNames,
    styles,
    components,
    maxCount,
    className,
    style,
    onAllRemoved,
    stack,
    renderNotifications,
  } = rootConfig;
  const shareConfig: SharedConfig = {
    placement,
    closable,
    duration,
    showProgress,
  };

  // ========================= Holder =========================
  const [container, setContainer] = React.useState<HTMLElement | ShadowRoot>();
  const notificationsRef = React.useRef<NotificationsRef | null>(null);
  const [taskQueue, setTaskQueue] = React.useState<Task[]>([]);

  const contextHolder = (
    <Notifications
      container={container}
      ref={notificationsRef}
      prefixCls={prefixCls}
      motion={motion}
      maxCount={maxCount}
      pauseOnHover={pauseOnHover}
      classNames={classNames}
      styles={styles}
      components={components}
      className={className}
      style={style}
      onAllRemoved={onAllRemoved}
      stack={stack}
      renderNotifications={renderNotifications}
    />
  );

  // ========================== API ==========================
  const open = useEvent<NotificationAPI['open']>((config) => {
    const mergedConfig = mergeConfig<NotificationListConfig>(shareConfig, config);

    if (mergedConfig.key === null || mergedConfig.key === undefined) {
      mergedConfig.key = `rc-notification-${uniqueKey}`;
      uniqueKey += 1;
    }

    setTaskQueue((queue) => [...queue, { type: 'open', config: mergedConfig }]);
  });

  const api = React.useMemo<NotificationAPI>(
    () => ({
      open,
      close: (key) => {
        setTaskQueue((queue) => [...queue, { type: 'close', key }]);
      },
      destroy: () => {
        setTaskQueue((queue) => [...queue, { type: 'destroy' }]);
      },
    }),
    [],
  );

  // ======================== Effect =========================
  // React 18 should all in effect that we will check container in each render
  // Which means getContainer should be stable.
  React.useEffect(() => {
    setContainer(getContainer());
  });

  React.useEffect(() => {
    // Flush task when node ready
    if (notificationsRef.current && taskQueue.length) {
      taskQueue.forEach((task) => {
        switch (task.type) {
          case 'open':
            notificationsRef.current?.open(task.config);
            break;
          case 'close':
            notificationsRef.current?.close(task.key);
            break;
          case 'destroy':
            notificationsRef.current?.destroy();
            break;
        }
      });

      setTaskQueue((originQueue) => {
        const targetTaskQueue = originQueue.filter((task) => !taskQueue.includes(task));

        return targetTaskQueue.length === originQueue.length ? originQueue : targetTaskQueue;
      });
    }
  }, [taskQueue]);

  // ======================== Return =========================
  return [api, contextHolder];
}
