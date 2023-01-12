import * as React from 'react';
import classNames from 'classnames';

export interface NoticeConfig {
  content?: React.ReactNode;
  duration?: number | null;
  closeIcon?: React.ReactNode;
  closable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** @private Internal usage. Do not override in your code */
  props?: React.HTMLAttributes<HTMLDivElement> & Record<string, any>;

  onClose?: VoidFunction;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export interface NoticeProps extends Omit<NoticeConfig, 'onClose'> {
  prefixCls: string;
  className?: string;
  style?: React.CSSProperties;
  eventKey: React.Key;

  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onNoticeClose?: (key: React.Key) => void;
}

const Notify = React.forwardRef<HTMLDivElement, NoticeProps & { times?: number }>((props, ref) => {
  const {
    prefixCls,
    style,
    className,
    duration = 4.5,

    eventKey,
    content,
    closable,
    closeIcon = 'x',
    props: divProps,

    onClick,
    onNoticeClose,
    times,
  } = props;
  const [hovering, setHovering] = React.useState(false);

  // ======================== Close =========================
  const onInternalClose = () => {
    onNoticeClose(eventKey);
  };

  // ======================== Effect ========================
  React.useEffect(() => {
    if (!hovering && duration > 0) {
      const timeout = setTimeout(() => {
        onInternalClose();
      }, duration * 1000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [duration, hovering, times]);

  // ======================== Render ========================
  const noticePrefixCls = `${prefixCls}-notice`;

  return (
    <div
      {...divProps}
      ref={ref}
      className={classNames(noticePrefixCls, className, {
        [`${noticePrefixCls}-closable`]: closable,
      })}
      style={style}
      onMouseEnter={() => {
        setHovering(true);
      }}
      onMouseLeave={() => {
        setHovering(false);
      }}
      onClick={onClick}
    >
      {/* Content */}
      <div className={`${noticePrefixCls}-content`}>{content}</div>

      {/* Close Icon */}
      {closable && (
        <a
          tabIndex={0}
          className={`${noticePrefixCls}-close`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onInternalClose();
          }}
        >
          {closeIcon}
        </a>
      )}
    </div>
  );
});

export default Notify;
