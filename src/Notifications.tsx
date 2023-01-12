import * as React from 'react';
import { createPortal } from 'react-dom';
import { CSSMotionList } from 'rc-motion';
import type { CSSMotionProps } from 'rc-motion';
import classNames from 'classnames';
import Notice from './Notice';
import type { NoticeConfig } from './Notice';

export interface OpenConfig extends NoticeConfig {
  key: React.Key;
  placement?: Placement;
  content?: React.ReactNode;
  duration?: number | null;
}

export interface NotificationsProps {
  prefixCls?: string;
  motion?: CSSMotionProps | ((placement: Placement) => CSSMotionProps);
  container?: HTMLElement;
  maxCount?: number;
  className?: (placement: Placement) => string;
  style?: (placement: Placement) => React.CSSProperties;
  onAllRemoved?: VoidFunction;
}

export type Placement = 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight';

type Placements = Partial<Record<Placement, OpenConfig[]>>;

type InnerOpenConfig = OpenConfig & { times?: number };

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
        const keys = placementConfigList.map((config) => ({
          config,
          key: config.key,
        }));

        const placementMotion = typeof motion === 'function' ? motion(placement) : motion;

        return (
          <CSSMotionList
            key={placement}
            className={classNames(prefixCls, `${prefixCls}-${placement}`, className?.(placement))}
            style={style?.(placement)}
            keys={keys}
            motionAppear
            {...placementMotion}
            onAllRemoved={() => {
              onAllNoticeRemoved(placement);
            }}
          >
            {({ config, className: motionClassName, style: motionStyle }, nodeRef) => {
              const { key, times } = config as InnerOpenConfig;
              const { className: configClassName, style: configStyle } = config as NoticeConfig;

              return (
                <Notice
                  {...config}
                  ref={nodeRef}
                  prefixCls={prefixCls}
                  className={classNames(motionClassName, configClassName)}
                  style={{
                    ...motionStyle,
                    ...configStyle,
                  }}
                  times={times}
                  key={key}
                  eventKey={key}
                  onNoticeClose={onNoticeClose}
                />
              );
            }}
          </CSSMotionList>
        );
      })}
    </>,
    container,
  );
});

if (process.env.NODE_ENV !== 'production') {
  Notifications.displayName = 'Notifications';
}

export default Notifications;
