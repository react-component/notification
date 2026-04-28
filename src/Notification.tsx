import * as React from 'react';
import { clsx } from 'clsx';
import useNoticeTimer from './hooks/useNoticeTimer';
import { useEvent } from '@rc-component/util';
import useClosable, { type ClosableType } from './hooks/useClosable';
import DefaultProgress from './Progress';
import type { NotificationProgressProps } from './Progress';

export interface NotificationClassNames {
  wrapper?: string;
  root?: string;
  icon?: string;
  section?: string;
  title?: string;
  description?: string;
  actions?: string;
  close?: string;
  progress?: string;
}

export interface NotificationStyles {
  wrapper?: React.CSSProperties;
  root?: React.CSSProperties;
  icon?: React.CSSProperties;
  section?: React.CSSProperties;
  title?: React.CSSProperties;
  description?: React.CSSProperties;
  actions?: React.CSSProperties;
  close?: React.CSSProperties;
  progress?: React.CSSProperties;
}

export interface ComponentsType {
  progress?: React.ComponentType<NotificationProgressProps>;
}

export interface NotificationProps {
  // Style
  prefixCls: string;
  className?: string;
  style?: React.CSSProperties;
  classNames?: NotificationClassNames;
  styles?: NotificationStyles;
  components?: ComponentsType;

  // UI
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  role?: string;
  closable?: ClosableType;
  offset?: number;
  notificationIndex?: number;
  stackInThreshold?: boolean;
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
    components,

    // UI
    title,
    description,
    icon,
    actions,
    role,
    closable,
    offset,
    notificationIndex,
    stackInThreshold,
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

  const [onResume, onPause] = useNoticeTimer(duration, onInternalClose, setPercent);

  const validPercent = 100 - Math.min(Math.max(percent * 100, 0), 100);
  const Progress = components?.progress || DefaultProgress;

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
  if (offset !== undefined) {
    offsetRef.current = offset;
  }

  const notificationIndexRef = React.useRef(notificationIndex);
  if (notificationIndex !== undefined) {
    notificationIndexRef.current = notificationIndex;
  }

  const mergedOffset = offset ?? offsetRef.current;
  const mergedNotificationIndex = notificationIndex ?? notificationIndexRef.current ?? 0;

  // ======================== Content =========================
  const titleNode =
    title !== undefined && title !== null ? (
      <div className={clsx(`${noticePrefixCls}-title`, classNames?.title)} style={styles?.title}>
        {title}
      </div>
    ) : null;

  const descNode =
    description !== undefined && description !== null ? (
      <div
        className={clsx(`${noticePrefixCls}-description`, classNames?.description)}
        style={styles?.description}
      >
        {description}
      </div>
    ) : null;

  const hasTitle = titleNode !== null;
  const hasDescription = descNode !== null;
  let contentNode: React.ReactNode = null;

  if (hasTitle && hasDescription) {
    contentNode = (
      <div
        className={clsx(`${noticePrefixCls}-section`, classNames?.section)}
        style={styles?.section}
      >
        {titleNode}
        {descNode}
      </div>
    );
  } else {
    contentNode = titleNode || descNode;
  }

  if (icon !== undefined && icon !== null) {
    contentNode = (
      <div className={classNames?.wrapper} style={styles?.wrapper}>
        <div className={clsx(`${noticePrefixCls}-icon`, classNames?.icon)} style={styles?.icon}>
          {icon}
        </div>
        {contentNode}
      </div>
    );
  }

  const actionsNode = actions ? (
    <div
      className={clsx(`${noticePrefixCls}-actions`, classNames?.actions)}
      style={styles?.actions}
    >
      {actions}
    </div>
  ) : null;

  // ========================= Render =========================
  const mergedStyle: React.CSSProperties & {
    '--notification-index'?: number;
    '--notification-y'?: string;
  } = {
    '--notification-index': mergedNotificationIndex,
    ...styles?.root,
    ...style,
  };

  if (mergedOffset !== undefined) {
    mergedStyle['--notification-y'] = `${mergedOffset}px`;
  }

  const mergedRole = role ?? rootProps?.role ?? 'alert';

  return (
    <div
      {...rootProps}
      ref={ref}
      role={mergedRole}
      data-notification-index={mergedNotificationIndex}
      // Styles
      className={clsx(noticePrefixCls, className, classNames?.root, {
        [`${noticePrefixCls}-closable`]: mergedClosable,
        [`${noticePrefixCls}-stack-in-threshold`]: stackInThreshold,
      })}
      style={mergedStyle}
      // Events
      onClick={onClick}
      onMouseEnter={onInternalMouseEnter}
      onMouseLeave={onInternalMouseLeave}
    >
      {contentNode}
      {actionsNode}

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

      {showProgress && typeof duration === 'number' && duration > 0 && (
        <Progress
          className={clsx(`${noticePrefixCls}-progress`, classNames?.progress)}
          percent={validPercent}
          style={styles?.progress}
        />
      )}
    </div>
  );
});

if (process.env.NODE_ENV !== 'production') {
  Notification.displayName = 'Notification';
}

export default Notification;
