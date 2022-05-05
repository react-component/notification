import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { useNotification } from '../src';
import type { NotificationAPI, NotificationConfig } from '../src';

require('../assets/index.less');

describe('Notification.Hooks', () => {
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
      jest.runAllTimers();
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
      jest.runAllTimers();
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
      jest.runAllTimers();
    });
    expect(document.querySelector('.bamboo')).toBeTruthy();
  });
});
