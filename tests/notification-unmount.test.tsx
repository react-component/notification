import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { Notification } from '../src';

describe('Notification unmount', () => {
  it.each(['hovered', 'never hovered', 'already left'])(
    'only calls leave when still hovered: %s',
    (state) => {
      const onMouseLeave = vi.fn();
      const { container, unmount } = render(
        <Notification prefixCls="rc-notification" duration={0} onMouseLeave={onMouseLeave} />,
      );
      const notice = container.firstElementChild!;

      if (state !== 'never hovered') {
        fireEvent.mouseEnter(notice);
      }
      if (state === 'already left') {
        fireEvent.mouseLeave(notice);
        expect(onMouseLeave).toHaveBeenCalledTimes(1);
        onMouseLeave.mockClear();
      }

      unmount();
      expect(onMouseLeave).toHaveBeenCalledTimes(state === 'hovered' ? 1 : 0);
      if (state === 'hovered') {
        expect(onMouseLeave).toHaveBeenCalledWith(undefined);
      }
    },
  );
});
