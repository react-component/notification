import * as React from 'react';

export interface NotificationProps {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  title?: React.ReactNode;
  content?: React.ReactNode;
  actions?: React.ReactNode;
  close?: React.ReactNode;
}

const Notification = React.forwardRef<HTMLDivElement, NotificationProps>((props, ref) => {
  const { children, icon, title, content, actions, close, ...restProps } = props;
  return (
    <div ref={ref} {...restProps}>
      {icon && <div className="icon">{icon}</div>}
      {title && <div className="title">{title}</div>}
      {close && (
        <button className="close" aria-label="Close">
          {close}
        </button>
      )}
      {content && <div className="content">{content}</div>}
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
});

Notification.displayName = 'Notification';

export default Notification;
