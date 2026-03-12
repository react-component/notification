import * as React from 'react';
import useNoticeTimer from './hooks/useNoticeTimer';
import { useEvent } from '@rc-component/util';

export interface NotificationProps {
  content?: React.ReactNode;
  actions?: React.ReactNode;
  close?: React.ReactNode;
  duration?: number | false;
  pauseOnHover?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  /** Callback when notification is closed by timeout */
  onClose?: () => void;
}

const Notification = React.forwardRef<HTMLDivElement, NotificationProps>((props, ref) => {
  const { content, actions, close, duration = 4.5, pauseOnHover = true, onClick, onClose } = props;

  // ========================= Close ==========================
  const onEventClose = useEvent(onClose);

  // ======================== Duration ========================
  const [onResume, onPause] = useNoticeTimer(duration, onEventClose, () => {});

  // ========================= Render =========================
  return (
    <div
      ref={ref}
      onClick={onClick}
      onMouseEnter={pauseOnHover ? onPause : undefined}
      onMouseLeave={pauseOnHover ? onResume : undefined}
    >
      {content}
      {close && (
        <button
          className="close"
          aria-label="Close"
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
