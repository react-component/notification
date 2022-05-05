import * as React from 'react';
import classNames from 'classnames';

export interface NoticeConfig {
  content?: React.ReactNode;
  duration?: number | null;
  closeIcon?: React.ReactNode;
  closable?: boolean;
  props?: React.HTMLAttributes<HTMLDivElement>;

  onClose?: VoidFunction;
}

export interface NoticeProps extends Omit<NoticeConfig, 'onClose'> {
  prefixCls: string;
  className?: string;
  style?: React.CSSProperties;
  eventKey: React.Key;

  onNoticeClose?: (key: React.Key) => void;
}

const Notify = React.forwardRef<HTMLDivElement, NoticeProps>((props, ref) => {
  const {
    prefixCls,
    style,
    className,
    duration = 4.5,

    eventKey,
    content,
    closable = true,
    closeIcon = 'x',
    props: divProps,

    onNoticeClose,
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
  }, [duration, hovering]);

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
