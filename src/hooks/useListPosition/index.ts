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
    const nextNotificationPosition = new Map<string, NodePosition>();

    configList
      .slice()
      .reverse()
      .forEach((config) => {
        const key = String(config.key);
        const nodePosition = {
          x: 0,
          y: offsetY,
        };

        nextNotificationPosition.set(key, nodePosition);
        offsetY += (stack ? stack.offset : sizeMap[key]?.height) ?? 0;

        if (!stack) {
          offsetY += gap;
        }
      });

    return nextNotificationPosition;
  }, [configList, gap, sizeMap, stack]);

  return [notificationPosition, setNodeSize] as const;
}
