import * as React from 'react';

export interface NotificationProgressProps {
  className?: string;
  style?: React.CSSProperties;
  percent: number;
}

const Progress: React.FC<NotificationProgressProps> = ({ className, style, percent }) => (
  <progress className={className} max="100" value={percent} style={style} />
);

export default Progress;
