import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import Notification from '../src';

require('../assets/index.less');

describe('Notification.Basic', () => {
  it('works', (done) => {
    let container;

    Notification.newInstance(
      {
        TEST_RENDER: (node) => {
          ({ container } = render(<div>{node}</div>));
        },
      },
      (notification) => {
        notification.notice({
          content: <p className="test">1</p>,
          duration: 0.1,
        });

        setTimeout(() => {
          expect(container.querySelectorAll('.test')).toHaveLength(1);
        }, 10);
        setTimeout(() => {
          expect(container.querySelectorAll('.test')).toHaveLength(0);
          notification.destroy();
          done();
        }, 1000);
      },
    );
  });

  it('works with custom close icon', (done) => {
    let container;

    Notification.newInstance(
      {
        TEST_RENDER: (node) => {
          ({ container } = render(<div>{node}</div>));
        },
        closeIcon: <span className="test-icon">test-close-icon</span>,
      },
      (notification) => {
        notification.notice({
          content: <p className="test">1</p>,
          closable: true,
          duration: 0,
        });
        setTimeout(() => {
          expect(container.querySelectorAll('.test')).toHaveLength(1);
          expect(container.querySelector('.test-icon').textContent).toEqual('test-close-icon');
          done();
        }, 10);
      },
    );
  });

  it('works with multi instance', (done) => {
    let container;

    Notification.newInstance(
      {
        TEST_RENDER: (node) => {
          ({ container } = render(<div>{node}</div>));
        },
      },
      (notification) => {
        notification.notice({
          content: <p className="test">1</p>,
          duration: 0.1,
        });
        notification.notice({
          content: <p className="test">2</p>,
          duration: 0.1,
        });
        setTimeout(() => {
          expect(container.querySelectorAll('.test')).toHaveLength(2);
        }, 10);
        setTimeout(() => {
          expect(container.querySelectorAll('.test')).toHaveLength(0);
          notification.destroy();
          done();
        }, 1000);
      },
    );
  });

  it('destroy works', () => {
    Notification.newInstance({}, (notification) => {
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
      (notification) => {
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

  it('remove notify works', (done) => {
    let container;

    Notification.newInstance(
      {
        TEST_RENDER: (node) => {
          ({ container } = render(<div>{node}</div>));
        },
      },
      (notification) => {
        const key = Date.now();
        const close = (k) => {
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
          expect(container.querySelectorAll('.test')).toHaveLength(1);
          fireEvent.click(container.querySelector('#closeButton'));

          setTimeout(() => {
            expect(container.querySelectorAll('.test')).toHaveLength(0);
            notification.destroy();
            done();
          }, 1000);
        }, 10);
      },
    );
  });

  it('update notification by key with multi instance', (done) => {
    let container;

    Notification.newInstance(
      {
        TEST_RENDER: (node) => {
          ({ container } = render(<div>{node}</div>));
        },
      },
      (notification) => {
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
          expect(container.querySelectorAll('.updatable')).toHaveLength(1);
          expect(container.querySelector('.updatable').textContent).toEqual(value);

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
            expect(container.querySelectorAll('.updatable')).toHaveLength(1);
            expect(container.querySelector('.updatable').textContent).toEqual(newValue);

            setTimeout(() => {
              // Other notices are not affected
              expect(container.querySelectorAll('.not-updatable')).toHaveLength(1);
              expect(container.querySelector('.not-updatable').textContent).toEqual(
                notUpdatableValue,
              );
              // Duration updated successfully
              expect(container.querySelectorAll('.updatable')).toHaveLength(0);
              notification.destroy();
              done();
            }, 500);
          }, 10);
        }, 10);
      },
    );
  });

  it('freeze notification layer when mouse over', (done) => {
    let container;

    Notification.newInstance(
      {
        TEST_RENDER: (node) => {
          ({ container } = render(<div>{node}</div>));
        },
      },
      (notification) => {
        notification.notice({
          content: (
            <p id="freeze" className="freeze">
              freeze
            </p>
          ),
          duration: 0.3,
        });
        setTimeout(() => {
          expect(container.querySelectorAll('.freeze')).toHaveLength(1);
          fireEvent.mouseEnter(container.querySelector('.rc-notification-notice'));

          setTimeout(() => {
            expect(container.querySelectorAll('.freeze')).toHaveLength(1);
            fireEvent.mouseLeave(container.querySelector('.rc-notification-notice'));

            setTimeout(() => {
              expect(container.querySelectorAll('.freeze')).toHaveLength(0);
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
        Notification.newInstance({}, (notification) => {
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
    render(<Test />, {
      container,
    });
  });

  describe('maxCount', () => {
    it('remove work when maxCount set', (done) => {
      let container;

      Notification.newInstance(
        {
          TEST_RENDER: (node) => {
            ({ container } = render(<div>{node}</div>));
          },
          maxCount: 1,
        },
        (notification) => {
          // First
          notification.notice({
            content: <div className="max-count">bamboo</div>,
            key: 'bamboo',
            duration: 0,
          });

          // Next
          notification.notice({
            content: <div className="max-count">bamboo</div>,
            key: 'bamboo',
            duration: 0,
          });

          setTimeout(() => {
            expect(container.querySelectorAll('.max-count')).toHaveLength(1);
            notification.removeNotice('bamboo');

            setTimeout(() => {
              expect(container.querySelectorAll('.max-count')).toHaveLength(0);
              notification.destroy();
              done();
            }, 500);
          }, 10);
        },
      );
    });

    it('drop first notice when items limit exceeds', () => {
      jest.useFakeTimers();

      let container;

      let notificationInstance;
      Notification.newInstance(
        {
          maxCount: 1,
          TEST_RENDER: (node) => {
            ({ container } = render(<div>{node}</div>));
          },
        },
        (notification) => {
          notificationInstance = notification;
        },
      );

      const value = 'updated last';
      act(() => {
        notificationInstance.notice({
          content: <span className="test-maxcount">simple show</span>,
          duration: 0,
        });

        jest.runAllTimers();
      });

      act(() => {
        notificationInstance.notice({
          content: <span className="test-maxcount">simple show</span>,
          duration: 0,
        });
        jest.runAllTimers();
      });

      act(() => {
        notificationInstance.notice({
          content: <span className="test-maxcount">{value}</span>,
          duration: 0,
        });
        jest.runAllTimers();
      });

      act(() => {
        jest.runAllTimers();
      });

      expect(container.querySelectorAll('.test-maxcount')).toHaveLength(1);
      expect(container.querySelector('.test-maxcount').textContent).toEqual(value);

      jest.useRealTimers();
    });

    it('duration should work', (done) => {
      let container;

      let notificationInstance;
      Notification.newInstance(
        {
          maxCount: 1,
          TEST_RENDER: (node) => {
            ({ container } = render(<div>{node}</div>));
          },
        },
        (notification) => {
          notificationInstance = notification;

          notificationInstance.notice({
            content: <span className="auto-remove">bamboo</span>,
            duration: 99,
          });

          setTimeout(() => {
            expect(container.querySelector('.auto-remove').textContent).toEqual('bamboo');

            notificationInstance.notice({
              content: <span className="auto-remove">light</span>,
              duration: 0.5,
            });

            setTimeout(() => {
              expect(container.querySelector('.auto-remove').textContent).toEqual('light');

              setTimeout(() => {
                expect(container.querySelectorAll('.auto-remove')).toHaveLength(0);
                notification.destroy();
                done();
              }, 500);
            }, 10);
          }, 10);
        },
      );
    });
  });

  it('onClick trigger', (done) => {
    let container;
    let clicked = 0;

    Notification.newInstance(
      {
        TEST_RENDER: (node) => {
          ({ container } = render(<div>{node}</div>));
        },
      },
      (notification) => {
        const key = Date.now();
        const close = (k) => {
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
          fireEvent.click(container.querySelector('.rc-notification-notice')); // origin latest
          expect(clicked).toEqual(1);
          notification.destroy();
          done();
        }, 10);
      },
    );
  });

  it('Close Notification only trigger onClose', (done) => {
    let container;
    let clickCount = 0;
    let closeCount = 0;
    Notification.newInstance(
      {
        TEST_RENDER: (node) => {
          ({ container } = render(<div>{node}</div>));
        },
      },
      (notification) => {
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
          fireEvent.click(container.querySelector('.rc-notification-notice-close')); // origin latest
          expect(clickCount).toEqual(0);
          expect(closeCount).toEqual(1);
          notification.destroy();
          done();
        }, 10);
      },
    );
  });

  it('sets data attributes', (done) => {
    Notification.newInstance({}, (notification) => {
      notification.notice({
        content: <span className="test-data-attributes">simple show</span>,
        duration: 3,
        className: 'notice-class',
        props: {
          'data-test': 'data-test-value',
          'data-testid': 'data-testid-value',
        },
      });

      setTimeout(() => {
        const notice = document.querySelectorAll('.notice-class');
        expect(notice.length).toBe(1);
        expect(notice[0].getAttribute('data-test')).toBe('data-test-value');
        expect(notice[0].getAttribute('data-testid')).toBe('data-testid-value');
        notification.destroy();
        done();
      }, 10);
    });
  });

  it('sets aria attributes', (done) => {
    Notification.newInstance({}, (notification) => {
      notification.notice({
        content: <span className="test-aria-attributes">simple show</span>,
        duration: 3,
        className: 'notice-class',
        props: {
          'aria-describedby': 'aria-describedby-value',
          'aria-labelledby': 'aria-labelledby-value',
        },
      });

      setTimeout(() => {
        const notice = document.querySelectorAll('.notice-class');
        expect(notice.length).toBe(1);
        expect(notice[0].getAttribute('aria-describedby')).toBe('aria-describedby-value');
        expect(notice[0].getAttribute('aria-labelledby')).toBe('aria-labelledby-value');
        notification.destroy();
        done();
      }, 10);
    });
  });

  it('sets role attribute', (done) => {
    Notification.newInstance({}, (notification) => {
      notification.notice({
        content: <span className="test-aria-attributes">simple show</span>,
        duration: 3,
        className: 'notice-class',
        props: { role: 'alert' },
      });

      setTimeout(() => {
        const notice = document.querySelectorAll('.notice-class');
        expect(notice.length).toBe(1);
        expect(notice[0].getAttribute('role')).toBe('alert');
        notification.destroy();
        done();
      }, 10);
    });
  });
});
