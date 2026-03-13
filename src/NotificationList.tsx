import { CSSMotionList } from '@rc-component/motion';
import type { CSSMotionProps } from '@rc-component/motion';
import { clsx } from 'clsx';
import * as React from 'react';
import Notification, {
  type NotificationClassNames,
  type NotificationProps,
  type NotificationStyles,
} from './Notification';

export type Placement = 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight';

export type StackConfig =
  | boolean
  | {
      threshold?: number;
      offset?: number;
      gap?: number;
    };

export interface NotificationListConfig extends NotificationProps {
  key: React.Key;
}

export interface NotificationListProps {
  configList?: NotificationListConfig[];
  prefixCls?: string;
  getContainer?: () => HTMLElement | ShadowRoot;
  placement?: Placement;
  pauseOnHover?: boolean;
  classNames?: NotificationClassNames;
  styles?: NotificationStyles;
  stack?: StackConfig;
  maxCount?: number;
  motion?: CSSMotionProps | ((placement: Placement) => CSSMotionProps);
}

const NotificationList: React.FC<NotificationListProps> = (props) => {
  const {
    configList = [],
    prefixCls = 'rc-notification',
    pauseOnHover,
    classNames,
    styles,
    maxCount,
    motion,
    placement,
  } = props;

  // ========================== Data ==========================
  const mergedConfigList =
    typeof maxCount === 'number' && maxCount > 0 ? configList.slice(-maxCount) : configList;

  const keys = mergedConfigList.map((config) => ({
    config,
    key: String(config.key),
  }));

  // ========================= Motion =========================
  const placementMotion = typeof motion === 'function' ? motion(placement) : motion;

  // ========================= Render =========================
  const listPrefixCls = `${prefixCls}-list`;

  return (
    <CSSMotionList
      component="div"
      keys={keys}
      motionAppear
      className={clsx(listPrefixCls, `${listPrefixCls}-${placement}`)}
      {...placementMotion}
    >
      {({ config, className, style }, nodeRef) => (
        <Notification
          {...config}
          ref={nodeRef}
          className={clsx(className, config.className)}
          style={{
            ...style,
            ...config.style,
          }}
          classNames={{
            root: clsx(classNames?.root, config.classNames?.root),
            close: clsx(classNames?.close, config.classNames?.close),
          }}
          styles={{
            root: {
              ...styles?.root,
              ...config.styles?.root,
            },
            close: {
              ...styles?.close,
              ...config.styles?.close,
            },
          }}
          pauseOnHover={config.pauseOnHover ?? pauseOnHover}
        />
      )}
    </CSSMotionList>
  );
};

export default NotificationList;
