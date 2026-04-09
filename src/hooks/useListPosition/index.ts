import * as React from 'react';
import type { StackConfig } from '../../interface';
import useSizes from './useSizes';

export type NodePosition = {
  x: number;
  y: number;
};

export default function useListPosition(
  configList: { key: React.Key }[],
  stack?: StackConfig,
  gap = 0,
) {
  const [sizeMap, setNodeSize] = useSizes();

  const notificationPosition = React.useMemo(() => {
    let offsetY = 0;
    let offsetBottom = 0;
    const nextNotificationPosition = new Map<string, NodePosition>();

    configList
      .slice()
      .reverse()
      .forEach((config, index) => {
        const key = String(config.key);
        const height = sizeMap[key]?.height ?? 0;
        const nodePosition = {
          x: 0,
          y: stack && index > 0 ? offsetBottom + (stack.offset ?? 0) - height : offsetY,
        };

        nextNotificationPosition.set(key, nodePosition);
        if (stack) {
          offsetBottom = nodePosition.y + height;
        } else {
          offsetY += height + gap;
        }
      });

    return nextNotificationPosition;
  }, [configList, gap, sizeMap, stack]);

  return [notificationPosition, setNodeSize] as const;
}
