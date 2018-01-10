/* eslint-disable no-console */
import 'rc-notification/assets/index.less';
import Notification from 'rc-notification';
import React from 'react';
import ReactDOM from 'react-dom';
let notification = null;
Notification.newInstance({}, (n) => notification = n);

function simpleFn() {
  notification.notice({
    content: <span>simple show</span>,
    onClose() {
      console.log('simple close');
    },
  });
}

function durationFn() {
  notification.notice({
    content: <span>can not close...</span>,
    duration: null,
  });
}

function closableFn() {
  notification.notice({
    content: <span>closable</span>,
    duration: null,
    onClose() {
      console.log('closable close');
    },
    closable: true,
  });
}

function close(key) {
  notification.removeNotice(key);
}

function manualClose() {
  const key = Date.now();
  notification.notice({
    content: <div>
      <p>click below button to close</p>
      <button onClick={close.bind(null, key)}>close</button>
    </div>,
    key,
    duration: null,
  });
}

function toggleOrder() {
  notification.toggleOrder();
}

ReactDOM.render(<div>
  <div>
    <label><input type="checkbox" onChange={toggleOrder} />Show last added on top</label>
    <br/>
    <br/>
    <button onClick={simpleFn}>simple show</button>
    <button onClick={durationFn}>duration=0</button>
    <button onClick={closableFn}>closable</button>
    <button onClick={manualClose}>controlled close</button>
  </div>
</div>, document.getElementById('__react-content'));
