import * as React from 'react';

export type NodeSize = {
  width: number;
  height: number;
};

export type NodeSizeMap = Record<string, NodeSize>;

/**
 * Stores measured node sizes by key and exposes a ref callback to update them.
 */
export default function useSizes() {
  const [sizeMap, setSizeMap] = React.useState<NodeSizeMap>({});

  const setNodeSize = React.useCallback((key: string, node: HTMLDivElement | null) => {
    if (!node) {
      setSizeMap((prevSizeMap) => {
        if (!(key in prevSizeMap)) {
          return prevSizeMap;
        }

        const nextSizeMap = { ...prevSizeMap };
        delete nextSizeMap[key];
        return nextSizeMap;
      });
      return;
    }

    const nextSize = {
      width: node.offsetWidth,
      height: node.offsetHeight,
    };
    setSizeMap((prevSizeMap) => {
      const prevSize = prevSizeMap[key];

      if (prevSize && prevSize.width === nextSize.width && prevSize.height === nextSize.height) {
        return prevSizeMap;
      }

      return {
        ...prevSizeMap,
        [key]: nextSize,
      };
    });
  }, []);

  return [sizeMap, setNodeSize] as const;
}
