import * as React from 'react';

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

const NotificationProvider: React.FC<NotificationProviderProps> = ({ children, classNames }) => {
  const context = React.useMemo<NotificationContextProps>(() => ({ classNames }), [classNames]);

  return <NotificationContext.Provider value={context}>{children}</NotificationContext.Provider>;
};

export default NotificationProvider;
