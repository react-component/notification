import { CSSMotionList } from '@rc-component/motion';
import type { CSSMotionProps } from '@rc-component/motion';
import { clsx } from 'clsx';
import * as React from 'react';
import Notification, {
  type NotificationClassNames,
  type NotificationProps,
  type NotificationStyles,
} from './Notification';
import useListPosition from './hooks/useListPosition';
import useListScroll from './hooks/useListScroll';

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
  motion?: CSSMotionProps | ((placement: Placement) => CSSMotionProps);
}

function assignRef<T>(ref: React.Ref<T>, value: T | null) {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref) {
    (ref as React.MutableRefObject<T | null>).current = value;
  }
}

const NotificationList: React.FC<NotificationListProps> = (props) => {
  const {
    configList = [],
    prefixCls = 'rc-notification',
    pauseOnHover,
    classNames,
    styles,
    motion,
    placement,
  } = props;

  // ========================== Data ==========================
  const mergedConfigList = React.useMemo(() => configList.slice().reverse(), [configList]);

  const keys = React.useMemo(
    () =>
      mergedConfigList.map((config) => ({
        config,
        key: String(config.key),
      })),
    [mergedConfigList],
  );
  const keyList = React.useMemo(() => keys.map(({ key }) => key), [keys]);

  // ========================= Motion =========================
  const placementMotion = typeof motion === 'function' ? motion(placement) : motion;

  const [notificationPosition, setNodeSize] = useListPosition(mergedConfigList);
  const { contentRef, onWheel, scrollOffset, viewportRef } = useListScroll(
    keyList,
    notificationPosition,
  );

  // ========================= Render =========================
  const listPrefixCls = `${prefixCls}-list`;
  const itemPrefixCls = `${listPrefixCls}-item`;

  return (
    <div
      className={clsx(listPrefixCls, `${listPrefixCls}-${placement}`)}
      onWheel={onWheel}
      ref={viewportRef}
    >
      <div
        className={`${listPrefixCls}-content`}
        style={{
          transform: `translate3d(0, ${scrollOffset}px, 0)`,
        }}
        ref={contentRef}
      >
        <CSSMotionList component={false} keys={keys} motionAppear {...placementMotion}>
          {({ config, className, style }, nodeRef) => {
            const { key, ...notificationConfig } = config;
            const strKey = String(key);

            return (
              <div
                key={key}
                className={clsx(itemPrefixCls, className)}
                ref={(node) => {
                  assignRef(nodeRef, node);
                  setNodeSize(strKey, node);
                }}
                style={style}
              >
                <Notification
                  {...notificationConfig}
                  offset={notificationPosition.get(strKey)}
                  className={config.className}
                  style={config.style}
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
              </div>
            );
          }}
        </CSSMotionList>
      </div>
    </div>
  );
};

export default NotificationList;
