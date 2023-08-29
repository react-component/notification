import type { CSSProperties, FC } from 'react';
import React, { useContext } from 'react';
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
  } = props;

  const { classNames: ctxCls } = useContext(NotificationContext);

  const keys = configList.map((config) => ({
    config,
    key: config.key,
  }));

  const placementMotion = typeof motion === 'function' ? motion(placement) : motion;

  return (
    <CSSMotionList
      key={placement}
      className={clsx(prefixCls, `${prefixCls}-${placement}`, ctxCls?.list, className)}
      style={style}
      keys={keys}
      motionAppear
      {...placementMotion}
      onAllRemoved={() => {
        onAllNoticeRemoved(placement);
      }}
    >
      {({ config, className: motionClassName, style: motionStyle }, nodeRef) => {
        const { key, times } = config as InnerOpenConfig;
        const { className: configClassName, style: configStyle } = config as NoticeConfig;

        return (
          <Notice
            {...config}
            ref={nodeRef}
            prefixCls={prefixCls}
            className={clsx(motionClassName, configClassName, ctxCls?.notice)}
            style={{
              ...motionStyle,
              ...configStyle,
            }}
            times={times}
            key={key}
            eventKey={key}
            onNoticeClose={onNoticeClose}
          />
        );
      }}
    </CSSMotionList>
  );
};

if (process.env.NODE_ENV !== 'production') {
  NoticeList.displayName = 'NoticeList';
}

export default NoticeList;
