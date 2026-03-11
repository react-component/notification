import * as React from 'react';

export interface NotificationProps {
  content?: React.ReactNode;
  actions?: React.ReactNode;
  close?: React.ReactNode;
  duration?: number | false | null;
  pauseOnHover?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const Notification = React.forwardRef<HTMLDivElement, NotificationProps>((props, ref) => {
  const { content, actions, close, ...restProps } = props;
  return (
    <div ref={ref} {...restProps}>
      {content}
      {close && (
        <button className="close" aria-label="Close">
          {close}
        </button>
      )}
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
});

Notification.displayName = 'Notification';

export default Notification;
