import { useNotification } from '../src';
import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';

require('../assets/index.less');

describe('stack', () => {
  it('support stack', () => {
    const Demo = () => {
      const [api, holder] = useNotification({
        stack: { threshold: 3 },
      });
      return (
        <>
          <button
            type="button"
            onClick={() => {
              api.open({
                content: <div className="context-content">Test</div>,
                duration: false,
              });
            }}
          />
          {holder}
        </>
      );
    };

    const { container } = render(<Demo />);
    for (let i = 0; i < 3; i++) {
      fireEvent.click(container.querySelector('button'));
    }
    expect(document.querySelectorAll('.rc-notification-notice')).toHaveLength(3);
    expect(document.querySelector('.rc-notification-stack')).toBeTruthy();
    expect(document.querySelector('.rc-notification-stack-expanded')).toBeTruthy();

    for (let i = 0; i < 2; i++) {
      fireEvent.click(container.querySelector('button'));
    }
    expect(document.querySelectorAll('.rc-notification-notice')).toHaveLength(5);
    expect(document.querySelector('.rc-notification-stack-expanded')).toBeFalsy();

    fireEvent.mouseEnter(document.querySelector('.rc-notification-notice'));
    expect(document.querySelector('.rc-notification-stack-expanded')).toBeTruthy();
  });

  it('should collapse when amount is less than threshold', () => {
    const Demo = () => {
      const [api, holder] = useNotification({
        stack: { threshold: 3 },
      });
      return (
        <>
          <button
            type="button"
            onClick={() => {
              api.open({
                content: <div className="context-content">Test</div>,
                duration: false,
                closable: true,
              });
            }}
          />
          {holder}
        </>
      );
    };

    const { container } = render(<Demo />);
    for (let i = 0; i < 5; i++) {
      fireEvent.click(container.querySelector('button'));
    }
    expect(document.querySelectorAll('.rc-notification-notice')).toHaveLength(5);
    expect(document.querySelector('.rc-notification-stack')).toBeTruthy();
    expect(document.querySelector('.rc-notification-stack-expanded')).toBeFalsy();

    fireEvent.mouseEnter(document.querySelector('.rc-notification-notice'));
    expect(document.querySelector('.rc-notification-stack-expanded')).toBeTruthy();

    fireEvent.click(document.querySelector('.rc-notification-notice-close'));
    expect(document.querySelectorAll('.rc-notification-notice')).toHaveLength(4);
    expect(document.querySelector('.rc-notification-stack-expanded')).toBeTruthy();

    // mouseleave will not triggerred if notice is closed
    fireEvent.mouseEnter(document.querySelector('.rc-notification-notice-wrapper'));
    fireEvent.mouseLeave(document.querySelector('.rc-notification-notice-wrapper'));
    expect(document.querySelector('.rc-notification-stack-expanded')).toBeFalsy();
  });
});

describe('hover state after closing notice in stack', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should clear hover state and resume timers when closing a hovered notice', () => {
    const onClose = vi.fn();

    const Demo = () => {
      const [api, holder] = useNotification({
        stack: { threshold: 3 },
      });
      return (
        <>
          <button
            type="button"
            onClick={() => {
              api.open({
                content: <div className="context-content">Test</div>,
                duration: 1,
                closable: true,
                onClose,
              });
            }}
          />
          {holder}
        </>
      );
    };

    const { container } = render(<Demo />);

    for (let i = 0; i < 4; i++) {
      act(() => {
        fireEvent.click(container.querySelector('button'));
      });
    }
    expect(document.querySelectorAll('.rc-notification-notice')).toHaveLength(4);

    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100 }));
    });

    // Hover the topmost notification wrapper
    const wrappers = document.querySelectorAll('.rc-notification-notice-wrapper');
    act(() => {
      fireEvent.mouseEnter(wrappers[wrappers.length - 1]);
    });

    // Timers should be paused while hovering
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(document.querySelectorAll('.rc-notification-notice')).toHaveLength(4);

    // Close the hovered notification via close button
    act(() => {
      const closeButtons = document.querySelectorAll('.rc-notification-notice-close');
      fireEvent.click(closeButtons[closeButtons.length - 1]);
    });
    expect(document.querySelectorAll('.rc-notification-notice')).toHaveLength(3);

    // Flush requestAnimationFrame so hover state recalculation takes effect
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Remaining notices should auto-close since hover state was properly cleared
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(document.querySelectorAll('.rc-notification-notice')).toHaveLength(0);
    expect(onClose).toHaveBeenCalledTimes(4);
  });

  it('should keep hover state when mouse is still over a notice after close', () => {
    const mockRect = {
      top: 0,
      left: 0,
      bottom: 200,
      right: 300,
      width: 300,
      height: 200,
      x: 0,
      y: 0,
      toJSON: () => {},
    };
    const spy = vi
      .spyOn(Element.prototype, 'getBoundingClientRect')
      .mockReturnValue(mockRect as DOMRect);

    const Demo = () => {
      const [api, holder] = useNotification({
        stack: { threshold: 3 },
      });
      return (
        <>
          <button
            type="button"
            onClick={() => {
              api.open({
                content: <div className="context-content">Test</div>,
                duration: 1,
                closable: true,
              });
            }}
          />
          {holder}
        </>
      );
    };

    const { container } = render(<Demo />);

    for (let i = 0; i < 4; i++) {
      act(() => {
        fireEvent.click(container.querySelector('button'));
      });
    }
    expect(document.querySelectorAll('.rc-notification-notice')).toHaveLength(4);

    // Mouse position inside the mocked bounding rect
    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100 }));
    });

    const wrappers = document.querySelectorAll('.rc-notification-notice-wrapper');
    act(() => {
      fireEvent.mouseEnter(wrappers[wrappers.length - 1]);
    });

    // Close the hovered notification
    act(() => {
      const closeButtons = document.querySelectorAll('.rc-notification-notice-close');
      fireEvent.click(closeButtons[closeButtons.length - 1]);
    });
    expect(document.querySelectorAll('.rc-notification-notice')).toHaveLength(3);

    // Flush RAF - mouse is within bounding rect so hover state should persist
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Timers should still be paused because mouse is detected over a notice
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(document.querySelectorAll('.rc-notification-notice')).toHaveLength(3);

    spy.mockRestore();
  });
});
