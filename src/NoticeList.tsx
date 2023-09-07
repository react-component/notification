import type { CSSProperties, FC } from 'react';
import React, { useContext, useEffect, useRef, useState } from 'react';
import clsx from 'classnames';
import type { CSSMotionProps } from 'rc-motion';
import { CSSMotionList } from 'rc-motion';
import type {
  InnerOpenConfig,
  NoticeConfig,
  OpenConfig,
  Placement,
  StackConfig,
} from './interface';
import Notice from './Notice';
import { NotificationContext } from './NotificationProvider';
import useStack from './hooks/useStack';

export interface NoticeListProps {
  configList?: OpenConfig[];
  placement?: Placement;
  prefixCls?: string;
  motion?: CSSMotionProps | ((placement: Placement) => CSSMotionProps);
  stack?: StackConfig;

  // Events
  onAllNoticeRemoved?: (placement: Placement) => void;
  onNoticeClose?: (key: React.Key) => void;

  // Common
  className?: string;
  style?: CSSProperties;
}

const NoticeList: FC<NoticeListProps> = (props) => {
  const {
    configList,
    placement,
    prefixCls,
    className,
    style,
    motion,
    onAllNoticeRemoved,
    onNoticeClose,
    stack: stackConfig,
  } = props;

  const { classNames: ctxCls } = useContext(NotificationContext);

  const dictRef = useRef<Record<React.Key, HTMLDivElement>>({});
  const [latestNotice, setLatestNotice] = useState<HTMLDivElement>(null);
  const [hoverKeys, setHoverKeys] = useState<React.Key[]>([]);

  const keys = configList.map((config) => ({
    config,
    key: config.key,
  }));

  const [stack, { offset, threshold, gap }] = useStack(stackConfig);

  const expanded = stack && (hoverKeys.length > 0 || keys.length <= threshold);

  const placementMotion = typeof motion === 'function' ? motion(placement) : motion;

  // Clean hover key
  useEffect(() => {
    if (stack && hoverKeys.length > 1) {
      setHoverKeys((prev) =>
        prev.filter((key) => keys.some(({ key: dataKey }) => key === dataKey)),
      );
    }
  }, [hoverKeys, keys, stack]);

  // Force update latest notice
  useEffect(() => {
    if (stack && dictRef.current[keys[keys.length - 1]?.key]) {
      setLatestNotice(dictRef.current[keys[keys.length - 1]?.key]);
    }
  }, [keys, stack]);

  return (
    <CSSMotionList
      key={placement}
      className={clsx(prefixCls, `${prefixCls}-${placement}`, ctxCls?.list, className, {
        [`${prefixCls}-stack`]: !!stack,
        [`${prefixCls}-stack-expanded`]: expanded,
      })}
      style={style}
      keys={keys}
      motionAppear
      {...placementMotion}
      onAllRemoved={() => {
        onAllNoticeRemoved(placement);
      }}
    >
      {(
        { config, className: motionClassName, style: motionStyle, index: motionIndex },
        nodeRef,
      ) => {
        const { key, times } = config as InnerOpenConfig;
        const { className: configClassName, style: configStyle } = config as NoticeConfig;
        const dataIndex = keys.findIndex((item) => item.key === key);

        // If dataIndex is -1, that means this notice has been removed in data, but still in dom
        // Should minus (motionIndex - 1) to get the correct index because keys.length is not the same as dom length
        const stackStyle: CSSProperties = {};
        if (stack) {
          const index = keys.length - 1 - (dataIndex > -1 ? dataIndex : motionIndex - 1);
          const transformX = placement === 'top' || placement === 'bottom' ? '-50%' : '0';
          if (index > 0) {
            stackStyle.height = expanded
              ? dictRef.current[key]?.offsetHeight
              : latestNotice?.offsetHeight;

            // Transform
            let verticalOffset = 0;
            for (let i = 0; i < index; i++) {
              verticalOffset += dictRef.current[keys[keys.length - 1 - i].key]?.offsetHeight + gap;
            }

            const transformY =
              (expanded ? verticalOffset : index * offset) * (placement.startsWith('top') ? 1 : -1);
            const scaleX =
              !expanded && latestNotice?.offsetWidth && dictRef.current[key]?.offsetWidth
                ? (latestNotice?.offsetWidth - offset * 2 * (index < 3 ? index : 3)) /
                  dictRef.current[key]?.offsetWidth
                : 1;
            stackStyle.transform = `translate3d(${transformX}, ${transformY}px, 0) scaleX(${scaleX})`;
          } else {
            stackStyle.transform = `translate3d(${transformX}, 0, 0)`;
          }
        }

        return (
          <div
            ref={nodeRef}
            className={clsx(`${prefixCls}-notice-wrapper`, motionClassName)}
            style={{
              ...motionStyle,
              ...stackStyle,
              ...configStyle,
            }}
            onMouseEnter={() =>
              setHoverKeys((prev) => (prev.includes(key) ? prev : [...prev, key]))
            }
            onMouseLeave={() => setHoverKeys((prev) => prev.filter((k) => k !== key))}
          >
            <Notice
              {...config}
              ref={(node) => {
                if (dataIndex > -1) {
                  dictRef.current[key] = node;
                } else {
                  delete dictRef.current[key];
                }
              }}
              prefixCls={prefixCls}
              className={clsx(configClassName, ctxCls?.notice)}
              times={times}
              key={key}
              eventKey={key}
              onNoticeClose={onNoticeClose}
              hovering={stack && hoverKeys.length > 0}
            />
          </div>
        );
      }}
    </CSSMotionList>
  );
};

if (process.env.NODE_ENV !== 'production') {
  NoticeList.displayName = 'NoticeList';
}

export default NoticeList;
