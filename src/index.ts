import useNotification from './hooks/useNotification';
import Notice from './legacy/Notice';
import type { NotificationAPI, NotificationConfig } from './hooks/useNotification';
import NotificationProvider from './legacy/NotificationProvider';
import Progress from './Progress';
import Notification from './Notification';
import type { ComponentsType, NotificationProps } from './Notification';
import type { NotificationProgressProps } from './Progress';

export { useNotification, Notice, NotificationProvider, Progress, Notification };
export type {
  NotificationAPI,
  NotificationConfig,
  ComponentsType,
  NotificationProps,
  NotificationProgressProps,
};
