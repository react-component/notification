import * as React from 'react';
import type { NodePosition } from './useListPosition';

function clampScrollOffset(offset: number, maxScroll: number) {
  return Math.min(0, Math.max(-maxScroll, offset));
}

function getViewportInnerHeight(node: HTMLDivElement | null) {
  if (!node) {
    return 0;
  }

  const { paddingBottom, paddingTop } = window.getComputedStyle(node);

  return node.clientHeight - parseFloat(paddingTop) - parseFloat(paddingBottom);
}

function getMaxScroll(viewportNode: HTMLDivElement | null, contentNode: HTMLDivElement | null) {
  const viewportHeight = getViewportInnerHeight(viewportNode);
  const measuredContentHeight = contentNode?.scrollHeight ?? 0;

  return Math.max(measuredContentHeight - viewportHeight, 0);
}

export default function useListScroll(
  keyList: string[],
  notificationPosition: Map<string, NodePosition>,
) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const prevKeyListRef = React.useRef<string[]>(keyList);
  const prevNotificationPositionRef = React.useRef<Map<string, NodePosition>>(new Map());
  const scrollOffsetRef = React.useRef(0);
  const [scrollOffset, setScrollOffset] = React.useState(0);

  const syncScrollOffset = React.useCallback((nextOffset: number) => {
    const maxScroll = getMaxScroll(viewportRef.current, contentRef.current);
    const mergedOffset = clampScrollOffset(nextOffset, maxScroll);

    scrollOffsetRef.current = mergedOffset;
    setScrollOffset((prev) => (prev === mergedOffset ? prev : mergedOffset));
  }, []);

  React.useLayoutEffect(() => {
    const prevKeyList = prevKeyListRef.current;
    const prevNotificationPosition = prevNotificationPositionRef.current;

    if (scrollOffsetRef.current < 0) {
      const prependCount = prevKeyList.length
        ? keyList.findIndex((key) => key === prevKeyList[0])
        : -1;
      const removedCount = keyList.length ? prevKeyList.findIndex((key) => key === keyList[0]) : -1;

      if (prependCount > 0) {
        const prependHeight = notificationPosition.get(prevKeyList[0])?.y ?? 0;
        syncScrollOffset(scrollOffsetRef.current - prependHeight);
      } else if (removedCount > 0) {
        const removedHeight = keyList[0] ? (prevNotificationPosition.get(keyList[0])?.y ?? 0) : 0;
        syncScrollOffset(scrollOffsetRef.current + removedHeight);
      } else {
        syncScrollOffset(scrollOffsetRef.current);
      }
    } else {
      syncScrollOffset(scrollOffsetRef.current);
    }

    prevKeyListRef.current = keyList;
    prevNotificationPositionRef.current = new Map(notificationPosition);
  }, [keyList, notificationPosition, syncScrollOffset]);

  React.useLayoutEffect(() => {
    const viewportNode = viewportRef.current;
    const contentNode = contentRef.current;

    if (!viewportNode || !contentNode || typeof ResizeObserver === 'undefined') {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      syncScrollOffset(scrollOffsetRef.current);
    });

    resizeObserver.observe(viewportNode);
    resizeObserver.observe(contentNode);

    return () => {
      resizeObserver.disconnect();
    };
  }, [syncScrollOffset]);

  const onWheel = React.useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      const maxScroll = getMaxScroll(viewportRef.current, contentRef.current);

      if (!maxScroll) {
        return;
      }

      event.preventDefault();

      const nextOffset = clampScrollOffset(scrollOffsetRef.current - event.deltaY, maxScroll);

      if (nextOffset !== scrollOffsetRef.current) {
        syncScrollOffset(nextOffset);
      }
    },
    [syncScrollOffset],
  );

  return {
    contentRef,
    onWheel,
    scrollOffset,
    viewportRef,
  };
}
