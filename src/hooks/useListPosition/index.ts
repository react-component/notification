import * as React from 'react';
import type { StackConfig } from '../useStack';
import useSizes from './useSizes';

/**
 * Calculates each notification's position and the full list height.
 */
export default function useListPosition(
  configList: { key: React.Key }[],
  stack?: StackConfig,
  gap = 0,
) {
  const [sizeMap, setNodeSize] = useSizes();

  const [notificationPosition, totalHeight, topNoticeHeight, topNoticeWidth] = React.useMemo(() => {
    let offsetY = 0;
    let nextTotalHeight = 0;
    const stackThreshold = stack?.threshold ?? 0;
    const nextNotificationPosition = new Map<string, number>();
    let nextTopNoticeHeight: number | undefined;
    let nextTopNoticeWidth: number | undefined;

    configList
      .slice()
      .reverse()
      .forEach((config, index) => {
        // Walk from newest to oldest so each notice can be positioned after the ones below it.
        const key = String(config.key);
        const height = sizeMap[key]?.height ?? 0;
        const y = stack && index > 0 ? offsetY + (stack.offset ?? 0) - height : offsetY;

        nextNotificationPosition.set(key, y);

        if (index === 0) {
          nextTopNoticeHeight = height;
          nextTopNoticeWidth = sizeMap[key]?.width ?? 0;
        }

        if (!stack || index < stackThreshold) {
          nextTotalHeight = Math.max(nextTotalHeight, y + height);
        }

        if (stack) {
          offsetY = y + height;
        } else {
          offsetY += height + gap;
        }
      });

    return [
      nextNotificationPosition,
      nextTotalHeight,
      nextTopNoticeHeight,
      nextTopNoticeWidth,
    ] as const;
  }, [configList, gap, sizeMap, stack]);

  return [notificationPosition, setNodeSize, totalHeight, topNoticeHeight, topNoticeWidth] as const;
}
