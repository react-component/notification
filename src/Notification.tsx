import * as React from 'react';
import { clsx } from 'clsx';
import useNoticeTimer from './hooks/useNoticeTimer';
import { useEvent } from '@rc-component/util';
import useClosable, { type ClosableType } from './hooks/useClosable';

export interface NotificationClassNames {
  wrapper?: string;
  root?: string;
  icon?: string;
  section?: string;
  close?: string;
  progress?: string;
}

export interface NotificationStyles {
  wrapper?: React.CSSProperties;
  root?: React.CSSProperties;
  icon?: React.CSSProperties;
  section?: React.CSSProperties;
  close?: React.CSSProperties;
  progress?: React.CSSProperties;
}

export interface NotificationProps {
  // Style
  prefixCls: string;
  className?: string;
  style?: React.CSSProperties;
  classNames?: NotificationClassNames;
  styles?: NotificationStyles;

  // UI
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
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
  /** @deprecated Please use `closable.onClose` instead. */
  onClose?: () => void;
}

const Notification = React.forwardRef<HTMLDivElement, NotificationProps>((props, ref) => {
  const {
    // Style
    prefixCls,
    className,
    style,
    classNames,
    styles,

    // UI
    title,
    description,
    icon,
    actions,
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
  const [mergedClosable, closableConfig, closeBtnAriaProps] = useClosable(closable);
  const onInternalClose = useEvent(() => {
    closableConfig.onClose?.();
    onClose?.();
  });

  // ======================== Duration ========================
  const [hovering, setHovering] = React.useState(false);

  const [onResume, onPause] = useNoticeTimer(duration, onInternalClose, setPercent, !!showProgress);

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

  function onInternalCloseClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    onInternalClose();
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
      <div className={classNames?.wrapper} style={styles?.wrapper}>
        {icon && (
          <div className={clsx(`${noticePrefixCls}-icon`, classNames?.icon)} style={styles?.icon}>
            {icon}
          </div>
        )}

        <div
          className={clsx(`${noticePrefixCls}-section`, classNames?.section)}
          style={styles?.section}
        >
          {title !== undefined && title !== null && (
            <div className={`${noticePrefixCls}-title`}>{title}</div>
          )}
          {description !== undefined && description !== null && (
            <div className={`${noticePrefixCls}-description`}>{description}</div>
          )}
        </div>
      </div>

      {mergedClosable && (
        <button
          className={clsx(`${noticePrefixCls}-close`, classNames?.close)}
          aria-label="Close"
          {...closeBtnAriaProps}
          style={styles?.close}
          onClick={onInternalCloseClick}
        >
          {closableConfig.closeIcon}
        </button>
      )}

      {actions && <div className="actions">{actions}</div>}

      {showProgress && typeof duration === 'number' && duration > 0 && (
        <progress
          className={clsx(`${noticePrefixCls}-progress`, classNames?.progress)}
          max="100"
          value={validPercent}
          style={styles?.progress}
        />
      )}
    </div>
  );
});

Notification.displayName = 'Notification';

export default Notification;
