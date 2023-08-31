import type { CSSProperties, FC } from 'react';
import React, { useContext, useRef, useState } from 'react';
import clsx from 'classnames';
import type { CSSMotionProps } from 'rc-motion';
import { CSSMotionList } from 'rc-motion';
import type { InnerOpenConfig, NoticeConfig, OpenConfig, Placement } from './interface';
import Notice from './Notice';
import { NotificationContext } from './NotificationProvider';

export interface NoticeListProps {
  configList?: OpenConfig[];
  placement?: Placement;
  prefixCls?: string;
  motion?: CSSMotionProps | ((placement: Placement) => CSSMotionProps);
  stack?:
    | boolean
    | {
        threshold?: number;
      };

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
    stack,
  } = props;

  const { classNames: ctxCls } = useContext(NotificationContext);

  const listRef = useRef<HTMLDivElement[]>([]);
  const [latestNotice, setLatestNotice] = useState<HTMLDivElement>(null);
  const [hoverCount, setHoverCount] = useState(0);

  const keys = configList.map((config) => ({
    config,
    key: config.key,
  }));

  const expanded =
    !!stack &&
    (hoverCount > 0 ||
      keys.length <= (typeof stack === 'object' && 'threshold' in stack ? stack.threshold : 3));

  const placementMotion = typeof motion === 'function' ? motion(placement) : motion;

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
      onAppearPrepare={async (element) => {
        console.log('Latest Notice Prepare: ', element);
        if (element.parentNode.lastElementChild === element) {
          setLatestNotice(element as HTMLDivElement);
        }
      }}
    >
      {({ config, className: motionClassName, style: motionStyle }, nodeRef) => {
        const { key, times } = config as InnerOpenConfig;
        const { className: configClassName, style: configStyle } = config as NoticeConfig;

        const index = keys.length - 1 - keys.findIndex((item) => item.key === key);
        const stackStyle: CSSProperties = {};
        if (stack) {
          if (index > 0) {
            stackStyle.height = expanded
              ? listRef.current[index]?.offsetHeight
              : latestNotice?.offsetHeight;
            stackStyle.transform = `translateY(${
              index * 8 +
              (expanded
                ? listRef.current.reduce(
                    (acc, item, refIndex) => acc + (refIndex < index ? item?.offsetHeight ?? 0 : 0),
                    0,
                  )
                : 0)
            }px)`;
          }
        }

        return (
          <div
            className={clsx(`${prefixCls}-notice-wrapper`, motionClassName)}
            style={{
              ...motionStyle,
              ...stackStyle,
            }}
            onMouseEnter={() => setHoverCount((c) => c + 1)}
            onMouseLeave={() => setHoverCount((c) => c - 1)}
          >
            <Notice
              {...config}
              ref={(node) => {
                nodeRef(node);
                listRef.current[index] = node;
              }}
              prefixCls={prefixCls}
              className={clsx(configClassName, ctxCls?.notice)}
              style={{
                ...configStyle,
              }}
              times={times}
              key={key}
              eventKey={key}
              onNoticeClose={onNoticeClose}
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
