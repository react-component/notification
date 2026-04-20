import { clsx } from 'clsx';
import * as React from 'react';

export interface ContentProps extends React.HTMLAttributes<HTMLDivElement> {
  listPrefixCls: string;
  height: number;
}

const Content = React.forwardRef<HTMLDivElement, ContentProps>((props, ref) => {
  const { listPrefixCls, height, className, style, ...restProps } = props;

  const contentPrefixCls = `${listPrefixCls}-content`;

  // ========================= Height =========================
  const prevHeightRef = React.useRef(height);
  const prevHeight = prevHeightRef.current;
  const heightStatus = height < prevHeight ? 'decrease' : 'increase';

  prevHeightRef.current = height;

  // ========================= Render =========================
  return (
    <div
      {...restProps}
      className={clsx(contentPrefixCls, `${contentPrefixCls}-${heightStatus}`, className)}
      style={{
        ...style,
        height,
      }}
      ref={ref}
    />
  );
});

if (process.env.NODE_ENV !== 'production') {
  Content.displayName = 'NotificationListContent';
}

export default Content;
