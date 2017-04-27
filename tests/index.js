const React = require('react');
const TestUtils = require('react-dom/test-utils');
const expect = require('expect.js');
const Notification = require('../');

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
  });
});
