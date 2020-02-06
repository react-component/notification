import React from 'react';
import { mount } from 'enzyme';
import Notification from '../src';

require('../assets/index.less');

describe('Notification.Hooks', () => {
  it('works', done => {
    let instance;

    const Context = React.createContext({ name: 'light' });

    Notification.newInstance({}, notification => {
      instance = notification;
    });

    setTimeout(() => {
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
      setTimeout(() => {
        expect(demo.find('.context-content').text()).toEqual('bamboo');

        setTimeout(() => {
          instance.destroy();
          done();
        }, 1000);
      }, 10);
    }, 0);
  });
});
