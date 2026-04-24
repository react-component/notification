import * as React from 'react';
import type { ReactElement } from 'react';
import { createPortal } from 'react-dom';
import type { CSSMotionProps } from '@rc-component/motion';
import { useEvent } from '@rc-component/util';
import NotificationList, {
  type NotificationClassNames,
  type NotificationListConfig,
  type NotificationStyles,
  type Placement,
  type StackConfig,
} from './NotificationList';
import type { ComponentsType } from './Notification';

export interface NotificationsProps {
  // Style
  prefixCls?: string;
  classNames?: NotificationClassNames;
  styles?: NotificationStyles;
  components?: ComponentsType;
  className?: (placement: Placement) => string;
  style?: (placement: Placement) => React.CSSProperties;

  // UI
  container?: HTMLElement | ShadowRoot;
  motion?: CSSMotionProps | ((placement: Placement) => CSSMotionProps);

  // Behavior
  maxCount?: number;
  pauseOnHover?: boolean;
  stack?: boolean | StackConfig;

  // Function
  onAllRemoved?: VoidFunction;
  renderNotifications?: (
    node: ReactElement,
    info: { prefixCls: string; key: React.Key },
  ) => ReactElement;
}

export interface NotificationsRef {
  open: (config: NotificationListConfig) => void;
  close: (key: React.Key) => void;
  destroy: () => void;
}

// ========================= Types ==========================
type Placements = Partial<Record<Placement, NotificationListConfig[]>>;

const Notifications = React.forwardRef<NotificationsRef, NotificationsProps>((props, ref) => {
  // ========================= Props ==========================
  const {
    prefixCls = 'rc-notification',
    container,
    motion,
    maxCount,
    pauseOnHover,
    classNames,
    styles,
    components,
    className,
    style,
    onAllRemoved,
    stack,
    renderNotifications,
  } = props;

  // ========================= State ==========================
  const [configList, setConfigList] = React.useState<NotificationListConfig[]>([]);
  const [placements, setPlacements] = React.useState<Placements>({});
  const emptyRef = React.useRef(false);

  // ========================== Ref ===========================
  React.useImperativeHandle(ref, () => ({
    open: (config) => {
      setConfigList((list) => {
        let clone = [...list];

        const index = clone.findIndex((item) => item.key === config.key);
        const innerConfig: NotificationListConfig = { ...config };

        if (index >= 0) {
          innerConfig.times = (list[index]?.times ?? 0) + 1;
          clone[index] = innerConfig;
        } else {
          innerConfig.times = 0;
          clone.push(innerConfig);
        }

        if (maxCount && maxCount > 0 && clone.length > maxCount) {
          clone = clone.slice(-maxCount);
        }

        return clone;
      });
    },
    close: (key) => {
      setConfigList((list) => list.filter((item) => item.key !== key));
    },
    destroy: () => {
      setConfigList([]);
    },
  }));

  // ======================== Effect =========================
  React.useEffect(() => {
    const nextPlacements: Placements = {};

    configList.forEach((config) => {
      const placement = config.placement ?? 'topRight';
      nextPlacements[placement] = nextPlacements[placement] || [];
      nextPlacements[placement].push(config);
    });

    Object.keys(placements).forEach((placement) => {
      nextPlacements[placement as Placement] = nextPlacements[placement as Placement] || [];
    });

    setPlacements(nextPlacements);
  }, [configList]);

  // ======================== Callback =======================
  const onAllNoticeRemoved = useEvent((placement: Placement) => {
    setPlacements((originPlacements) => {
      const clone = {
        ...originPlacements,
      };

      if (!(clone[placement] || []).length) {
        delete clone[placement];
      }

      return clone;
    });
  });

  // ======================== Effect =========================
  React.useEffect(() => {
    if (Object.keys(placements).length > 0) {
      emptyRef.current = true;
    } else if (emptyRef.current) {
      onAllRemoved?.();
      emptyRef.current = false;
    }
  }, [placements, onAllRemoved]);

  // ======================== Render =========================
  if (!container) {
    return null;
  }

  const placementList = Object.keys(placements) as Placement[];

  return createPortal(
    <>
      {placementList.map((placement) => {
        const list = (
          <NotificationList
            key={placement}
            configList={placements[placement]}
            placement={placement}
            prefixCls={prefixCls}
            pauseOnHover={pauseOnHover}
            classNames={classNames}
            styles={styles}
            components={components}
            className={className?.(placement)}
            style={style?.(placement)}
            motion={motion}
            stack={stack}
            onNoticeClose={(key) => {
              setConfigList((oriList) => oriList.filter((item) => item.key !== key));
            }}
            onAllRemoved={onAllNoticeRemoved}
          />
        );

        return renderNotifications
          ? React.cloneElement(renderNotifications(list, { prefixCls, key: placement }), {
              key: placement,
            })
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
