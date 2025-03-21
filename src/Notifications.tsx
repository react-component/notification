import * as React from 'react';
import type { ReactElement } from 'react';
import { createPortal } from 'react-dom';
import type { CSSMotionProps } from '@rc-component/motion';
import type { InnerOpenConfig, OpenConfig, Placement, Placements, StackConfig } from './interface';
import NoticeList from './NoticeList';

export interface NotificationsProps {
  prefixCls?: string;
  motion?: CSSMotionProps | ((placement: Placement) => CSSMotionProps);
  container?: HTMLElement | ShadowRoot;
  maxCount?: number;
  className?: (placement: Placement) => string;
  style?: (placement: Placement) => React.CSSProperties;
  onAllRemoved?: VoidFunction;
  stack?: StackConfig;
  renderNotifications?: (
    node: ReactElement,
    info: { prefixCls: string; key: React.Key },
  ) => ReactElement;
}

export interface NotificationsRef {
  open: (config: OpenConfig) => void;
  close: (key: React.Key) => void;
  destroy: () => void;
}

// ant-notification ant-notification-topRight
const Notifications = React.forwardRef<NotificationsRef, NotificationsProps>((props, ref) => {
  const {
    prefixCls = 'rc-notification',
    container,
    motion,
    maxCount,
    className,
    style,
    onAllRemoved,
    stack,
    renderNotifications,
  } = props;
  const [configList, setConfigList] = React.useState<OpenConfig[]>([]);

  // ======================== Close =========================
  const onNoticeClose = (key: React.Key) => {
    // Trigger close event
    const config = configList.find((item) => item.key === key);
    config?.onClose?.();

    setConfigList((list) => list.filter((item) => item.key !== key));
  };

  // ========================= Refs =========================
  React.useImperativeHandle(ref, () => ({
    open: (config) => {
      setConfigList((list) => {
        let clone = [...list];

        // Replace if exist
        const index = clone.findIndex((item) => item.key === config.key);
        const innerConfig: InnerOpenConfig = { ...config };
        if (index >= 0) {
          innerConfig.times = ((list[index] as InnerOpenConfig)?.times || 0) + 1;
          clone[index] = innerConfig;
        } else {
          innerConfig.times = 0;
          clone.push(innerConfig);
        }

        if (maxCount > 0 && clone.length > maxCount) {
          clone = clone.slice(-maxCount);
        }

        return clone;
      });
    },
    close: (key) => {
      onNoticeClose(key);
    },
    destroy: () => {
      setConfigList([]);
    },
  }));

  // ====================== Placements ======================
  const [placements, setPlacements] = React.useState<Placements>({});

  React.useEffect(() => {
    const nextPlacements: Placements = {};

    configList.forEach((config) => {
      const { placement = 'topRight' } = config;

      if (placement) {
        nextPlacements[placement] = nextPlacements[placement] || [];
        nextPlacements[placement].push(config);
      }
    });

    // Fill exist placements to avoid empty list causing remove without motion
    Object.keys(placements).forEach((placement) => {
      nextPlacements[placement] = nextPlacements[placement] || [];
    });

    setPlacements(nextPlacements);
  }, [configList]);

  // Clean up container if all notices fade out
  const onAllNoticeRemoved = (placement: Placement) => {
    setPlacements((originPlacements) => {
      const clone = {
        ...originPlacements,
      };
      const list = clone[placement] || [];

      if (!list.length) {
        delete clone[placement];
      }

      return clone;
    });
  };

  // Effect tell that placements is empty now
  const emptyRef = React.useRef(false);
  React.useEffect(() => {
    if (Object.keys(placements).length > 0) {
      emptyRef.current = true;
    } else if (emptyRef.current) {
      // Trigger only when from exist to empty
      onAllRemoved?.();
      emptyRef.current = false;
    }
  }, [placements]);
  // ======================== Render ========================
  if (!container) {
    return null;
  }

  const placementList = Object.keys(placements) as Placement[];

  return createPortal(
    <>
      {placementList.map((placement) => {
        const placementConfigList = placements[placement];

        const list = (
          <NoticeList
            key={placement}
            configList={placementConfigList}
            placement={placement}
            prefixCls={prefixCls}
            className={className?.(placement)}
            style={style?.(placement)}
            motion={motion}
            onNoticeClose={onNoticeClose}
            onAllNoticeRemoved={onAllNoticeRemoved}
            stack={stack}
          />
        );

        return renderNotifications
          ? renderNotifications(list, { prefixCls, key: placement })
          : list;
      })}
    </>,
    container,
  );
});

if (process.env.NODE_ENV !== 'production') {
  Notifications.displayName = 'Notifications';
}

export default Notifications;
