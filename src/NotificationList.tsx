import { CSSMotionList } from '@rc-component/motion';
import type { CSSMotionProps } from '@rc-component/motion';
import { clsx } from 'clsx';
import * as React from 'react';
import type { StackConfig } from './interface';
import { NotificationContext } from './legacy/NotificationProvider';
import useStack from './legacy/hooks/useStack';
import Notification, {
  type NotificationClassNames,
  type NotificationProps,
  type NotificationStyles,
} from './Notification';
import useListPosition from './hooks/useListPosition';
import useListScroll from './hooks/useListScroll';

export type Placement = 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight';
export type { StackConfig } from './interface';

export interface NotificationListConfig extends NotificationProps {
  key: React.Key;
  placement?: Placement;
  times?: number;
}

export interface NotificationListProps {
  configList?: NotificationListConfig[];
  prefixCls?: string;
  placement?: Placement;
  pauseOnHover?: boolean;
  classNames?: NotificationClassNames;
  styles?: NotificationStyles;
  stack?: boolean | StackConfig;
  motion?: CSSMotionProps | ((placement: Placement) => CSSMotionProps);
  className?: string;
  style?: React.CSSProperties;
  onNoticeClose?: (key: React.Key) => void;
  onAllRemoved?: (placement: Placement) => void;
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
    stack: stackConfig,
    motion,
    placement,
    className,
    style,
    onNoticeClose,
    onAllRemoved,
  } = props;
  const { classNames: contextClassNames } = React.useContext(NotificationContext);

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
  const [stackEnabled, { offset, threshold }] = useStack(stackConfig);
  const [listHovering, setListHovering] = React.useState(false);
  const expanded = stackEnabled && (listHovering || keys.length <= threshold);
  const stackPosition = React.useMemo<StackConfig | undefined>(() => {
    if (!stackEnabled || expanded) {
      return undefined;
    }

    return {
      offset,
      threshold,
    };
  }, [expanded, offset, stackEnabled, threshold]);

  const [notificationPosition, setNodeSize] = useListPosition(mergedConfigList, stackPosition);
  const { contentRef, onWheel, scrollOffset, viewportRef } = useListScroll(
    keyList,
    notificationPosition,
  );

  // ========================= Render =========================
  const listPrefixCls = `${prefixCls}-list`;
  const itemPrefixCls = `${listPrefixCls}-item`;
  const noticeWrapperCls = `${prefixCls}-notice-wrapper`;

  return (
    <div
      className={clsx(
        prefixCls,
        `${prefixCls}-${placement}`,
        listPrefixCls,
        `${listPrefixCls}-${placement}`,
        contextClassNames?.list,
        className,
        {
          [`${prefixCls}-stack`]: stackEnabled,
          [`${prefixCls}-stack-expanded`]: expanded,
        },
      )}
      onWheel={onWheel}
      onMouseEnter={() => {
        setListHovering(true);
      }}
      onMouseLeave={() => {
        setListHovering(false);
      }}
      ref={viewportRef}
      style={style}
    >
      <div
        className={`${listPrefixCls}-content`}
        style={{
          transform: `translate3d(0, ${scrollOffset}px, 0)`,
        }}
        ref={contentRef}
      >
        <CSSMotionList
          component={false}
          keys={keys}
          motionAppear
          {...placementMotion}
          onAllRemoved={() => {
            if (placement) {
              onAllRemoved?.(placement);
            }
          }}
        >
          {({ config, className, style }, nodeRef) => {
            const { key, placement: _placement, ...notificationConfig } = config;
            const strKey = String(key);

            return (
              <div
                key={key}
                className={clsx(
                  noticeWrapperCls,
                  itemPrefixCls,
                  className,
                  classNames?.wrapper,
                  config.classNames?.wrapper,
                )}
                ref={(node) => {
                  assignRef(nodeRef, node);
                  setNodeSize(strKey, node);
                }}
                style={{
                  ...style,
                  ...styles?.wrapper,
                  ...config.styles?.wrapper,
                }}
              >
                <Notification
                  key={config.times}
                  {...notificationConfig}
                  prefixCls={prefixCls}
                  offset={notificationPosition.get(strKey)}
                  className={clsx(contextClassNames?.notice, config.className)}
                  style={config.style}
                  classNames={{
                    root: clsx(classNames?.root, config.classNames?.root),
                    content: clsx(classNames?.content, config.classNames?.content),
                    close: clsx(classNames?.close, config.classNames?.close),
                    progress: clsx(classNames?.progress, config.classNames?.progress),
                  }}
                  styles={{
                    root: {
                      ...styles?.root,
                      ...config.styles?.root,
                    },
                    content: {
                      ...styles?.content,
                      ...config.styles?.content,
                    },
                    close: {
                      ...styles?.close,
                      ...config.styles?.close,
                    },
                    progress: {
                      ...styles?.progress,
                      ...config.styles?.progress,
                    },
                  }}
                  hovering={stackEnabled && listHovering}
                  pauseOnHover={config.pauseOnHover ?? pauseOnHover}
                  onCloseInternal={() => {
                    onNoticeClose?.(key);
                  }}
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
export type { NotificationClassNames, NotificationStyles } from './Notification';
