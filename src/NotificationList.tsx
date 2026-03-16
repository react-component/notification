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

function clampScrollOffset(offset: number, maxScroll: number) {
  return Math.min(0, Math.max(-maxScroll, offset));
}

function assignRef<T>(ref: React.Ref<T>, value: T | null) {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref) {
    (ref as React.MutableRefObject<T | null>).current = value;
  }
}

function getNoticeStyle(nodePosition?: { x: number; y: number }): React.CSSProperties | undefined {
  if (!nodePosition) {
    return undefined;
  }

  return {
    '--notification-x': `${nodePosition.x}px`,
    '--notification-y': `${nodePosition.y}px`,
  } as React.CSSProperties;
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
  const mergedConfigList = React.useMemo(() => {
    const list =
      typeof maxCount === 'number' && maxCount > 0 ? configList.slice(-maxCount) : configList;

    return list.slice().reverse();
  }, [configList, maxCount]);

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

  // ========================= Scroll =========================
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const prevKeyListRef = React.useRef<string[]>(keyList);
  const prevNotificationPositionRef = React.useRef<Map<string, { x: number; y: number }>>(
    new Map(),
  );
  const scrollOffsetRef = React.useRef(0);
  const [scrollOffset, setScrollOffset] = React.useState(0);
  const [notificationPosition, setNodeSize] = useListPosition(mergedConfigList);

  const syncScrollOffset = React.useCallback((nextOffset: number) => {
    const viewportHeight = viewportRef.current?.clientHeight ?? 0;
    const measuredContentHeight = contentRef.current?.scrollHeight ?? 0;
    const maxScroll = Math.max(measuredContentHeight - viewportHeight, 0);
    const mergedOffset = clampScrollOffset(nextOffset, maxScroll);

    scrollOffsetRef.current = mergedOffset;
    setScrollOffset((prev) => (prev === mergedOffset ? prev : mergedOffset));
  }, []);

  React.useLayoutEffect(() => {
    const prevKeyList = prevKeyListRef.current;
    const prevNotificationPosition = prevNotificationPositionRef.current;

    if (scrollOffsetRef.current < 0) {
      const prependCount = prevKeyList.length
        ? keyList.findIndex((key) => key === prevKeyList[0])
        : -1;
      const removedCount = keyList.length ? prevKeyList.findIndex((key) => key === keyList[0]) : -1;

      if (prependCount > 0) {
        const prependHeight = notificationPosition.get(prevKeyList[0])?.y ?? 0;
        syncScrollOffset(scrollOffsetRef.current - prependHeight);
      } else if (removedCount > 0) {
        const removedHeight = keyList[0] ? (prevNotificationPosition.get(keyList[0])?.y ?? 0) : 0;
        syncScrollOffset(scrollOffsetRef.current + removedHeight);
      } else {
        syncScrollOffset(scrollOffsetRef.current);
      }
    } else {
      syncScrollOffset(scrollOffsetRef.current);
    }

    prevKeyListRef.current = keyList;
    prevNotificationPositionRef.current = new Map(notificationPosition);
  }, [keyList, notificationPosition, syncScrollOffset]);

  React.useLayoutEffect(() => {
    const viewportNode = viewportRef.current;
    const contentNode = contentRef.current;

    if (!viewportNode || !contentNode || typeof ResizeObserver === 'undefined') {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      syncScrollOffset(scrollOffsetRef.current);
    });

    resizeObserver.observe(viewportNode);
    resizeObserver.observe(contentNode);

    return () => {
      resizeObserver.disconnect();
    };
  }, [syncScrollOffset]);

  const onWheel = React.useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      const viewportHeight = viewportRef.current?.clientHeight ?? 0;
      const measuredContentHeight = contentRef.current?.scrollHeight ?? 0;
      const maxScroll = Math.max(measuredContentHeight - viewportHeight, 0);

      if (!maxScroll) {
        return;
      }

      const nextOffset = clampScrollOffset(scrollOffsetRef.current - event.deltaY, maxScroll);

      if (nextOffset !== scrollOffsetRef.current) {
        event.preventDefault();
        syncScrollOffset(nextOffset);
      }
    },
    [syncScrollOffset],
  );

  // ========================= Render =========================
  const listPrefixCls = `${prefixCls}-list`;
  const itemPrefixCls = `${listPrefixCls}-item`;
  const motionPrefixCls = `${itemPrefixCls}-motion`;

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
                className={itemPrefixCls}
                ref={(node) => {
                  setNodeSize(strKey, node);
                }}
                style={{
                  ...getNoticeStyle(notificationPosition.get(strKey)),
                }}
              >
                <div
                  ref={(node) => {
                    assignRef(nodeRef, node);
                  }}
                  className={clsx(motionPrefixCls, className)}
                  style={style}
                >
                  <Notification
                    {...notificationConfig}
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
              </div>
            );
          }}
        </CSSMotionList>
      </div>
    </div>
  );
};

export default NotificationList;
