import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { useNotification } from '../src';
import type { NotificationAPI, NotificationConfig } from '../src';

require('../assets/index.less');

// 🔥 Note: In latest version. We remove static function.
// This only test for hooks usage.
describe('Notification.Basic', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function renderDemo(config?: NotificationConfig) {
    let instance: NotificationAPI;

    const Demo = () => {
      const [api, holder] = useNotification(config);
      instance = api;

      return holder;
    };

    const renderResult = render(<Demo />);

    return { ...renderResult, instance };
  }

  it('works', () => {
    const { instance, unmount } = renderDemo();

    act(() => {
      instance.open({
        content: <p className="test">1</p>,
        duration: 0.1,
      });
    });
    expect(document.querySelector('.test')).toBeTruthy();

    act(() => {
      jest.runAllTimers();
    });
    expect(document.querySelector('.test')).toBeFalsy();

    unmount();
  });

  it('works with custom close icon', () => {
    const { instance } = renderDemo({
      closeIcon: <span className="test-icon">test-close-icon</span>,
    });

    act(() => {
      instance.open({
        content: <p className="test">1</p>,
        closable: true,
        duration: 0,
      });
    });

    expect(document.querySelectorAll('.test')).toHaveLength(1);
    expect(document.querySelector('.test-icon').textContent).toEqual('test-close-icon');
  });

  it('works with multi instance', () => {
    const { instance } = renderDemo();

    act(() => {
      instance.open({
        content: <p className="test">1</p>,
        duration: 0.1,
      });
    });
    act(() => {
      instance.open({
        content: <p className="test">2</p>,
        duration: 0.1,
      });
    });

    expect(document.querySelectorAll('.test')).toHaveLength(2);

    act(() => {
      jest.runAllTimers();
    });
    expect(document.querySelectorAll('.test')).toHaveLength(0);
  });

  it('destroy works', () => {
    const { instance } = renderDemo();

    act(() => {
      instance.open({
        content: (
          <p id="test" className="test">
            222222
          </p>
        ),
        duration: 0.1,
      });
    });
    expect(document.querySelector('.test')).toBeTruthy();

    act(() => {
      instance.destroy();
    });
    expect(document.querySelector('.test')).toBeFalsy();
  });

  it('getContainer works', () => {
    const id = 'get-container-test';
    const div = document.createElement('div');
    div.id = id;
    div.innerHTML = '<span>test</span>';
    document.body.appendChild(div);

    const { instance } = renderDemo({
      getContainer: () => document.getElementById('get-container-test'),
    });

    act(() => {
      instance.open({
        content: (
          <p id="test" className="test">
            222222
          </p>
        ),
        duration: 1,
      });
    });
    expect(document.getElementById(id).children).toHaveLength(2);

    act(() => {
      instance.destroy();
    });
    expect(document.getElementById(id).children).toHaveLength(1);

    document.body.removeChild(div);
  });

  it('remove notify works', () => {
    const { instance, unmount } = renderDemo();

    const key = Math.random();
    const close = (k: React.Key) => {
      instance.close(k);
    };

    act(() => {
      instance.open({
        content: (
          <p className="test">
            <button type="button" id="closeButton" onClick={() => close(key)}>
              close
            </button>
          </p>
        ),
        key,
        duration: null,
      });
    });

    expect(document.querySelectorAll('.test')).toHaveLength(1);
    fireEvent.click(document.querySelector('#closeButton'));

    act(() => {
      jest.runAllTimers();
    });

    expect(document.querySelectorAll('.test')).toHaveLength(0);
    unmount();
  });

  it('update notification by key with multi instance', () => {
    const { instance } = renderDemo();

    const key = 'updatable';
    const value = 'value';
    const newValue = `new-${value}`;
    const notUpdatableValue = 'not-updatable-value';

    act(() => {
      instance.open({
        content: (
          <p id="not-updatable" className="not-updatable">
            {notUpdatableValue}
          </p>
        ),
        duration: null,
      });
    });

    act(() => {
      instance.open({
        content: (
          <p id="updatable" className="updatable">
            {value}
          </p>
        ),
        key,
        duration: null,
      });
    });

    expect(document.querySelectorAll('.updatable')).toHaveLength(1);
    expect(document.querySelector('.updatable').textContent).toEqual(value);

    act(() => {
      instance.open({
        content: (
          <p id="updatable" className="updatable">
            {newValue}
          </p>
        ),
        key,
        duration: 0.1,
      });
    });

    // Text updated successfully
    expect(document.querySelectorAll('.updatable')).toHaveLength(1);
    expect(document.querySelector('.updatable').textContent).toEqual(newValue);

    act(() => {
      jest.runAllTimers();
    });

    // Other notices are not affected
    expect(document.querySelectorAll('.not-updatable')).toHaveLength(1);
    expect(document.querySelector('.not-updatable').textContent).toEqual(notUpdatableValue);

    // Duration updated successfully
    expect(document.querySelectorAll('.updatable')).toHaveLength(0);
  });

  it('freeze notification layer when mouse over', () => {
    const { instance } = renderDemo();

    act(() => {
      instance.open({
        content: (
          <p id="freeze" className="freeze">
            freeze
          </p>
        ),
        duration: 0.3,
      });
    });

    expect(document.querySelectorAll('.freeze')).toHaveLength(1);

    // Mouse in should not remove
    fireEvent.mouseEnter(document.querySelector('.rc-notification-notice'));
    act(() => {
      jest.runAllTimers();
    });
    expect(document.querySelectorAll('.freeze')).toHaveLength(1);

    // Mouse out will remove
    fireEvent.mouseLeave(document.querySelector('.rc-notification-notice'));
    act(() => {
      jest.runAllTimers();
    });
    expect(document.querySelectorAll('.freeze')).toHaveLength(0);
  });

  describe('maxCount', () => {
    it('remove work when maxCount set', () => {
      const { instance } = renderDemo({
        maxCount: 1,
      });

      // First
      act(() => {
        instance.open({
          content: <div className="max-count">bamboo</div>,
          key: 'bamboo',
          duration: 0,
        });
      });

      // Next
      act(() => {
        instance.open({
          content: <div className="max-count">bamboo</div>,
          key: 'bamboo',
          duration: 0,
        });
      });
      expect(document.querySelectorAll('.max-count')).toHaveLength(1);

      act(() => {
        instance.close('bamboo');
      });
      expect(document.querySelectorAll('.max-count')).toHaveLength(0);
    });

    it('drop first notice when items limit exceeds', () => {
      const { instance } = renderDemo({
        maxCount: 1,
      });

      const value = 'updated last';
      act(() => {
        instance.open({
          content: <span className="test-maxcount">simple show</span>,
          duration: 0,
        });
      });

      act(() => {
        instance.open({
          content: <span className="test-maxcount">simple show</span>,
          duration: 0,
        });
      });

      act(() => {
        instance.open({
          content: <span className="test-maxcount">{value}</span>,
          duration: 0,
        });
      });

      act(() => {
        jest.runAllTimers();
      });

      expect(document.querySelectorAll('.test-maxcount')).toHaveLength(1);
      expect(document.querySelector('.test-maxcount').textContent).toEqual(value);
    });

    it('duration should work', () => {
      const { instance } = renderDemo({
        maxCount: 1,
      });

      act(() => {
        instance.open({
          content: <span className="auto-remove">bamboo</span>,
          duration: 99,
        });
      });
      expect(document.querySelector('.auto-remove').textContent).toEqual('bamboo');

      act(() => {
        instance.open({
          content: <span className="auto-remove">light</span>,
          duration: 0.5,
        });
      });
      expect(document.querySelector('.auto-remove').textContent).toEqual('light');

      act(() => {
        jest.runAllTimers();
      });
      expect(document.querySelectorAll('.auto-remove')).toHaveLength(0);
    });
  });

  it('onClick trigger', () => {
    const { instance } = renderDemo();
    let clicked = 0;

    const key = Date.now();
    const close = (k: React.Key) => {
      instance.close(k);
    };

    act(() => {
      instance.open({
        content: (
          <p className="test">
            <button type="button" id="closeButton" onClick={close.bind(null, key)}>
              close
            </button>
          </p>
        ),
        key,
        duration: null,
        onClick: () => {
          clicked += 1;
        },
      });
    });

    fireEvent.click(document.querySelector('.rc-notification-notice')); // origin latest
    expect(clicked).toEqual(1);
  });

  it('Close Notification only trigger onClose', () => {
    const { instance } = renderDemo();
    let clickCount = 0;
    let closeCount = 0;

    act(() => {
      instance.open({
        content: <p className="test">1</p>,
        closable: true,
        onClick: () => {
          clickCount += 1;
        },
        onClose: () => {
          closeCount += 1;
        },
      });
    });

    fireEvent.click(document.querySelector('.rc-notification-notice-close')); // origin latest
    expect(clickCount).toEqual(0);
    expect(closeCount).toEqual(1);
  });

  it('sets data attributes', () => {
    const { instance } = renderDemo();

    act(() => {
      instance.open({
        content: <span className="test-data-attributes">simple show</span>,
        duration: 3,
        className: 'notice-class',
        props: {
          'data-test': 'data-test-value',
          'data-testid': 'data-testid-value',
        },
      });
    });

    const notice = document.querySelectorAll('.notice-class');
    expect(notice.length).toBe(1);

    expect(notice[0].getAttribute('data-test')).toBe('data-test-value');
    expect(notice[0].getAttribute('data-testid')).toBe('data-testid-value');
  });

  it('sets aria attributes', () => {
    const { instance } = renderDemo();

    act(() => {
      instance.open({
        content: <span className="test-aria-attributes">simple show</span>,
        duration: 3,
        className: 'notice-class',
        props: {
          'aria-describedby': 'aria-describedby-value',
          'aria-labelledby': 'aria-labelledby-value',
        },
      });
    });

    const notice = document.querySelectorAll('.notice-class');
    expect(notice.length).toBe(1);
    expect(notice[0].getAttribute('aria-describedby')).toBe('aria-describedby-value');
    expect(notice[0].getAttribute('aria-labelledby')).toBe('aria-labelledby-value');
  });

  it('sets role attribute', () => {
    const { instance } = renderDemo();

    act(() => {
      instance.open({
        content: <span className="test-aria-attributes">simple show</span>,
        duration: 3,
        className: 'notice-class',
        props: { role: 'alert' },
      });
    });

    const notice = document.querySelectorAll('.notice-class');
    expect(notice.length).toBe(1);
    expect(notice[0].getAttribute('role')).toBe('alert');
  });

  it('should style work', () => {
    const { instance } = renderDemo({
      style: () => ({
        content: 'little',
      }),
    });

    act(() => {
      instance.open({});
    });

    expect(document.querySelector('.rc-notification')).toHaveStyle({
      content: 'little',
    });
  });

  it('should className work', () => {
    const { instance } = renderDemo({
      className: (placement) => `bamboo-${placement}`,
    });

    act(() => {
      instance.open({});
    });

    expect(document.querySelector('.bamboo-topRight')).toBeTruthy();
  });

  it('placement', () => {
    const { instance } = renderDemo();

    act(() => {
      instance.open({
        placement: 'bottomLeft',
      });
    });

    expect(document.querySelector('.rc-notification')).toHaveClass('rc-notification-bottomLeft');
  });

  it('motion as function', () => {
    const motionFn = jest.fn();

    const { instance } = renderDemo({
      motion: motionFn,
    });

    act(() => {
      instance.open({
        placement: 'bottomLeft',
      });
    });

    expect(motionFn).toHaveBeenCalledWith('bottomLeft');
  });

  it('notice when empty', () => {
    const onAllRemoved = jest.fn();

    const { instance } = renderDemo({
      onAllRemoved,
    });

    expect(onAllRemoved).not.toHaveBeenCalled();

    // Open!
    act(() => {
      instance.open({
        duration: 0.1,
      });
    });
    expect(onAllRemoved).not.toHaveBeenCalled();

    // Hide
    act(() => {
      jest.runAllTimers();
    });
    expect(onAllRemoved).toHaveBeenCalled();

    // Open again
    onAllRemoved.mockReset();

    act(() => {
      instance.open({
        duration: 0,
        key: 'first',
      });
    });

    act(() => {
      instance.open({
        duration: 0,
        key: 'second',
      });
    });

    expect(onAllRemoved).not.toHaveBeenCalled();

    // Close first
    act(() => {
      instance.close('first');
    });
    expect(onAllRemoved).not.toHaveBeenCalled();

    // Close second
    act(() => {
      instance.close('second');
    });
    expect(onAllRemoved).toHaveBeenCalled();
  });
  it('when the same key message is closing, dont open new until it closed', () => {
    const onAllRemoved = jest.fn();
    const { instance } = renderDemo({
      onAllRemoved,
    });
    act(() => {
      instance.open({
        content: 'test',
        key: 'success',
        duration: 0.01,
      });
    });

    let cnt = 100;
    while (--cnt) {
      fireEvent.click(document.querySelector('.rc-notification-notice'));
    }

    act(() => {
      jest.runAllTimers();
    });

    expect(onAllRemoved).toHaveBeenCalled();
  });
});
