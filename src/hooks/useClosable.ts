import pickAttrs from '@rc-component/util/lib/pickAttrs';
import * as React from 'react';

export type ClosableConfig = {
  closeIcon?: React.ReactNode;
  onClose?: VoidFunction;
} & React.AriaAttributes;

export type ClosableType = boolean | ClosableConfig | null | undefined;

export type MergedClosableConfig = Omit<ClosableConfig, 'closeIcon'> & {
  closeIcon: React.ReactNode;
};

const EMPTY_CLOSABLE: ClosableConfig = {};

function normalizeClosable(closable?: ClosableType): ClosableConfig {
  if (typeof closable === 'object' && closable !== null) {
    return closable;
  }

  return EMPTY_CLOSABLE;
}

export default function useClosable(
  closable?: ClosableType,
): [boolean, MergedClosableConfig, ReturnType<typeof pickAttrs>] {
  const closableObj = React.useMemo(() => normalizeClosable(closable), [closable]);

  const closableConfig = React.useMemo<MergedClosableConfig>(
    () => ({
      ...closableObj,
      closeIcon: closableObj.closeIcon ?? 'x',
    }),
    [closableObj],
  );

  const closableAriaProps = React.useMemo(() => pickAttrs(closableConfig, true), [closableConfig]);

  return [!!closable, closableConfig, closableAriaProps];
}
