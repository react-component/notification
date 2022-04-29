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
}

export interface NotificationAPI {
  open: (config: OptionalConfig) => void;
}

interface Task {
  type: 'open';
  config: OpenConfig;
}

export default function useNotification(
  rootConfig: NotificationConfig = {},
): [NotificationAPI, React.ReactElement] {
  const { getContainer = defaultGetContainer, motion, prefixCls } = rootConfig;

  const [container, setContainer] = React.useState<HTMLElement>();
  const notificationsRef = React.useRef<NotificationsRef>();
  const contextHolder = (
    <Notifications
      container={container}
      ref={notificationsRef}
      prefixCls={prefixCls}
      motion={motion}
    />
  );

  const [taskQueue, setTaskQueue] = React.useState<Task[]>([]);

  // ========================= Refs =========================
  const api = React.useMemo<NotificationAPI>(() => {
    return {
      open: (config) => {
        const mergedConfig = {
          ...config,
          key: config.key ?? Date.now(),
        };

        setTaskQueue((queue) => [...queue, { type: 'open', config: mergedConfig }]);
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
        notificationsRef.current.open(task.config);
      });

      setTaskQueue([]);
    }
  }, [taskQueue]);

  // ======================== Return ========================
  return [api, contextHolder];
}
