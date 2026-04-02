import pickAttrs from '@rc-component/util/lib/pickAttrs';
import * as React from 'react';

export type ClosableConfig = {
  closeIcon?: React.ReactNode;
  disabled?: boolean;
  onClose?: VoidFunction;
} & React.AriaAttributes;

export type ClosableType = boolean | ClosableConfig | null | undefined;

export type ParsedClosableConfig = ClosableConfig &
  Required<Pick<ClosableConfig, 'closeIcon' | 'disabled'>>;

export default function useClosable(
  closable?: ClosableType,
): [boolean, ParsedClosableConfig, ReturnType<typeof pickAttrs>] {
  const closableObj = React.useMemo(() => {
    if (closable === false) {
      return {
        closeIcon: null,
        disabled: true,
      };
    }

    if (typeof closable === 'object' && closable !== null) {
      return closable;
    }

    return {};
  }, [closable]);

  const closableConfig = React.useMemo<ParsedClosableConfig>(
    () => ({
      ...closableObj,
      closeIcon: 'closeIcon' in closableObj ? closableObj.closeIcon : '×',
      disabled: closableObj.disabled ?? false,
    }),
    [closableObj],
  );

  const closableAriaProps = React.useMemo(() => pickAttrs(closableConfig, true), [closableConfig]);

  return [!!closable, closableConfig, closableAriaProps];
}
