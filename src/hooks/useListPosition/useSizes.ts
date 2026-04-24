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
  const cleanUpMapRef = React.useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const setNodeSize = React.useCallback((key: string, node: HTMLDivElement | null) => {
    if (!node) {
      cleanUpMapRef.current[key] = setTimeout(() => {
        delete cleanUpMapRef.current[key];

        setSizeMap((prevSizeMap) => {
          if (!(key in prevSizeMap)) {
            return prevSizeMap;
          }

          const nextSizeMap = { ...prevSizeMap };
          delete nextSizeMap[key];
          return nextSizeMap;
        });
      });
      return;
    }

    clearTimeout(cleanUpMapRef.current[key]);
    delete cleanUpMapRef.current[key];

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

  React.useEffect(
    () => () => {
      Object.values(cleanUpMapRef.current).forEach((timer) => {
        clearTimeout(timer);
      });
    },
    [],
  );

  return [sizeMap, setNodeSize] as const;
}
