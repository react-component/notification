import * as React from 'react';
import { clsx } from 'clsx';
import useNoticeTimer from './hooks/useNoticeTimer';
import { useEvent } from '@rc-component/util';
import useClosable, { type ClosableType } from './hooks/useClosable';

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
  closable?: ClosableType;
  offset?: {
    x: number;
    y: number;
  };
  props?: React.HTMLAttributes<HTMLDivElement> & Record<string, any>;

  // Behavior
  duration?: number | false | null;
  showProgress?: boolean;
  times?: number;
  hovering?: boolean;
  pauseOnHover?: boolean;

  // Function
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
  onClose?: () => void;
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
    props: rootProps,

    // Behavior
    duration = 4.5,
    showProgress,
    hovering: forcedHovering,
    pauseOnHover = true,

    // Function
    onClick,
    onMouseEnter,
    onMouseLeave,
    onClose,
  } = props;

  const [percent, setPercent] = React.useState(0);
  const noticePrefixCls = `${prefixCls}-notice`;

  // ========================= Close ==========================
  const onEventClose = useEvent(onClose);

  const [closableEnabled, closableConfig, closeBtnAriaProps] = useClosable(closable);
  const closeContent = close === undefined ? closableConfig.closeIcon : close;
  const mergedClosable = close !== undefined ? close !== null : closableEnabled;

  // ======================== Duration ========================
  const [hovering, setHovering] = React.useState(false);

  const [onResume, onPause] = useNoticeTimer(
    duration,
    () => {
      closableConfig.onClose?.();
      onEventClose();
    },
    setPercent,
    !!showProgress,
  );

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

  // ========================= Hover ==========================
  function onInternalMouseEnter(event: React.MouseEvent<HTMLDivElement>) {
    setHovering(true);
    if (pauseOnHover) {
      onPause();
    }
    onMouseEnter?.(event);
  }

  function onInternalMouseLeave(event: React.MouseEvent<HTMLDivElement>) {
    setHovering(false);
    if (pauseOnHover && !forcedHovering) {
      onResume();
    }
    onMouseLeave?.(event);
  }

  // ======================== Position ========================
  const offsetRef = React.useRef(offset);
  if (offset) {
    offsetRef.current = offset;
  }

  const mergedOffset = offset ?? offsetRef.current;

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
      onMouseEnter={onInternalMouseEnter}
      onMouseLeave={onInternalMouseLeave}
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
          {...closeBtnAriaProps}
          style={styles?.close}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.code === 'Enter') {
              closableConfig.onClose?.();
              onEventClose();
            }
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            closableConfig.onClose?.();
            onEventClose();
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
