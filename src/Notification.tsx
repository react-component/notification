import * as React from 'react';
import { clsx } from 'clsx';
import useNoticeTimer from './hooks/useNoticeTimer';
import { useEvent } from '@rc-component/util';

export interface NotificationClassNames {
  root?: string;
  close?: string;
}

export interface NotificationStyles {
  root?: React.CSSProperties;
  close?: React.CSSProperties;
}

export interface NotificationProps {
  content?: React.ReactNode;
  actions?: React.ReactNode;
  close?: React.ReactNode;
  duration?: number | false;
  pauseOnHover?: boolean;
  className?: string;
  style?: React.CSSProperties;
  classNames?: NotificationClassNames;
  styles?: NotificationStyles;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  /** Callback when notification is closed by timeout */
  onClose?: () => void;
}

const Notification = React.forwardRef<HTMLDivElement, NotificationProps>((props, ref) => {
  const {
    content,
    actions,
    close,
    duration = 4.5,
    pauseOnHover = true,
    className,
    style,
    classNames,
    styles,
    onClick,
    onClose,
  } = props;

  // ========================= Close ==========================
  const onEventClose = useEvent(onClose);

  // ======================== Duration ========================
  const [onResume, onPause] = useNoticeTimer(duration, onEventClose, () => {});

  // ========================= Render =========================
  return (
    <div
      ref={ref}
      className={clsx(className, classNames?.root)}
      style={{
        ...styles?.root,
        ...style,
      }}
      onClick={onClick}
      onMouseEnter={pauseOnHover ? onPause : undefined}
      onMouseLeave={pauseOnHover ? onResume : undefined}
    >
      {content}
      {close && (
        <button
          className={clsx('close', classNames?.close)}
          aria-label="Close"
          style={styles?.close}
          onClick={(e) => {
            e.stopPropagation();
            onEventClose();
          }}
        >
          {close}
        </button>
      )}
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
});

Notification.displayName = 'Notification';

export default Notification;
