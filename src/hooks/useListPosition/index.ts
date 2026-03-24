import * as React from 'react';
import useSizes from './useSizes';

export type NodePosition = {
  x: number;
  y: number;
};

export default function useListPosition(configList: { key: React.Key }[]) {
  const [sizeMap, setNodeSize] = useSizes();

  const notificationPosition = React.useMemo(() => {
    let offsetY = 0;
    const nextNotificationPosition = new Map<string, NodePosition>();

    configList.forEach((config) => {
      const key = String(config.key);
      const nodePosition = {
        x: 0,
        y: offsetY,
      };

      nextNotificationPosition.set(key, nodePosition);
      offsetY += sizeMap[key]?.height ?? 0;
    });

    return nextNotificationPosition;
  }, [configList, sizeMap]);

  return [notificationPosition, setNodeSize] as const;
}
