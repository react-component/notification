import * as React from 'react';
import { clsx } from 'clsx';
import pickAttrs from '@rc-component/util/lib/pickAttrs';
import useNoticeTimer from './hooks/useNoticeTimer';
import { useEvent } from '@rc-component/util';

export interface NotificationClassNames {
  wrapper?: string;
  root?: string;
  content?: string;
  close?: string;
  progress?: string;
}

export interface NotificationStyles {
  wrapper?: React.CSSProperties;
  root?: React.CSSProperties;
  content?: React.CSSProperties;
  close?: React.CSSProperties;
  progress?: React.CSSProperties;
}

export interface NotificationProps {
  // Style
  prefixCls?: string;
  className?: string;
  style?: React.CSSProperties;
  classNames?: NotificationClassNames;
  styles?: NotificationStyles;

  // UI
  content?: React.ReactNode;
  actions?: React.ReactNode;
  close?: React.ReactNode;
  closable?:
    | boolean
    | ({ closeIcon?: React.ReactNode; onClose?: VoidFunction } & React.AriaAttributes);
  offset?: {
    x: number;
    y: number;
  };

  // Behavior
  duration?: number | false | null;
  showProgress?: boolean;
  times?: number;
  hovering?: boolean;
  pauseOnHover?: boolean;

  // Function
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onClose?: () => void;
  onCloseInternal?: VoidFunction;
}

const Notification = React.forwardRef<HTMLDivElement, NotificationProps>((props, ref) => {
  const {
    // Style
    prefixCls = 'rc-notification',
    className,
    style,
    classNames,
    styles,

    // UI
    content,
    actions,
    close,
    closable,
    offset,

    // Behavior
    duration = 4.5,
    showProgress,
    hovering: forcedHovering,
    pauseOnHover = true,

    // Function
    onClick,
    onClose,
    onCloseInternal,
  } = props;
  const [hovering, setHovering] = React.useState(false);
  const [percent, setPercent] = React.useState(0);
  const noticePrefixCls = `${prefixCls}-notice`;

  // ========================= Close ==========================
  const onEventClose = useEvent(onClose);
  const onEventCloseInternal = useEvent(onCloseInternal);
  const offsetRef = React.useRef(offset);
  const closableObj = React.useMemo(() => {
    if (typeof closable === 'object' && closable !== null) {
      return closable;
    }

    return {};
  }, [closable]);
  const closeContent = close === undefined ? (closableObj.closeIcon ?? 'x') : close;
  const mergedClosable = close !== undefined ? close !== null : !!closable;
  const ariaProps = pickAttrs(closableObj, true);

  if (offset) {
    offsetRef.current = offset;
  }

  // ======================== Duration ========================
  const [onResume, onPause] = useNoticeTimer(
    duration,
    () => {
      closableObj.onClose?.();
      onEventClose();
      onEventCloseInternal();
    },
    setPercent,
    !!showProgress,
  );

  const mergedOffset = offset ?? offsetRef.current;
  const validPercent = 100 - Math.min(Math.max(percent * 100, 0), 100);

  React.useEffect(() => {
    if (!pauseOnHover) {
      return;
    }

    if (forcedHovering) {
      onPause();
    } else if (!hovering) {
      onResume();
    }
  }, [forcedHovering, hovering, onPause, onResume, pauseOnHover]);

  // ========================= Render =========================
  return (
    <div
      {...rootProps}
      ref={ref}
      // Styles
      className={clsx(noticePrefixCls, className, classNames?.root, {
        [`${noticePrefixCls}-closable`]: mergedClosable,
      })}
      style={{
        ...styles?.root,
        ...(mergedOffset
          ? {
              '--notification-x': `${mergedOffset.x}px`,
              '--notification-y': `${mergedOffset.y}px`,
            }
          : null),
        ...style,
      }}
      // Events
      onClick={onClick}
      onMouseEnter={(event) => {
        setHovering(true);
        if (pauseOnHover) {
          onPause();
        }
        rootProps?.onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        setHovering(false);
        if (pauseOnHover && !forcedHovering) {
          onResume();
        }
        rootProps?.onMouseLeave?.(event);
      }}
    >
      <div
        className={clsx(`${noticePrefixCls}-content`, classNames?.content)}
        style={styles?.content}
      >
        {content}
      </div>

      {mergedClosable && (
        <button
          className={clsx(`${noticePrefixCls}-close`, classNames?.close)}
          aria-label="Close"
          {...ariaProps}
          style={styles?.close}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.code === 'Enter') {
              closableObj.onClose?.();
              onEventClose();
              onEventCloseInternal();
            }
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            closableObj.onClose?.();
            onEventClose();
            onEventCloseInternal();
          }}
        >
          {closeContent}
        </button>
      )}

      {showProgress && typeof duration === 'number' && duration > 0 && (
        <progress
          className={clsx(`${noticePrefixCls}-progress`, classNames?.progress)}
          max="100"
          value={validPercent}
          style={styles?.progress}
        >
          {validPercent}%
        </progress>
      )}

      {actions && <div className="actions">{actions}</div>}
    </div>
  );
});

Notification.displayName = 'Notification';

export default Notification;
