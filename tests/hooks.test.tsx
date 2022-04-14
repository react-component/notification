import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Notification from '../src';
import type { NotificationInstance } from '../src/Notification';

require('../assets/index.less');

async function timeout(delay = 0) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

describe('Notification.Hooks', () => {
  it('works', async () => {
    let instance: NotificationInstance;

    const Context = React.createContext({ name: 'light' });

    let container: HTMLElement;
    Notification.newInstance(
      {
        TEST_RENDER: (node: React.ReactElement) => {
          ({ container } = render(<div>{node}</div>));
        },
      } as any,
      (notification) => {
        instance = notification;
      },
    );

    await timeout(0);

    const Demo = () => {
      const [notify, holder] = instance.useNotification();
      return (
        <Context.Provider value={{ name: 'bamboo' }}>
          <button
            type="button"
            onClick={() => {
              notify({
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

    const { container: demoContainer } = render(<Demo />);
    fireEvent.click(demoContainer.querySelector('button'));

    await timeout(10);
    expect(container.querySelector('.context-content').textContent).toEqual('bamboo');

    await timeout(1000);
    expect(container.querySelectorAll('.rc-notification-notice')).toHaveLength(0);

    instance.destroy();
  });

  it('key replace', async () => {
    let instance: NotificationInstance;

    let container: HTMLElement;
    let unmount: () => void;
    Notification.newInstance(
      {
        TEST_RENDER: (node: React.ReactElement) => {
          ({ container, unmount } = render(<div>{node}</div>));
        },
      } as any,
      (notification) => {
        instance = notification;
      },
    );

    await timeout(0);

    const Demo = () => {
      const [notify, holder] = instance.useNotification();
      return (
        <>
          <button
            type="button"
            onClick={() => {
              notify({
                key: 'little',
                duration: 1000,
                content: <div className="context-content">light</div>,
              });

              setTimeout(() => {
                notify({
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

    const { container: demoContainer } = render(<Demo />);
    fireEvent.click(demoContainer.querySelector('button'));

    await timeout(10);
    expect(container.querySelector('.context-content').textContent).toEqual('light');

    await timeout(600);
    expect(container.querySelector('.context-content').textContent).toEqual('bamboo');

    instance.destroy();

    unmount();
  });
});
