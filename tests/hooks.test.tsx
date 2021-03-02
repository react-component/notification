import React from 'react';
import type { ReactWrapper } from 'enzyme';
import { mount } from 'enzyme';
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

    let wrapper: ReactWrapper;
    Notification.newInstance(
      {
        TEST_RENDER: (node: React.ReactElement) => {
          wrapper = mount(<div>{node}</div>);
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

    const demo = mount(<Demo />);
    demo.find('button').simulate('click');

    await timeout(10);
    expect(demo.find('.context-content').text()).toEqual('bamboo');

    await timeout(1000);
    expect(wrapper.find('Notification').state().notices).toHaveLength(0);

    instance.destroy();
  });

  it('key replace', async () => {
    let instance: NotificationInstance;

    let wrapper: ReactWrapper;
    Notification.newInstance(
      {
        TEST_RENDER: (node: React.ReactElement) => {
          wrapper = mount(<div>{node}</div>);
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

    const demo = mount(<Demo />);
    demo.find('button').simulate('click');

    await timeout(10);
    expect(demo.find('.context-content').text()).toEqual('light');

    await timeout(600);
    expect(demo.find('.context-content').text()).toEqual('bamboo');

    instance.destroy();

    wrapper.unmount();
  });
});
