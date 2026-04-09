import useNotification from './hooks/useNotification';
import Notice from './legacy/Notice';
import type { NotificationAPI, NotificationConfig } from './hooks/useNotification';
import NotificationProvider from './legacy/NotificationProvider';
import Progress from './Progress';
import type { ComponentsType } from './Notification';
import type { NotificationProgressProps } from './Progress';

export { useNotification, Notice, NotificationProvider, Progress };
export type { NotificationAPI, NotificationConfig, ComponentsType, NotificationProgressProps };
