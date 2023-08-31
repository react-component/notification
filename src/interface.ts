import type React from 'react';

export type Placement = 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight';

export interface NoticeConfig {
  content?: React.ReactNode;
  duration?: number | null;
  closeIcon?: React.ReactNode;
  closable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** @private Internal usage. Do not override in your code */
  props?: React.HTMLAttributes<HTMLDivElement> & Record<string, any>;

  onClose?: VoidFunction;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export interface OpenConfig extends NoticeConfig {
  key: React.Key;
  placement?: Placement;
  content?: React.ReactNode;
  duration?: number | null;
}

export type InnerOpenConfig = OpenConfig & { times?: number };

export type Placements = Partial<Record<Placement, OpenConfig[]>>;

export type StackConfig =
  | boolean
  | {
      /**
       * When number is greater than threshold, notifications will be stacked together.
       * @default 3
       */
      threshold?: number;
      /**
       * Offset when notifications are stacked together.
       * @default 8
       */
      offset?: number;
      /**
       * Spacing between each notification when expanded.
       */
      gap?: number;
    };
