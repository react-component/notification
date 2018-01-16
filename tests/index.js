import 'core-js/es6/map';
import 'core-js/es6/set';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import expect from 'expect.js';

import Notification from '../src/';

require('../assets/index.less');

describe('rc-notification', () => {
  it('works', (done) => {
    Notification.newInstance({}, notification => {
      notification.notice({
        content: <p className="test">1</p>,
        duration: 0.1,
      });
      setTimeout(() => {
        expect(
          TestUtils.scryRenderedDOMComponentsWithClass(notification.component, 'test').length
        ).to.be(1);
      }, 10);
      setTimeout(() => {
        expect(
          TestUtils.scryRenderedDOMComponentsWithClass(notification.component, 'test').length
        ).to.be(0);
        notification.destroy();
        done();
      }, 1000);
    });
  });

  it('works with multi instance', (done) => {
    Notification.newInstance({}, notification => {
      notification.notice({
        content: <p className="test">1</p>,
        duration: 0.1,
      });
      notification.notice({
        content: <p className="test">2</p>,
        duration: 0.1,
      });
      setTimeout(() => {
        expect(
          TestUtils.scryRenderedDOMComponentsWithClass(notification.component, 'test').length
        ).to.be(2);
      }, 10);
      setTimeout(() => {
        expect(
          TestUtils.scryRenderedDOMComponentsWithClass(notification.component, 'test').length
        ).to.be(0);
        notification.destroy();
        done();
      }, 1000);
    });
  });

  it('destroy works', () => {
    Notification.newInstance({}, notification => {
      notification.notice({
        content: <p id="test" className="test">222222</p>,
        duration: 0.1,
      });
      setTimeout(() => {
        expect(
          TestUtils.scryRenderedDOMComponentsWithClass(notification.component, 'test').length
        ).to.be(1);
        notification.destroy();
        expect(document.getElementById('test')).not.to.be.ok();
      }, 10);
    });
  });

  it('getContainer works', () => {
    const id = 'get-container-test';
    const div = document.createElement('div');
    div.id = id;
    div.innerHTML = '<span>test</span>';
    document.body.appendChild(div);

    Notification.newInstance({
      getContainer: () => {
        return document.getElementById('get-container-test');
      },
    }, notification => {
      notification.notice({
        content: <p id="test" className="test">222222</p>,
        duration: 1,
      });
      expect(document.getElementById(id).children.length).to.be(2);
      expect(document.getElementById(id)).not.to.be(null);

      notification.destroy();

      expect(document.getElementById(id).children.length).to.be(1);
    });
  });

  it('remove notify works', (done) => {
    Notification.newInstance({}, notification => {
      const key = Date.now();
      const close = (k) => {
        notification.removeNotice(k);
      };
      notification.notice({
        content: <p className="test">
          <button id="closeButton" onClick={close.bind(null, key)}>
            close
          </button>
        </p>,
        key,
        duration: null,
      });

      setTimeout(() => {
        expect(
          TestUtils.scryRenderedDOMComponentsWithClass(notification.component, 'test').length
        ).to.be(1);
        const btnClose = document.getElementById('closeButton');
        TestUtils.Simulate.click(btnClose);
        setTimeout(() => {
          expect(
            TestUtils.scryRenderedDOMComponentsWithClass(notification.component, 'test').length
          ).to.be(0);
          notification.destroy();
          done();
        }, 1000);
      }, 10);
    });
  });

  it('freeze notification layer when mouse over', (done) => {
    Notification.newInstance({}, notification => {
      notification.notice({
        content: <p id="freeze" className="freeze">freeze</p>,
        duration: 0.3,
      });
      setTimeout(() => {
        expect(document.querySelectorAll('.freeze').length).to.be(1);
        const content = document.getElementById('freeze');
        TestUtils.Simulate.mouseEnter(content);
        setTimeout(() => {
          expect(
            TestUtils.scryRenderedDOMComponentsWithClass(notification.component, 'freeze').length
          ).to.be(1);
          TestUtils.Simulate.mouseLeave(content);
          setTimeout(() => {
            expect(
              TestUtils.scryRenderedDOMComponentsWithClass(notification.component, 'freeze').length
            ).to.be(0);
            notification.destroy();
            done();
          }, 400);
        }, 500);
      }, 10);
    });
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
    document.body.appendChild(container);
    expect(() => ReactDOM.render(<Test />, container))
      .to.not.throwException();
  });

  it('last notification on top works', (done) => {
    Notification.newInstance({ isLastTop: true }, notification => {
      notification.notice({
        content: <p className="test">1</p>,
        duration: 0,
      });
      notification.notice({
        content: <p className="test">2</p>,
        duration: 0,
      });
      setTimeout(() => {
        expect(
          TestUtils.scryRenderedDOMComponentsWithClass(notification.component, 'test')
          .map(e => e.textContent)
        ).to.eql(
          ['2', '1']
        );
        notification.toggleOrder();
        notification.notice({
          content: <p className="test">3</p>,
          duration: 0,
        });
        setTimeout(() => {
          expect(
            TestUtils.scryRenderedDOMComponentsWithClass(notification.component, 'test')
            .map(e => e.textContent)
          ).to.eql(
            ['2', '1', '3']
          );
          done();
        });
      }, 10);
    });
  });
});
