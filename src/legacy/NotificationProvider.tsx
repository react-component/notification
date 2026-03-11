import type { FC } from 'react';
import React from 'react';

export interface NotificationContextProps {
  classNames?: {
    notice?: string;
    list?: string;
  };
}

export const NotificationContext = React.createContext<NotificationContextProps>({});

export interface NotificationProviderProps extends NotificationContextProps {
  children: React.ReactNode;
}

const NotificationProvider: FC<NotificationProviderProps> = ({ children, classNames }) => {
  return (
    <NotificationContext.Provider value={{ classNames }}>{children}</NotificationContext.Provider>
  );
};

export default NotificationProvider;
