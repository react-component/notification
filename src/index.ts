import useNotification from './hooks/useNotification';
import Notice from './legacy/Notice';
import type { NotificationAPI, NotificationConfig } from './hooks/useNotification';
import NotificationProvider from './legacy/NotificationProvider';

export { useNotification, Notice, NotificationProvider };
export type { NotificationAPI, NotificationConfig };
