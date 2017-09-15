import React from 'react';
import TestUtils from 'react-dom/test-utils';
import expect from 'expect.js';

import Notification from '../src/';

require('../assets/index.less');

describe('rc-notification', () => {
  it('works', (done) => {
    const notification = Notification.newInstance();
    notification.notice({
      content: <p className="test">1</p>,
      duration: 0.1,
    });
    expect(TestUtils.scryRenderedDOMComponentsWithClass(notification.component,
      'test').length).to.be(1);
    setTimeout(() => {
      expect(TestUtils.scryRenderedDOMComponentsWithClass(notification.component,
        'test').length).to.be(0);
      notification.destroy();
      done();
    }, 1000);
  });

  it('works with multi instance', (done) => {
    const notification = Notification.newInstance();
    notification.notice({
      content: <p className="test">1</p>,
      duration: 0.1,
    });
    notification.notice({
      content: <p className="test">2</p>,
      duration: 0.1,
    });
    expect(TestUtils.scryRenderedDOMComponentsWithClass(notification.component,
      'test').length).to.be(2);
    setTimeout(() => {
      expect(TestUtils.scryRenderedDOMComponentsWithClass(notification.component,
        'test').length).to.be(0);
      notification.destroy();
      done();
    }, 1000);
  });

  it('destroy works', () => {
    const notification = Notification.newInstance();
    notification.notice({
      content: <p id="test" className="test">222222</p>,
      duration: 0.1,
    });
    expect(TestUtils.scryRenderedDOMComponentsWithClass(notification.component,
      'test').length).to.be(1);
    notification.destroy();
    expect(document.getElementById('test')).not.to.be.ok();
  });

  it('getContainer works', () => {
    const notification = Notification.newInstance({
      getContainer: () => {
        const div = document.createElement('div');
        div.className = 'rc';
        document.body.appendChild(div);
        return div;
      },
    });
    notification.notice({
      content: <p id="test" className="test">222222</p>,
      duration: 1,
    });
    expect(document.querySelectorAll('.rc').length).to.be(1);
    notification.destroy();
  });

  it('remove notify works', (done) => {
    const notification = Notification.newInstance();
    const key = Date.now();
    const close = (k) => {
      notification.removeNotice(k);
    };
    notification.notice({
      content: <p id="test" className="test">
                  <button id="closeButton" onClick={close.bind(null, key)}>
                    close
                  </button>
                </p>,
      key,
      duration: null,
    });

    expect(TestUtils.scryRenderedDOMComponentsWithClass(notification.component, 'test')
      .length).to.be(1);
    const btnClose = document.getElementById('closeButton');
    TestUtils.Simulate.click(btnClose);
    setTimeout(() => {
      expect(TestUtils.scryRenderedDOMComponentsWithClass(notification.component, 'test')
        .length).to.be(0);
      notification.destroy();
      done();
    }, 1000);
  });

  it('freeze notification layer when mouse over', (done) => {
    const notification = Notification.newInstance();
    notification.notice({
      content: <p id="freeze" className="freeze">freeze</p>,
      duration: 0.3,
    });
    expect(document.querySelectorAll('.freeze').length).to.be(1);
    const content = document.getElementById('freeze');
    TestUtils.Simulate.mouseEnter(content);
    setTimeout(() => {
      expect(TestUtils.scryRenderedDOMComponentsWithClass(notification.component, 'freeze')
        .length).to.be(1);
      TestUtils.Simulate.mouseLeave(content);
      setTimeout(() => {
        expect(TestUtils.scryRenderedDOMComponentsWithClass(notification.component, 'freeze')
          .length).to.be(0);
        notification.destroy();
        done();
      }, 400);
    }, 500);
  });
});
