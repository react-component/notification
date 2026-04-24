import { CSSMotionList } from '@rc-component/motion';
import type { CSSMotionProps } from '@rc-component/motion';
import { useComposeRef } from '@rc-component/util/lib/ref';
import { clsx } from 'clsx';
import * as React from 'react';
import useListPosition from '../hooks/useListPosition';
import useStack from '../hooks/useStack';
import type { StackConfig } from '../interface';
import Notification, {
  type ComponentsType,
  type NotificationClassNames,
  type NotificationProps,
  type NotificationStyles,
} from '../Notification';
import { NotificationContext, type NotificationContextProps } from '../NotificationProvider';
import Content from './Content';

export type Placement = 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight';
export type { StackConfig } from '../interface';

export interface NotificationListConfig extends Omit<NotificationProps, 'prefixCls'> {
  key: React.Key;
  placement?: Placement;
  times?: number;
}

export interface NotificationListProps {
  configList?: NotificationListConfig[];
  prefixCls?: string;
  placement: Placement;
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

interface NotificationListItemProps {
  config: NotificationListConfig;
  components?: ComponentsType;
  contextClassNames?: NotificationContextProps['classNames'];
  classNames?: NotificationClassNames;
  styles?: NotificationStyles;
  motionClassName?: string;
  motionStyle?: React.CSSProperties;
  nodeRef: React.Ref<HTMLDivElement>;
  prefixCls: string;
  offset?: number;
  notificationIndex: number;
  stackInThreshold: boolean;
  listHovering: boolean;
  stackEnabled: boolean;
  pauseOnHover?: boolean;
  setNodeSize: (key: string, node: HTMLDivElement | null) => void;
  onNoticeClose?: (key: React.Key) => void;
}

const NotificationListItem: React.FC<NotificationListItemProps> = (props) => {
  const {
    config,
    components,
    contextClassNames,
    classNames,
    styles,
    motionClassName,
    motionStyle,
    nodeRef,
    prefixCls,
    offset,
    notificationIndex,
    stackInThreshold,
    listHovering,
    stackEnabled,
    pauseOnHover,
    setNodeSize,
    onNoticeClose,
  } = props;
  const { key, placement: itemPlacement, ...notificationConfig } = config;
  const strKey = String(key);

  const setItemRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      setNodeSize(strKey, node);
    },
    [setNodeSize, strKey],
  );
  const ref = useComposeRef(nodeRef, setItemRef);

  return (
    <Notification
      {...notificationConfig}
      ref={ref}
      prefixCls={prefixCls}
      offset={offset}
      notificationIndex={notificationIndex}
      stackInThreshold={stackInThreshold}
      className={clsx(contextClassNames?.notice, config.className)}
      style={config.style}
      classNames={{
        wrapper: clsx(classNames?.wrapper, config.classNames?.wrapper),
        root: clsx(classNames?.root, config.classNames?.root, motionClassName),
        icon: clsx(classNames?.icon, config.classNames?.icon),
        section: clsx(classNames?.section, config.classNames?.section),
        close: clsx(classNames?.close, config.classNames?.close),
        progress: clsx(classNames?.progress, config.classNames?.progress),
      }}
      styles={{
        wrapper: {
          ...styles?.wrapper,
          ...config.styles?.wrapper,
        },
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
};

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

  // ===================== Motion Config ======================
  const placementMotion = typeof motion === 'function' ? motion(placement) : motion;

  // ====================== Stack State =======================
  const [stackEnabled, { offset, threshold }] = useStack(stackConfig);
  const [listHovering, setListHovering] = React.useState(false);
  const expanded = stackEnabled && (listHovering || keys.length <= threshold);

  // ====================== Stack Layout ======================
  const stackPosition = React.useMemo<StackConfig | undefined>(() => {
    if (!stackEnabled || expanded) {
      return undefined;
    }

    return {
      offset,
      threshold,
    };
  }, [expanded, offset, stackEnabled, threshold]);

  // ====================== List Measure ======================
  const [gap, setGap] = React.useState(0);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [notificationPosition, setNodeSize, totalHeight] = useListPosition(
    configList,
    stackPosition,
    gap,
  );
  const hasConfigList = !!configList.length;

  React.useEffect(() => {
    const listNode = contentRef.current;

    if (!listNode) {
      return;
    }

    // CSS gap impacts stack offset and total list height calculation.
    const { gap: cssGap, rowGap } = window.getComputedStyle(listNode);
    const nextGap = parseFloat(rowGap || cssGap) || 0;

    setGap((prevGap) => (prevGap === nextGap ? prevGap : nextGap));
  }, [hasConfigList]);

  // ========================= Render =========================
  const listPrefixCls = `${prefixCls}-list`;

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
          [`${listPrefixCls}-hovered`]: listHovering,
        },
      )}
      onMouseEnter={() => {
        setListHovering(true);
      }}
      onMouseLeave={() => {
        setListHovering(false);
      }}
      style={style}
    >
      <Content listPrefixCls={listPrefixCls} height={totalHeight} ref={contentRef}>
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
          {({ config, className: motionClassName, style: motionStyle, index = 0 }, nodeRef) => {
            const { key } = config;
            const strKey = String(key);
            const notificationIndex = keyList.length - index - 1;
            const stackInThreshold = stackEnabled && notificationIndex < threshold;

            return (
              <NotificationListItem
                key={key}
                config={config}
                components={components}
                contextClassNames={contextClassNames}
                classNames={classNames}
                styles={styles}
                motionClassName={motionClassName}
                motionStyle={motionStyle}
                nodeRef={nodeRef}
                prefixCls={prefixCls}
                offset={notificationPosition.get(strKey)}
                notificationIndex={notificationIndex}
                stackInThreshold={stackInThreshold}
                listHovering={listHovering}
                stackEnabled={stackEnabled}
                pauseOnHover={pauseOnHover}
                setNodeSize={setNodeSize}
                onNoticeClose={onNoticeClose}
              />
            );
          }}
        </CSSMotionList>
      </Content>
    </div>
  );
};

export default NotificationList;
export type { NotificationClassNames, NotificationStyles } from '../Notification';
