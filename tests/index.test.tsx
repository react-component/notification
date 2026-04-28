import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { act } from 'react-dom/test-utils';
import type { NotificationAPI, NotificationConfig, NotificationProgressProps } from '../src';
import { Notification, useNotification } from '../src';

require('../assets/index.less');

// 🔥 Note: In latest version. We remove static function.
// This only test for hooks usage.
describe('Notification.Basic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
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

  function step(time: number, slice = 16) {
    let current = 0;

    while (current < time) {
      vi.advanceTimersByTime(slice);
      current += slice;
    }
  }

  it('works', () => {
    const { instance, unmount } = renderDemo();

    act(() => {
      instance.open({
        description: <p className="test">1</p>,
        duration: 0.1,
      });
    });
    expect(document.querySelector('.test')).toBeTruthy();

    act(() => {
      vi.runAllTimers();
    });
    expect(document.querySelector('.test')).toBeFalsy();

    unmount();
  });

  it('works with custom close icon', () => {
    const { instance } = renderDemo();

    act(() => {
      instance.open({
        description: <p className="test">1</p>,
        closable: {
          closeIcon: <span className="test-icon">test-close-icon</span>,
        },
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
        description: <p className="test">1</p>,
        duration: 0.1,
      });
    });
    act(() => {
      instance.open({
        description: <p className="test">2</p>,
        duration: 0.1,
      });
    });

    expect(document.querySelectorAll('.test')).toHaveLength(2);

    act(() => {
      vi.runAllTimers();
    });
    expect(document.querySelectorAll('.test')).toHaveLength(0);
  });

  it('destroy works', () => {
    const { instance } = renderDemo();

    act(() => {
      instance.open({
        description: (
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
        description: (
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
        description: (
          <p className="test">
            <button type="button" id="closeButton" onClick={() => close(key)}>
              close
            </button>
          </p>
        ),
        key,
        duration: false,
      });
    });

    expect(document.querySelectorAll('.test')).toHaveLength(1);
    fireEvent.click(document.querySelector('#closeButton'));

    act(() => {
      vi.runAllTimers();
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
        description: (
          <p id="not-updatable" className="not-updatable">
            {notUpdatableValue}
          </p>
        ),
        duration: false,
      });
    });

    act(() => {
      instance.open({
        description: (
          <p id="updatable" className="updatable">
            {value}
          </p>
        ),
        key,
        duration: false,
      });
    });

    expect(document.querySelectorAll('.updatable')).toHaveLength(1);
    expect(document.querySelector('.updatable').textContent).toEqual(value);

    act(() => {
      instance.open({
        description: (
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
      vi.runAllTimers();
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
        description: (
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
      vi.runAllTimers();
    });
    expect(document.querySelectorAll('.freeze')).toHaveLength(1);

    // Mouse out will remove
    fireEvent.mouseLeave(document.querySelector('.rc-notification-notice'));
    act(() => {
      vi.runAllTimers();
    });
    expect(document.querySelectorAll('.freeze')).toHaveLength(0);
  });

  it('continue timing after hover', () => {
    const { instance } = renderDemo({
      duration: 1,
    });

    act(() => {
      instance.open({
        description: <p className="test">1</p>,
      });
    });

    expect(document.querySelector('.test')).toBeTruthy();

    // Wait for 500ms
    act(() => {
      step(500);
    });
    expect(document.querySelector('.test')).toBeTruthy();

    // Mouse in should not remove
    fireEvent.mouseEnter(document.querySelector('.rc-notification-notice'));
    act(() => {
      // Elapsed time should not advance while hovering.
      step(1000);
    });
    expect(document.querySelector('.test')).toBeTruthy();

    // Mouse out should not remove until 500ms later
    fireEvent.mouseLeave(document.querySelector('.rc-notification-notice'));
    act(() => {
      step(450);
    });
    expect(document.querySelector('.test')).toBeTruthy();

    act(() => {
      step(100);
    });
    expect(document.querySelector('.test')).toBeFalsy();
  });

  describe('pauseOnHover is false', () => {
    it('does not freeze when pauseOnHover is false', () => {
      const { instance } = renderDemo();

      act(() => {
        instance.open({
          description: (
            <p id="not-freeze" className="not-freeze">
              not freeze
            </p>
          ),
          duration: 0.3,
          pauseOnHover: false,
        });
      });

      expect(document.querySelectorAll('.not-freeze')).toHaveLength(1);

      // Mouse in should remove
      fireEvent.mouseEnter(document.querySelector('.rc-notification-notice'));
      act(() => {
        vi.runAllTimers();
      });
      expect(document.querySelectorAll('.not-freeze')).toHaveLength(0);
    });

    it('continue timing after hover', () => {
      const { instance } = renderDemo({
        duration: 1,
        pauseOnHover: false,
      });

      act(() => {
        instance.open({
          description: <p className="test">1</p>,
        });
      });

      expect(document.querySelector('.test')).toBeTruthy();

      // Wait for 500ms
      act(() => {
        step(500);
      });
      expect(document.querySelector('.test')).toBeTruthy();

      // Mouse in should not remove
      fireEvent.mouseEnter(document.querySelector('.rc-notification-notice'));
      act(() => {
        step(200);
      });
      expect(document.querySelector('.test')).toBeTruthy();

      // Mouse out should not remove until 500ms later
      fireEvent.mouseLeave(document.querySelector('.rc-notification-notice'));
      act(() => {
        step(200);
      });
      expect(document.querySelector('.test')).toBeTruthy();

      //
      act(() => {
        step(100);
      });
      expect(document.querySelector('.test')).toBeFalsy();
    });
  });

  describe('maxCount', () => {
    it('remove work when maxCount set', () => {
      const { instance } = renderDemo({
        maxCount: 1,
      });

      // First
      act(() => {
        instance.open({
          description: <div className="max-count">bamboo</div>,
          key: 'bamboo',
          duration: 0,
        });
      });

      // Next
      act(() => {
        instance.open({
          description: <div className="max-count">bamboo</div>,
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
          description: <span className="test-maxcount">simple show</span>,
          duration: 0,
        });
      });

      act(() => {
        instance.open({
          description: <span className="test-maxcount">simple show</span>,
          duration: 0,
        });
      });

      act(() => {
        instance.open({
          description: <span className="test-maxcount">{value}</span>,
          duration: 0,
        });
      });

      act(() => {
        vi.runAllTimers();
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
          description: <span className="auto-remove">bamboo</span>,
          duration: 99,
        });
      });
      expect(document.querySelector('.auto-remove').textContent).toEqual('bamboo');

      act(() => {
        instance.open({
          description: <span className="auto-remove">light</span>,
          duration: 0.5,
        });
      });
      expect(document.querySelector('.auto-remove').textContent).toEqual('light');

      act(() => {
        vi.runAllTimers();
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
        description: (
          <p className="test">
            <button type="button" id="closeButton" onClick={close.bind(null, key)}>
              close
            </button>
          </p>
        ),
        key,
        duration: false,
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
        description: <p className="test">1</p>,
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
        description: <span className="test-data-attributes">simple show</span>,
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
        description: <span className="test-aria-attributes">simple show</span>,
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
        description: <span className="test-aria-attributes">simple show</span>,
        duration: 3,
        className: 'notice-class',
        props: { role: 'alert' },
      });
    });

    const notice = document.querySelectorAll('.notice-class');
    expect(notice.length).toBe(1);
    expect(notice[0].getAttribute('role')).toBe('alert');
  });

  it('sets role attribute from notification config', () => {
    const { instance } = renderDemo();

    act(() => {
      instance.open({
        title: 'bamboo',
        description: <span className="test-role-description">simple show</span>,
        icon: <span className="test-role-icon" />,
        actions: <button type="button">light</button>,
        role: 'status',
        closable: true,
        showProgress: true,
        duration: 3,
      });
    });

    const notice = document.querySelector('.rc-notification-notice');

    expect(notice).toHaveAttribute('role', 'status');
    expect(notice.querySelector('.rc-notification-notice-content')).toBeFalsy();
    expect(notice.querySelector('.rc-notification-notice-title')).toBeTruthy();
    expect(notice.querySelector('.rc-notification-notice-description')).toBeTruthy();
    expect(notice.querySelector('.rc-notification-notice-icon')).toBeTruthy();
    expect(notice.querySelector('.rc-notification-notice-actions')).toBeTruthy();
    expect(notice.querySelector('.rc-notification-notice-close')).toBeTruthy();
    expect(notice.querySelector('.rc-notification-notice-progress')).toBeTruthy();
  });

  it('sets default role attribute', () => {
    const { instance } = renderDemo();

    act(() => {
      instance.open({
        description: <span className="test-default-role">simple show</span>,
      });
    });

    expect(document.querySelector('.rc-notification-notice')).toHaveAttribute('role', 'alert');
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

  it('should open style and className work', () => {
    const { instance } = renderDemo();

    act(() => {
      instance.open({
        style: {
          content: 'little',
        },
        className: 'bamboo',
      });
    });

    expect(document.querySelector('.rc-notification-notice')).toHaveStyle({
      content: 'little',
    });
    expect(document.querySelector('.rc-notification-notice')).toHaveClass('bamboo');
  });

  it('should support zero offset', () => {
    const { container, rerender } = render(
      <Notification prefixCls="rc-notification" description="little" offset={10} />,
    );

    expect(container.querySelector('.rc-notification-notice')).toHaveStyle({
      '--notification-y': '10px',
    });

    rerender(<Notification prefixCls="rc-notification" description="little" offset={0} />);

    expect(container.querySelector('.rc-notification-notice')).toHaveStyle({
      '--notification-y': '0px',
    });
  });

  it('should not render section for single content node', () => {
    const { instance } = renderDemo();

    act(() => {
      instance.open({
        description: 'little',
      });
    });

    expect(document.querySelector('.rc-notification-notice-section')).toBeFalsy();
    expect(document.querySelector('.rc-notification-notice-description')).toBeTruthy();
  });

  it('should render section when title and description both exist', () => {
    const { instance } = renderDemo();

    act(() => {
      instance.open({
        title: 'bamboo',
        description: 'little',
        styles: {
          section: {
            content: 'light',
          },
        },
        classNames: {
          section: 'section-class',
        },
      });
    });

    expect(document.querySelector('.rc-notification-notice-section')).toHaveStyle({
      content: 'light',
    });
    expect(document.querySelector('.rc-notification-notice-section')).toHaveClass('section-class');
  });

  it('should open styles and classNames work', () => {
    const { instance } = renderDemo();

    act(() => {
      instance.open({
        icon: <span />,
        styles: {
          wrapper: {
            content: 'little',
          },
        },
        classNames: {
          wrapper: 'bamboo',
        },
      });
    });

    expect(document.querySelector('.bamboo')).toHaveStyle({
      content: 'little',
    });
    expect(document.querySelector('.bamboo')).toHaveClass('bamboo');
  });

  it('should support semantic content styles and classNames', () => {
    const { instance } = renderDemo({
      classNames: {
        title: 'global-title',
        description: 'global-description',
        actions: 'global-actions',
        icon: 'global-icon',
      },
      styles: {
        title: {
          content: 'global-title',
        },
        description: {
          content: 'global-description',
        },
        actions: {
          content: 'global-actions',
        },
        icon: {
          content: 'global-icon',
        },
      },
    });

    act(() => {
      instance.open({
        title: 'bamboo',
        description: 'little',
        icon: <span />,
        actions: <button type="button">light</button>,
        classNames: {
          title: 'notice-title',
          description: 'notice-description',
          actions: 'notice-actions',
          icon: 'notice-icon',
        },
        styles: {
          title: {
            marginTop: 1,
          },
          description: {
            marginRight: 2,
          },
          actions: {
            marginBottom: 3,
          },
          icon: {
            marginLeft: 4,
          },
        },
      });
    });

    expect(document.querySelector('.rc-notification-notice-title')).toHaveClass(
      'global-title',
      'notice-title',
    );
    expect(document.querySelector('.rc-notification-notice-title')).toHaveStyle({
      content: 'global-title',
      marginTop: '1px',
    });
    expect(document.querySelector('.rc-notification-notice-description')).toHaveClass(
      'global-description',
      'notice-description',
    );
    expect(document.querySelector('.rc-notification-notice-description')).toHaveStyle({
      content: 'global-description',
      marginRight: '2px',
    });
    expect(document.querySelector('.rc-notification-notice-actions')).toHaveClass(
      'global-actions',
      'notice-actions',
    );
    expect(document.querySelector('.rc-notification-notice-actions')).toHaveStyle({
      content: 'global-actions',
      marginBottom: '3px',
    });
    expect(document.querySelector('.actions')).toBeFalsy();
    expect(document.querySelector('.rc-notification-notice-icon')).toHaveClass(
      'global-icon',
      'notice-icon',
    );
    expect(document.querySelector('.rc-notification-notice-icon')).toHaveStyle({
      content: 'global-icon',
      marginLeft: '4px',
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

  it('should listContent styles and classNames work', () => {
    const { instance } = renderDemo({
      classNames: {
        listContent: 'bamboo',
      },
      styles: {
        listContent: {
          content: 'little',
        },
      },
    });

    act(() => {
      instance.open({});
    });

    expect(document.querySelector('.rc-notification-list-content')).toHaveStyle({
      content: 'little',
    });
    expect(document.querySelector('.rc-notification-list-content')).toHaveClass('bamboo');
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
    const motionFn = vi.fn();

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
    const onAllRemoved = vi.fn();

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
      vi.runAllTimers();
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
    const onClose = vi.fn();
    const Demo = () => {
      const [api, holder] = useNotification();
      return (
        <>
          <button
            type="button"
            onClick={() => {
              api.open({
                key: 'little',
                duration: 1,
                description: <div className="context-content">light</div>,
              });

              setTimeout(() => {
                api.open({
                  key: 'little',
                  duration: 1,
                  description: <div className="context-content">bamboo</div>,
                  onClose,
                });
              }, 1100);
            }}
          />
          {holder}
        </>
      );
    };
    const { container: demoContainer, unmount } = render(<Demo />);
    fireEvent.click(demoContainer.querySelector('button'));
    act(() => {
      vi.runAllTimers();
    });
    expect(onClose).not.toHaveBeenCalled();
    act(() => {
      vi.runAllTimers();
    });
    expect(onClose).toHaveBeenCalled();

    unmount();
  });

  describe('onClose and closable.onClose', () => {
    it('onClose', () => {
      const onClose = vi.fn();
      const Demo = () => {
        const [api, holder] = useNotification();
        return (
          <>
            <button
              type="button"
              onClick={() => {
                api.open({
                  key: 'little',
                  duration: 1,
                  description: <div className="context-content">light</div>,
                  closable: { onClose },
                });
              }}
            />
            {holder}
          </>
        );
      };

      const { container: demoContainer, unmount } = render(<Demo />);
      fireEvent.click(demoContainer.querySelector('button'));
      act(() => {
        vi.runAllTimers();
      });
      expect(onClose).toHaveBeenCalled();

      unmount();
    });
    it('Both closableOnllose and onClose are called', () => {
      const onClose = vi.fn();
      const closableOnClose = vi.fn();
      const Demo = () => {
        const [api, holder] = useNotification();
        return (
          <>
            <button
              type="button"
              onClick={() => {
                api.open({
                  key: 'little',
                  duration: 1,
                  description: <div className="context-content">light</div>,
                  onClose,
                  closable: { onClose: closableOnClose },
                });
              }}
            />
            {holder}
          </>
        );
      };

      const { container: demoContainer, unmount } = render(<Demo />);
      fireEvent.click(demoContainer.querySelector('button'));
      act(() => {
        vi.runAllTimers();
      });
      expect(closableOnClose).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();

      unmount();
    });
    it('closable.onClose (config)', () => {
      const onClose = vi.fn();
      const Demo = () => {
        const [api, holder] = useNotification({ closable: { onClose } });
        return (
          <>
            <button
              type="button"
              onClick={() => {
                api.open({
                  key: 'little',
                  duration: 1,
                  description: <div className="context-content">light</div>,
                });
              }}
            />
            {holder}
          </>
        );
      };

      const { container: demoContainer, unmount } = render(<Demo />);
      fireEvent.click(demoContainer.querySelector('button'));
      act(() => {
        vi.runAllTimers();
      });
      expect(onClose).toHaveBeenCalled();

      unmount();
    });
  });

  it('closes via close button click', () => {
    const { instance } = renderDemo();
    let closeCount = 0;

    act(() => {
      instance.open({
        description: <p className="test">1</p>,
        closable: true,
        onClose: () => {
          closeCount += 1;
        },
      });
    });

    fireEvent.click(document.querySelector('.rc-notification-notice-close')); // origin latest
    expect(closeCount).toEqual(1);
  });

  it('Support aria-* in closable', () => {
    const { instance } = renderDemo({
      closable: {
        closeIcon: 'CloseBtn',
        'aria-label': 'close',
        'aria-labelledby': 'close',
      },
    });

    act(() => {
      instance.open({
        description: <p className="test">1</p>,
        duration: 0,
      });
    });

    expect(document.querySelector('.rc-notification-notice-close').textContent).toEqual('CloseBtn');
    expect(
      document.querySelector('.rc-notification-notice-close').getAttribute('aria-label'),
    ).toEqual('close');
    expect(
      document.querySelector('.rc-notification-notice-close').getAttribute('aria-labelledby'),
    ).toEqual('close');
  });

  describe('showProgress', () => {
    it('show with progress', () => {
      const { instance } = renderDemo({
        duration: 1,
        showProgress: true,
      });

      act(() => {
        instance.open({
          description: <p className="test">1</p>,
        });
      });

      expect(document.querySelector('.rc-notification-notice-progress')).toBeTruthy();

      act(() => {
        step(500);
      });

      expect(document.querySelector('.rc-notification-notice-progress')).toBeTruthy();

      act(() => {
        step(500);
      });

      expect(document.querySelector('.rc-notification-notice-progress')).toBeFalsy();
    });

    it('supports custom progress component', () => {
      const CustomProgress: React.FC<NotificationProgressProps> = ({ className }) => (
        <span className={className} />
      );

      const { instance } = renderDemo({
        components: {
          progress: CustomProgress,
        },
        duration: 1,
        showProgress: true,
      });

      act(() => {
        instance.open({
          description: <p className="test">1</p>,
        });
      });

      expect(document.querySelector('span.rc-notification-notice-progress')).toBeTruthy();
    });
  });

  describe('Modifying properties through useState can take effect', () => {
    it('should show notification and disappear after 5 seconds', async () => {
      const Demo: React.FC = () => {
        const [duration, setDuration] = React.useState(0);
        const [api, holder] = useNotification({ duration });

        return (
          <>
            <button data-testid="change-duration" onClick={() => setDuration(5)}>
              change duration
            </button>
            <button
              data-testid="show-notification"
              onClick={() => {
                api.open({
                  description: `Test Notification`,
                });
              }}
            >
              show notification
            </button>
            {holder}
          </>
        );
      };

      const { getByTestId } = render(<Demo />);

      fireEvent.click(getByTestId('show-notification'));

      expect(document.querySelectorAll('.rc-notification-notice').length).toBe(1);
      fireEvent.click(getByTestId('change-duration'));
      fireEvent.click(getByTestId('show-notification'));
      expect(document.querySelectorAll('.rc-notification-notice').length).toBe(2);

      act(() => {
        step(5000);
      });

      expect(document.querySelectorAll('.rc-notification-notice').length).toBe(1);
    });
  });
  it('notification close node ', () => {
    const Demo = () => {
      const [duration] = React.useState(0);
      const [api, holder] = useNotification({ duration });
      return (
        <>
          <button
            data-testid="show-notification"
            onClick={() => {
              api.open({
                description: `Test Notification`,
                closable: { 'aria-label': 'xxx' },
              });
            }}
          >
            show notification
          </button>
          {holder}
        </>
      );
    };
    const { getByTestId } = render(<Demo />);
    fireEvent.click(getByTestId('show-notification'));
    expect(document.querySelector('button.rc-notification-notice-close')).toHaveAttribute(
      'aria-label',
      'xxx',
    );
  });
});
