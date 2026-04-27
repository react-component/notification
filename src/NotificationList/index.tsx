import { CSSMotionList } from '@rc-component/motion';
import type { CSSMotionProps } from '@rc-component/motion';
import { useComposeRef } from '@rc-component/util/lib/ref';
import { clsx } from 'clsx';
import * as React from 'react';
import useListPosition from '../hooks/useListPosition';
import useStack, { type StackConfig } from '../hooks/useStack';
import Notification, {
  type ComponentsType,
  type NotificationClassNames as NoticeClassNames,
  type NotificationProps,
  type NotificationStyles as NoticeStyles,
} from '../Notification';
import { NotificationContext, type NotificationContextProps } from '../NotificationProvider';
import Content from './Content';

export type Placement = 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight';
export type { StackConfig } from '../hooks/useStack';

export interface NotificationListConfig extends Omit<NotificationProps, 'prefixCls'> {
  key: React.Key;
  placement?: Placement;
  times?: number;
}

export interface NotificationClassNames extends NoticeClassNames {
  listContent?: string;
}

export interface NotificationStyles extends NoticeStyles {
  listContent?: React.CSSProperties;
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

const noticeSlotKeys = ['wrapper', 'root', 'icon', 'section', 'close', 'progress'] as const;

function fillClassNames(
  classNamesList: (NotificationClassNames | undefined)[],
): NotificationClassNames {
  return noticeSlotKeys.reduce<NotificationClassNames>((mergedClassNames, key) => {
    mergedClassNames[key] = clsx(...classNamesList.map((classNames) => classNames?.[key]));

    return mergedClassNames;
  }, {});
}

function fillStyles(stylesList: (NotificationStyles | undefined)[]): NotificationStyles {
  return noticeSlotKeys.reduce<NotificationStyles>((mergedStyles, key) => {
    mergedStyles[key] = Object.assign({}, ...stylesList.map((styles) => styles?.[key]));

    return mergedStyles;
  }, {});
}

function getIndex(keys: { key: React.Key }[], key: React.Key): number | undefined {
  const strKey = String(key);
  const index = keys.findIndex((item) => item.key === strKey);

  if (index === -1) {
    return undefined;
  }

  return keys.length - index - 1;
}

interface NotificationListItemProps {
  config: NotificationListConfig;
  components?: ComponentsType;
  contextClassNames?: NotificationContextProps['classNames'];
  classNames?: NotificationClassNames;
  styles?: NotificationStyles;
  className?: string;
  style?: React.CSSProperties;
  nodeRef: React.Ref<HTMLDivElement>;
  prefixCls: string;
  offset?: number;
  notificationIndex?: number;
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
    className,
    style,
    nodeRef,
    listHovering,
    stackEnabled,
    pauseOnHover,
    setNodeSize,
    onNoticeClose,
    ...restProps
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
      {...restProps}
      ref={ref}
      className={clsx(contextClassNames?.notice, config.className, className)}
      style={{ ...style, ...config.style }}
      classNames={fillClassNames([classNames, config.classNames])}
      styles={fillStyles([styles, config.styles])}
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
      <Content
        listPrefixCls={listPrefixCls}
        height={totalHeight}
        className={classNames?.listContent}
        style={styles?.listContent}
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
            const { key } = config;
            const strKey = String(key);
            const notificationIndex = getIndex(keys, key);
            const stackInThreshold =
              stackEnabled && notificationIndex !== undefined && notificationIndex < threshold;

            return (
              <NotificationListItem
                key={key}
                config={config}
                components={components}
                contextClassNames={contextClassNames}
                classNames={classNames}
                styles={styles}
                className={motionClassName}
                style={motionStyle}
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
