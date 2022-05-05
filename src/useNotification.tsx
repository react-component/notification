import * as React from 'react';
import Notifications from './Notifications';
import type { NotificationsRef, OpenConfig } from './Notifications';
import type { CSSMotionProps } from 'rc-motion';

const defaultGetContainer = () => document.body;

type OptionalConfig = Partial<OpenConfig>;

export interface NotificationConfig {
  prefixCls?: string;
  /** Customize container. It will repeat call which means you should return same container element. */
  getContainer?: () => HTMLElement;
  motion?: CSSMotionProps;
  closeIcon?: React.ReactNode;
  closable?: boolean;
  maxCount?: number;
  duration?: number;
  top?: number;
  bottom?: number;
}

export interface NotificationAPI {
  open: (config: OptionalConfig) => void;
  close: (key: React.Key) => void;
  destroy: () => void;
}

interface OpenTask {
  type: 'open';
  config: OpenConfig;
}

interface CloseTask {
  type: 'close';
  key: React.Key;
}

interface DestroyTask {
  type: 'destroy';
}

type Task = OpenTask | CloseTask | DestroyTask;

export default function useNotification(
  rootConfig: NotificationConfig = {},
): [NotificationAPI, React.ReactElement] {
  const {
    getContainer = defaultGetContainer,
    motion,
    prefixCls,
    maxCount,
    top,
    bottom,
    ...shareConfig
  } = rootConfig;

  const [container, setContainer] = React.useState<HTMLElement>();
  const notificationsRef = React.useRef<NotificationsRef>();
  const contextHolder = (
    <Notifications
      container={container}
      ref={notificationsRef}
      prefixCls={prefixCls}
      motion={motion}
      maxCount={maxCount}
      top={top}
      bottom={bottom}
    />
  );

  const [taskQueue, setTaskQueue] = React.useState<Task[]>([]);

  // ========================= Refs =========================
  const api = React.useMemo<NotificationAPI>(() => {
    return {
      open: (config) => {
        const mergedConfig = {
          ...shareConfig,
          ...config,
          key: config.key ?? Date.now(),
        };

        setTaskQueue((queue) => [...queue, { type: 'open', config: mergedConfig }]);
      },
      close: (key) => {
        setTaskQueue((queue) => [...queue, { type: 'close', key }]);
      },
      destroy: () => {
        setTaskQueue((queue) => [...queue, { type: 'destroy' }]);
      },
    };
  }, []);

  // ======================= Container ======================
  // React 18 should all in effect that we will check container in each render
  // Which means getContainer should be stable.
  React.useEffect(() => {
    setContainer(getContainer());
  });

  // ======================== Effect ========================
  React.useEffect(() => {
    // Flush task when node ready
    if (notificationsRef.current && taskQueue.length) {
      taskQueue.forEach((task) => {
        switch (task.type) {
          case 'open':
            notificationsRef.current.open(task.config);
            break;

          case 'close':
            notificationsRef.current.close(task.key);
            break;

          case 'destroy':
            notificationsRef.current.destroy();
            break;
        }
      });

      setTaskQueue([]);
    }
  }, [taskQueue]);

  // ======================== Return ========================
  return [api, contextHolder];
}
