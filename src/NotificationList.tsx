import { CSSMotionList } from '@rc-component/motion';
import type { CSSMotionProps } from '@rc-component/motion';
import { clsx } from 'clsx';
import * as React from 'react';
import type { StackConfig } from './interface';
import { NotificationContext } from './legacy/NotificationProvider';
import Notification, {
  type ComponentsType,
  type NotificationClassNames,
  type NotificationProps,
  type NotificationStyles,
} from './Notification';
import useListPosition from './hooks/useListPosition';
import useListScroll from './hooks/useListScroll';
import useStack from './hooks/useStack';
import { composeRef } from '@rc-component/util/lib/ref';

export type Placement = 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight';
export type { StackConfig } from './interface';

export interface NotificationListConfig extends Omit<NotificationProps, 'prefixCls'> {
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
  components?: ComponentsType;
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
    components,
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
  const keys = React.useMemo(
    () =>
      configList.map((config) => ({
        config,
        key: String(config.key),
      })),
    [configList],
  );
  const keyList = React.useMemo(
    () => configList.map((config) => String(config.key)).reverse(),
    [configList],
  );

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

  const [gap, setGap] = React.useState(0);
  const [notificationPosition, setNodeSize] = useListPosition(configList, stackPosition, gap);
  const { contentRef, onWheel, scrollOffset, viewportRef } = useListScroll(
    keyList,
    notificationPosition,
  );

  React.useEffect(() => {
    const listNode = contentRef.current;

    if (!listNode) {
      return;
    }

    const { gap: cssGap, rowGap } = window.getComputedStyle(listNode);
    const nextGap = parseFloat(rowGap || cssGap) || 0;

    setGap((prevGap) => (prevGap === nextGap ? prevGap : nextGap));
  }, [!!configList.length]);

  // ========================= Render =========================
  const listPrefixCls = `${prefixCls}-list`;
  const itemPrefixCls = `${listPrefixCls}-item`;
  const noticeWrapperCls = `${prefixCls}-notice-wrapper`;

  return (
    <div
      className={clsx(
        prefixCls,
        listPrefixCls,
        `${prefixCls}-${placement}`,
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
          {({ config, className: motionClassName, style: motionStyle }, nodeRef) => {
            const { key, placement: _placement, ...notificationConfig } = config;
            const strKey = String(key);

            const setItemRef = (node: HTMLDivElement | null) => {
              setNodeSize(strKey, node);
            };

            return (
              <Notification
                key={key}
                {...notificationConfig}
                ref={composeRef(nodeRef, setItemRef)}
                prefixCls={prefixCls}
                offset={notificationPosition.get(strKey)}
                className={clsx(contextClassNames?.notice, config.className)}
                style={config.style}
                classNames={{
                  root: clsx(classNames?.root, config.classNames?.root, motionClassName),
                  icon: clsx(classNames?.icon, config.classNames?.icon),
                  section: clsx(classNames?.section, config.classNames?.section),
                  close: clsx(classNames?.close, config.classNames?.close),
                  progress: clsx(classNames?.progress, config.classNames?.progress),
                }}
                styles={{
                  root: {
                    ...styles?.root,
                    ...config.styles?.root,
                    ...motionStyle,
                  },
                  icon: {
                    ...styles?.icon,
                    ...config.styles?.icon,
                  },
                  section: {
                    ...styles?.section,
                    ...config.styles?.section,
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
                components={{
                  ...components,
                  ...config.components,
                }}
                hovering={stackEnabled && listHovering}
                pauseOnHover={config.pauseOnHover ?? pauseOnHover}
                onClose={() => {
                  config.onClose?.();
                  onNoticeClose?.(key);
                }}
              />
            );
          }}
        </CSSMotionList>
      </div>
    </div>
  );
};

export default NotificationList;
export type { NotificationClassNames, NotificationStyles } from './Notification';
