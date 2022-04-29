import * as React from 'react';
import { createPortal } from 'react-dom';
import { CSSMotionList } from 'rc-motion';
import type { CSSMotionProps } from 'rc-motion';
import classNames from 'classnames';
import Notice from './Notice';

export interface OpenConfig {
  key: React.Key;
  placement?: Placement;
  content?: React.ReactNode;
  duration?: number | null;
  closeIcon?: React.ReactNode;
  closable?: boolean;
}

export interface NotificationsProps {
  prefixCls?: string;
  motion?: CSSMotionProps;
  container?: HTMLElement;
}

type Placement = 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight';

type Placements = Partial<Record<Placement, OpenConfig[]>>;

export interface NotificationsRef {
  open: (config: OpenConfig) => void;
}

// ant-notification ant-notification-topRight
const Notifications = React.forwardRef<NotificationsRef, NotificationsProps>((props, ref) => {
  const { prefixCls = 'rc-notification', container, motion } = props;
  const [configList, setConfigList] = React.useState<OpenConfig[]>([]);

  // ========================= Refs =========================
  React.useImperativeHandle(ref, () => ({
    open: (config) => {
      setConfigList([...configList, config]);
    },
  }));

  // ======================== Events ========================
  const onNoticeClose = (key: React.Key) => {
    setConfigList((list) => list.filter((item) => item.key !== key));
  };

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

        return (
          <CSSMotionList
            key={placement}
            className={classNames(prefixCls, `${prefixCls}-topRight`)}
            keys={keys}
            motionAppear
            {...motion}
          >
            {({ config, className, style }, nodeRef) => {
              const { key } = config as OpenConfig;

              return (
                <Notice
                  {...config}
                  ref={nodeRef}
                  prefixCls={prefixCls}
                  className={className}
                  style={style}
                  key={key}
                  eventKey={key}
                  onClose={onNoticeClose}
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
