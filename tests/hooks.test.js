import React from 'react';
import { mount } from 'enzyme';
import Notification from '../src';

require('../assets/index.less');

async function timeout(delay = 0) {
  return new Promise(resolve => {
    setTimeout(resolve, delay);
  });
}

describe('Notification.Hooks', () => {
  it('works', async () => {
    let instance;

    const Context = React.createContext({ name: 'light' });

    Notification.newInstance({}, notification => {
      instance = notification;
    });

    await timeout(0);

    const Demo = () => {
      const [notify, holder] = instance.useNotification();
      return (
        <Context.Provider value={{ name: 'bamboo' }}>
          <button
            type="button"
            onClick={() => {
              notify({
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
    instance.destroy();
  });
});
