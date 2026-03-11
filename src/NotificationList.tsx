import type { CSSMotionProps } from '@rc-component/motion';
import * as React from 'react';

export type Placement = 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight';

export type StackConfig =
  | boolean
  | {
      threshold?: number;
      offset?: number;
      gap?: number;
    };

export interface NotificationListProps {
  prefixCls?: string;
  getContainer?: () => HTMLElement | ShadowRoot;
  placement?: Placement;
  pauseOnHover?: boolean;
  stack?: StackConfig;
  maxCount?: number;
  motion?: CSSMotionProps | ((placement: Placement) => CSSMotionProps);
}

const NotificationList: React.FC<NotificationListProps> = () => {
  return null;
};

export default NotificationList;
