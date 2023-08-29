import type { CSSProperties, FC } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { CSSMotionProps } from 'rc-motion';
import { CSSMotionList } from 'rc-motion';
import type { InnerOpenConfig, NoticeConfig, OpenConfig, Placement } from './interface';
import Notice from './Notice';

export interface NoticeListProps {
  configList?: OpenConfig[];
  placement?: Placement;
  prefixCls?: string;
  motion?: CSSMotionProps | ((placement: Placement) => CSSMotionProps);

  // Events
  onAllNoticeRemoved?: (placement: Placement) => void;
  onNoticeClose?: (key: React.Key) => void;

  // Hook Slots
  useStyle?: (prefixCls: string) => { notice?: string; list?: string };

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
    useStyle,
    motion,
    onAllNoticeRemoved,
    onNoticeClose,
  } = props;

  const styles = useStyle?.(prefixCls);

  const keys = configList.map((config) => ({
    config,
    key: config.key,
  }));

  const placementMotion = typeof motion === 'function' ? motion(placement) : motion;

  return (
    <CSSMotionList
      key={placement}
      className={classNames(prefixCls, `${prefixCls}-${placement}`, styles?.list, className)}
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
            className={classNames(motionClassName, configClassName, styles?.notice)}
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
