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

/**
 * Normalizes the closable option into a boolean flag, config, and aria props.
 */
export default function useClosable(
  closable?: ClosableType,
): [boolean, ParsedClosableConfig, ReturnType<typeof pickAttrs>] {
  // Convert boolean shorthand into the object shape used by render logic.
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

  // Fill defaults so callers can read closeIcon and disabled without extra guards.
  const closableConfig = React.useMemo<ParsedClosableConfig>(
    () => ({
      ...closableObj,
      closeIcon: 'closeIcon' in closableObj ? closableObj.closeIcon : '×',
      disabled: closableObj.disabled ?? false,
    }),
    [closableObj],
  );

  // Forward aria-* props from the closable config to the close button.
  const closableAriaProps = React.useMemo(() => pickAttrs(closableConfig, true), [closableConfig]);

  return [!!closable, closableConfig, closableAriaProps];
}
