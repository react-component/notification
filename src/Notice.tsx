import * as React from 'react';
import classNames from 'classnames';

export interface NoticeProps {
  prefixCls: string;
  className?: string;
  style?: React.CSSProperties;
  content?: React.ReactNode;
  duration?: number | null;
  eventKey: React.Key;
  closeIcon?: React.ReactNode;
  closable?: boolean;

  onClose?: (key: React.Key) => void;
}

const Notify = React.forwardRef<HTMLDivElement, NoticeProps>((props, ref) => {
  const {
    prefixCls,
    style,
    className,
    duration = 4.5,
    onClose,
    eventKey,
    content,
    closable = true,
    closeIcon = 'x',
  } = props;
  const [hovering, setHovering] = React.useState(false);

  // ======================== Effect ========================
  React.useEffect(() => {
    if (!hovering && duration > 0) {
      const timeout = setTimeout(() => {
        onClose(eventKey);
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
            onClose(eventKey);
          }}
        >
          {closeIcon}
        </a>
      )}
    </div>
  );
});

export default Notify;
