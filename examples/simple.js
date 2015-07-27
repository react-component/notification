'use strict';

// use jsx to render html, do not modify simple.html
require('rc-notification/assets/index.css');
var Notification = require('rc-notification');
var notification = Notification.newInstance({});
var pkg = require('../package.json');
var React = require('react');

function simpleFn() {
  notification.notice({
    key: 'simple',
    content: <span>simple show</span>,
    onClose() {
      console.log('simple close');
    }
  })
}

function durationFn() {
  notification.notice({
    content: <span>can not close...</span>,
    duration: null
  })
}

function closableFn() {
  notification.notice({
    content: <span>closable</span>,
    duration: null,
    onClose() {
      console.log('closable close');
    },
    closable: true
  })
}

function close(key) {
  notification.removeNotice(key);
}

function manualClose() {
  var key = 'manual';
  notification.notice({
    content: <div>
      <p>click below button to close</p>
      <button onClick={close.bind(null,key)}>close</button>
    </div>,
    key: key,
    duration: null
  })
}

React.render(<div>
  <h1>{pkg.name}@{pkg.version}</h1>

  <div>
    <button onClick={simpleFn}>simple show</button>
    <button onClick={durationFn}>duration=0</button>
    <button onClick={closableFn}>closable</button>
    <button onClick={manualClose}>controlled close</button>
  </div>
</div>, document.getElementById('__react-content'));
