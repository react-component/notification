import { clsx } from 'clsx';
import * as React from 'react';

export interface ContentProps extends React.HTMLAttributes<HTMLDivElement> {
  listPrefixCls: string;
  height: number;
  topNoticeHeight?: number;
  topNoticeWidth?: number;
}

const Content = React.forwardRef<HTMLDivElement, ContentProps>((props, ref) => {
  const {
    listPrefixCls,
    height,
    topNoticeHeight = 0,
    topNoticeWidth = 0,
    className,
    style,
    ...restProps
  } = props;

  const contentPrefixCls = `${listPrefixCls}-content`;

  // ========================= Height =========================
  const prevHeightRef = React.useRef(height);
  const prevHeight = prevHeightRef.current;
  const heightStatus = height < prevHeight ? 'decrease' : 'increase';

  prevHeightRef.current = height;

  // ========================= Style ==========================
  const contentStyle: React.CSSProperties & {
    '--top-notificiation-height': string;
    '--top-notificiation-width': string;
  } = {
    ...style,
    height,
    '--top-notificiation-height': `${topNoticeHeight}px`,
    '--top-notificiation-width': `${topNoticeWidth}px`,
  };

  // ========================= Render =========================
  return (
    <div
      {...restProps}
      className={clsx(contentPrefixCls, `${contentPrefixCls}-${heightStatus}`, className)}
      style={contentStyle}
      ref={ref}
    />
  );
});

if (process.env.NODE_ENV !== 'production') {
  Content.displayName = 'NotificationListContent';
}

export default Content;
