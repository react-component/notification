import React from 'react';
import { mount } from 'enzyme';
import Notification from '../src';

require('../assets/index.less');

describe('Notification.Basic', () => {
  it('works', done => {
    let wrapper;

    Notification.newInstance(
      {
        TEST_RENDER: node => {
          wrapper = mount(<div>{node}</div>);
        },
      },
      notification => {
        notification.notice({
          content: <p className="test">1</p>,
          duration: 0.1,
        });

        setTimeout(() => {
          expect(wrapper.find('.test')).toHaveLength(1);
        }, 10);
        setTimeout(() => {
          wrapper.update();
          expect(wrapper.find('.test')).toHaveLength(0);
          notification.destroy();
          done();
        }, 1000);
      },
    );
  });

  it('works with custom close icon', done => {
    let wrapper;

    Notification.newInstance(
      {
        TEST_RENDER: node => {
          wrapper = mount(<div>{node}</div>);
        },
        closeIcon: <span className="test-icon">test-close-icon</span>,
      },
      notification => {
        notification.notice({
          content: <p className="test">1</p>,
          closable: true,
          duration: 0,
        });
        setTimeout(() => {
          expect(wrapper.find('.test')).toHaveLength(1);
          expect(wrapper.find('.test-icon').text()).toEqual('test-close-icon');
          done();
        }, 10);
      },
    );
  });

  it('works with multi instance', done => {
    let wrapper;

    Notification.newInstance(
      {
        TEST_RENDER: node => {
          wrapper = mount(<div>{node}</div>);
        },
      },
      notification => {
        notification.notice({
          content: <p className="test">1</p>,
          duration: 0.1,
        });
        notification.notice({
          content: <p className="test">2</p>,
          duration: 0.1,
        });
        setTimeout(() => {
          expect(wrapper.find('.test')).toHaveLength(2);
        }, 10);
        setTimeout(() => {
          wrapper.update();
          expect(wrapper.find('.test')).toHaveLength(0);
          notification.destroy();
          done();
        }, 1000);
      },
    );
  });

  it('destroy works', () => {
    Notification.newInstance({}, notification => {
      notification.notice({
        content: (
          <p id="test" className="test">
            222222
          </p>
        ),
        duration: 0.1,
      });
      setTimeout(() => {
        expect(document.querySelector('.test')).toBeTruthy();
        notification.destroy();
        expect(document.querySelector('.test')).toBeFalsy();
      }, 10);
    });
  });

  it('getContainer works', () => {
    const id = 'get-container-test';
    const div = document.createElement('div');
    div.id = id;
    div.innerHTML = '<span>test</span>';
    document.body.appendChild(div);

    Notification.newInstance(
      {
        getContainer: () => document.getElementById('get-container-test'),
      },
      notification => {
        notification.notice({
          content: (
            <p id="test" className="test">
              222222
            </p>
          ),
          duration: 1,
        });

        expect(document.getElementById(id).children).toHaveLength(2);
        notification.destroy();
        expect(document.getElementById(id).children).toHaveLength(1);
      },
    );
  });

  it('remove notify works', done => {
    let wrapper;

    Notification.newInstance(
      {
        TEST_RENDER: node => {
          wrapper = mount(<div>{node}</div>);
        },
      },
      notification => {
        const key = Date.now();
        const close = k => {
          notification.removeNotice(k);
        };
        notification.notice({
          content: (
            <p className="test">
              <button type="button" id="closeButton" onClick={close.bind(null, key)}>
                close
              </button>
            </p>
          ),
          key,
          duration: null,
        });

        setTimeout(() => {
          expect(wrapper.find('.test')).toHaveLength(1);
          wrapper.find('#closeButton').simulate('click');
          setTimeout(() => {
            wrapper.update();
            expect(wrapper.find('.test')).toHaveLength(0);
            notification.destroy();
            done();
          }, 1000);
        }, 10);
      },
    );
  });

  it('update notification by key with multi instance', done => {
    let wrapper;

    Notification.newInstance(
      {
        TEST_RENDER: node => {
          wrapper = mount(<div>{node}</div>);
        },
      },
      notification => {
        const key = 'updatable';
        const value = 'value';
        const newValue = `new-${value}`;
        const notUpdatableValue = 'not-updatable-value';
        notification.notice({
          content: (
            <p id="not-updatable" className="not-updatable">
              {notUpdatableValue}
            </p>
          ),
          duration: null,
        });
        notification.notice({
          content: (
            <p id="updatable" className="updatable">
              {value}
            </p>
          ),
          key,
          duration: null,
        });

        setTimeout(() => {
          expect(wrapper.find('.updatable')).toHaveLength(1);
          expect(wrapper.find('.updatable').text()).toEqual(value);

          notification.notice({
            content: (
              <p id="updatable" className="updatable">
                {newValue}
              </p>
            ),
            key,
            duration: 0.1,
          });

          setTimeout(() => {
            // Text updated successfully
            wrapper.update();
            expect(wrapper.find('.updatable')).toHaveLength(1);
            expect(wrapper.find('.updatable').text()).toEqual(newValue);

            setTimeout(() => {
              // Other notices are not affected
              wrapper.update();
              expect(wrapper.find('.not-updatable')).toHaveLength(1);
              expect(wrapper.find('.not-updatable').text()).toEqual(notUpdatableValue);
              // Duration updated successfully
              expect(wrapper.find('.updatable')).toHaveLength(0);
              notification.destroy();
              done();
            }, 500);
          }, 10);
        }, 10);
      },
    );
  });

  it('freeze notification layer when mouse over', done => {
    let wrapper;

    Notification.newInstance(
      {
        TEST_RENDER: node => {
          wrapper = mount(<div>{node}</div>);
        },
      },
      notification => {
        notification.notice({
          content: (
            <p id="freeze" className="freeze">
              freeze
            </p>
          ),
          duration: 0.3,
        });
        setTimeout(() => {
          wrapper.update();
          expect(wrapper.find('.freeze')).toHaveLength(1);
          wrapper.find('.rc-notification-notice').simulate('mouseEnter');
          setTimeout(() => {
            wrapper.update();
            expect(wrapper.find('.freeze')).toHaveLength(1);
            wrapper.find('.rc-notification-notice').simulate('mouseLeave');
            setTimeout(() => {
              wrapper.update();
              expect(wrapper.find('.freeze')).toHaveLength(0);
              notification.destroy();
              done();
            }, 400);
          }, 500);
        }, 10);
      },
    );
  });

  it('should work in lifecycle of React component', () => {
    class Test extends React.Component {
      componentDidMount() {
        Notification.newInstance({}, notification => {
          notification.notice({
            content: <span>In lifecycle</span>,
          });
        });
      }

      render() {
        return null;
      }
    }

    const container = document.createElement('div');
    mount(<Test />, container);
  });

  it('drop first notice when items limit exceeds', done => {
    let wrapper;

    Notification.newInstance(
      {
        maxCount: 1,
        TEST_RENDER: node => {
          wrapper = mount(<div>{node}</div>);
        },
      },
      notification => {
        const value = 'updated last';
        notification.notice({
          content: <span className="test-maxcount">simple show</span>,
          duration: 3,
        });
        notification.notice({
          content: <span className="test-maxcount">simple show</span>,
          duration: 3,
        });
        notification.notice({
          content: <span className="test-maxcount">{value}</span>,
          duration: 3,
        });

        setTimeout(() => {
          wrapper.update();
          expect(wrapper.find('.test-maxcount')).toHaveLength(1);
          expect(wrapper.find('.test-maxcount').text()).toEqual(value);
          done();
        }, 10);
      },
    );
  });

  it('onClick trigger', done => {
    let wrapper;
    let clicked = 0;

    Notification.newInstance(
      {
        TEST_RENDER: node => {
          wrapper = mount(<div>{node}</div>);
        },
      },
      notification => {
        const key = Date.now();
        const close = k => {
          notification.removeNotice(k);
        };
        notification.notice({
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

        setTimeout(() => {
          wrapper
            .find('.rc-notification-notice')
            .last()
            .simulate('click');
          expect(clicked).toEqual(1);
          notification.destroy();
          done();
        }, 10);
      },
    );
  });

  it('Close Notification only trigger onClose', done => {
    let wrapper;
    let clickCount = 0;
    let closeCount = 0;
    Notification.newInstance(
      {
        TEST_RENDER: node => {
          wrapper = mount(<div>{node}</div>);
        },
      },
      notification => {
        notification.notice({
          content: <p className="test">1</p>,
          closable: true,
          onClick: () => {
            clickCount += 1;
          },
          onClose: () => {
            closeCount += 1;
          },
        });

        setTimeout(() => {
          wrapper
            .find('.rc-notification-notice-close')
            .last()
            .simulate('click');
          expect(clickCount).toEqual(0);
          expect(closeCount).toEqual(1);
          notification.destroy();
          done();
        }, 10);
      },
    );
  });
});
