var React = require('react');
var Notification = require('../');
var TestUtils = React.addons.TestUtils;
var Simulate = TestUtils.Simulate;
var expect = require('expect.js');
require('../assets/index.css');

describe('rc-notification', function () {
  it('works', function (done) {
    var notification = Notification.newInstance();
    notification.notice({
      content: <p className="test">1</p>,
      duration: 0.1
    });
    expect(TestUtils.scryRenderedDOMComponentsWithClass(notification.component, 'test').length).to.be(1);
    setTimeout(function () {
      expect(TestUtils.scryRenderedDOMComponentsWithClass(notification.component, 'test').length).to.be(0);
      notification.destroy();
      done();
    }, 1000);
  });

  it('destroy works', function () {
    var notification = Notification.newInstance();
    notification.notice({
      content: <p id="test" className="test">222222</p>,
      duration: 0.1
    });
    expect(TestUtils.scryRenderedDOMComponentsWithClass(notification.component, 'test').length).to.be(1);
    notification.destroy();
    expect(document.getElementById('test')).not.to.be.ok();
  });
});
