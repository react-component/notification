import * as React from 'react';
import type { NodePosition } from './useListPosition';

/**
 * Measures how much the list content can scroll inside the viewport.
 */
function getMaxScroll(viewportNode: HTMLDivElement | null, contentNode: HTMLDivElement | null) {
  if (!viewportNode) {
    return 0;
  }

  const { paddingBottom, paddingTop } = window.getComputedStyle(viewportNode);
  const viewportHeight =
    viewportNode.clientHeight - (parseFloat(paddingTop) || 0) - (parseFloat(paddingBottom) || 0);

  return Math.max((contentNode?.scrollHeight ?? 0) - viewportHeight, 0);
}

/**
 * Manages wheel and touch scrolling for the notification list.
 */
export default function useListScroll(
  keyList: string[],
  notificationPosition: Map<string, NodePosition>,
  expanded = false,
) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const touchStartRef = React.useRef<{ y: number; offset: number } | null>(null);
  const prevRef = React.useRef({ keyList, notificationPosition });
  const scrollOffsetRef = React.useRef(0);
  const [scrollOffset, setScrollOffset] = React.useState(0);

  /**
   * Applies the next offset and keeps it within the current scroll bounds.
   */
  const syncScrollOffset = React.useCallback((nextOffset: number) => {
    const maxScroll = getMaxScroll(viewportRef.current, contentRef.current);
    // Clamp the offset so the content never scrolls past its visible range.
    const mergedOffset = Math.max(-maxScroll, Math.min(0, nextOffset));

    scrollOffsetRef.current = mergedOffset;
    setScrollOffset(mergedOffset);
  }, []);

  React.useLayoutEffect(() => {
    const { keyList: prevKeyList, notificationPosition: prevNotificationPosition } =
      prevRef.current;
    let nextOffset = scrollOffsetRef.current;

    if (nextOffset < 0) {
      const prevFirstKey = prevKeyList[0];
      const firstKey = keyList[0];
      const prependCount = prevFirstKey === undefined ? -1 : keyList.indexOf(prevFirstKey);
      const removedCount = firstKey === undefined ? -1 : prevKeyList.indexOf(firstKey);

      if (prependCount > 0) {
        nextOffset -= notificationPosition.get(prevFirstKey)?.y ?? 0;
      } else if (removedCount > 0) {
        nextOffset += prevNotificationPosition.get(firstKey)?.y ?? 0;
      }
    }

    syncScrollOffset(nextOffset);
    prevRef.current = { keyList, notificationPosition };
  }, [keyList, notificationPosition, syncScrollOffset]);

  React.useLayoutEffect(() => {
    const viewportNode = viewportRef.current;
    const contentNode = contentRef.current;

    if (!viewportNode || !contentNode || typeof ResizeObserver === 'undefined') {
      return;
    }

    const resizeObserver = new ResizeObserver(() => syncScrollOffset(scrollOffsetRef.current));

    resizeObserver.observe(viewportNode);
    resizeObserver.observe(contentNode);

    return () => resizeObserver.disconnect();
  }, [syncScrollOffset]);

  React.useEffect(() => {
    if (expanded) {
      return;
    }

    touchStartRef.current = null;
    syncScrollOffset(0);
  }, [expanded, syncScrollOffset]);

  /**
   * Updates the list offset from mouse wheel input.
   */
  const onWheel = React.useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      if (!getMaxScroll(viewportRef.current, contentRef.current)) {
        return;
      }

      event.preventDefault();
      syncScrollOffset(scrollOffsetRef.current - event.deltaY);
    },
    [syncScrollOffset],
  );

  /**
   * Stores the touch start position and current offset.
   */
  const onTouchStart = React.useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    touchStartRef.current = touch ? { y: touch.clientY, offset: scrollOffsetRef.current } : null;
  }, []);

  /**
   * Updates the list offset while the user is dragging.
   */
  const onTouchMove = React.useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      const touch = event.touches[0];
      const touchStart = touchStartRef.current;

      if (!touch || !touchStart || !getMaxScroll(viewportRef.current, contentRef.current)) {
        return;
      }

      event.preventDefault();
      syncScrollOffset(touchStart.offset + touch.clientY - touchStart.y);
    },
    [syncScrollOffset],
  );

  /**
   * Clears the active touch scroll state.
   */
  const onTouchEnd = React.useCallback(() => {
    touchStartRef.current = null;
  }, []);

  return {
    contentRef,
    onTouchEnd,
    onTouchMove,
    onTouchStart,
    onWheel,
    scrollOffset,
    viewportRef,
  };
}
