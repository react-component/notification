import type { CSSMotionProps } from '@rc-component/motion';
import { useEvent } from '@rc-component/util';
import * as React from 'react';
import Notifications, { type NotificationsProps, type NotificationsRef } from '../Notifications';
import type {
  NotificationClassNames,
  NotificationListConfig,
  NotificationStyles,
} from '../NotificationList';
import type { Placement, StackConfig } from '../NotificationList';

const defaultGetContainer = () => document.body;

// ========================= Types ==========================
type OptionalConfig = Partial<NotificationListConfig>;
type SharedConfig = Pick<NotificationListConfig, 'placement' | 'closable' | 'duration'>;

export interface NotificationConfig {
  // Style
  prefixCls?: string;
  className?: (placement: Placement) => string;
  style?: (placement: Placement) => React.CSSProperties;
  classNames?: NotificationClassNames;
  styles?: NotificationStyles;

  // UI
  placement?: Placement;
  getContainer?: () => HTMLElement | ShadowRoot;
  motion?: CSSMotionProps | ((placement: Placement) => CSSMotionProps);

  // Behavior
  closable?: NotificationListConfig['closable'];
  duration?: number | false | null;
  pauseOnHover?: boolean;
  maxCount?: number;
  stack?: StackConfig;

  // Function
  onAllRemoved?: VoidFunction;
  renderNotifications?: NotificationsProps['renderNotifications'];
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
    if (!obj) {
      return;
    }

    Object.keys(obj).forEach((key) => {
      const value = obj[key as keyof T];

      if (value !== undefined) {
        clone[key as keyof T] = value;
      }
    });
  });

  return clone;
}

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
    pauseOnHover,
    classNames,
    styles,
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
    [open],
  );

  // ======================== Effect =========================
  React.useEffect(() => {
    setContainer(getContainer());
  });

  React.useEffect(() => {
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
