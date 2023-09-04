import React, { ReactElement } from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { useNotification } from '../src';
import type { NotificationAPI, NotificationConfig } from '../src';
import NotificationProvider from '../src/NotificationProvider';
import { expect } from 'vitest';

require('../assets/index.less');

describe('Notification.Hooks', () => {
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

  it('works', async () => {
    const Context = React.createContext({ name: 'light' });

    const Demo = () => {
      const [api, holder] = useNotification();
      return (
        <Context.Provider value={{ name: 'bamboo' }}>
          <button
            type="button"
            onClick={() => {
              api.open({
                duration: 0.1,
                content: (
                  <Context.Consumer>
                    {({ name }) => <div className="context-content">{name}</div>}
                  </Context.Consumer>
                ),
              });
            }}
          />
          {holder}
        </Context.Provider>
      );
    };

    const { container: demoContainer, unmount } = render(<Demo />);
    fireEvent.click(demoContainer.querySelector('button'));

    expect(document.querySelector('.context-content').textContent).toEqual('bamboo');

    act(() => {
      vi.runAllTimers();
    });
    expect(document.querySelectorAll('.rc-notification-notice')).toHaveLength(0);

    unmount();
  });

  it('key replace', async () => {
    const Demo = () => {
      const [api, holder] = useNotification();
      return (
        <>
          <button
            type="button"
            onClick={() => {
              api.open({
                key: 'little',
                duration: 1000,
                content: <div className="context-content">light</div>,
              });

              setTimeout(() => {
                api.open({
                  key: 'little',
                  duration: 1000,
                  content: <div className="context-content">bamboo</div>,
                });
              }, 500);
            }}
          />
          {holder}
        </>
      );
    };

    const { container: demoContainer, unmount } = render(<Demo />);
    fireEvent.click(demoContainer.querySelector('button'));

    expect(document.querySelector('.context-content').textContent).toEqual('light');

    act(() => {
      vi.runAllTimers();
    });
    expect(document.querySelector('.context-content').textContent).toEqual('bamboo');

    unmount();
  });

  it('duration config', () => {
    const { instance } = renderDemo({
      duration: 0,
    });

    act(() => {
      instance.open({
        content: <div className="bamboo" />,
      });
    });

    expect(document.querySelector('.bamboo')).toBeTruthy();

    act(() => {
      vi.runAllTimers();
    });
    expect(document.querySelector('.bamboo')).toBeTruthy();

    // Can be override
    act(() => {
      instance.open({
        content: <div className="little" />,
        duration: 1,
      });
    });

    act(() => {
      vi.runAllTimers();
    });
    expect(document.querySelector('.little')).toBeFalsy();

    // Can be undefined
    act(() => {
      instance.open({
        content: <div className="light" />,
        duration: undefined,
      });
    });

    act(() => {
      vi.runAllTimers();
    });
    expect(document.querySelector('.light')).toBeTruthy();
  });

  it('support renderNotifications', () => {
    const Wrapper = ({ children }) => {
      return (
        <NotificationProvider classNames={{ notice: 'apple', list: 'banana' }}>
          {children}
        </NotificationProvider>
      );
    };

    const renderNotifications = (node: ReactElement) => {
      return <Wrapper>{node}</Wrapper>;
    };
    const { instance } = renderDemo({
      renderNotifications,
    });

    act(() => {
      instance.open({
        content: <div className="bamboo" />,
        style: { color: 'red' },
        className: 'custom-notice',
      });
    });

    expect(document.querySelector('.rc-notification')).toHaveClass('banana');
    expect(document.querySelector('.custom-notice')).toHaveClass('apple');
  });

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
                duration: null,
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
});
