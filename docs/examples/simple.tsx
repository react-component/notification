/* eslint-disable no-console */
import React from 'react';
import Notification from 'rc-notification';
import '../../assets/index.less';

let notification: any = null;
Notification.newInstance(
  {
    maxCount: 5,
  },
  n => {
    notification = n;
  },
);

function simpleFn() {
  notification.notice({
    duration: 3,
    content: <span>simple show {String(Date.now()).slice(-5)}</span>,
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
    onClick() {
      console.log('clicked!!!');
    },
  });
}

function close(key: React.Key) {
  notification.removeNotice(key);
}

function manualClose() {
  const key = Date.now();
  notification.notice({
    content: (
      <div>
        <p>click below button to close</p>
        <button type="button" onClick={close.bind(null, key)}>
          close
        </button>
      </div>
    ),
    key,
    duration: null,
  });
}

let counter = 0;
let intervalKey: number;
function updatableFn() {
  if (counter !== 0) {
    return;
  }

  const key = 'updatable-notification';
  const initialProps = {
    content: `Timer: ${counter}s`,
    key,
    duration: null,
    closable: true,
    onClose() {
      clearInterval(intervalKey);
      counter = 0;
    },
  };

  notification.notice(initialProps);
  intervalKey = window.setInterval(() => {
    counter += 1;
    notification.notice({ ...initialProps, content: `Timer: ${counter}s` });
  }, 1000);
}

const clearPath =
  'M793 242H366v-74c0-6.7-7.7-10.4-12.9' +
  '-6.3l-142 112c-4.1 3.2-4.1 9.4 0 12.6l142 112c' +
  '5.2 4.1 12.9 0.4 12.9-6.3v-74h415v470H175c-4.4' +
  ' 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h618c35.3 0 64-' +
  '28.7 64-64V306c0-35.3-28.7-64-64-64z';

const getSvg = (path: string, props = {}, align = false) => (
  <i {...props}>
    <svg
      viewBox="0 0 1024 1024"
      width="1em"
      height="1em"
      fill="currentColor"
      style={align ? { verticalAlign: '-.125em ' } : {}}
    >
      <path d={path} />
    </svg>
  </i>
);

function customCloseIconFn() {
  notification.notice({
    content: 'It is using custom close icon...',
    closable: true,
    closeIcon: getSvg(clearPath, {}, true),
    duration: 0,
  });
}

const Demo = () => (
  <div>
    <button type="button" onClick={simpleFn}>
      simple show
    </button>
    <button type="button" onClick={durationFn}>
      duration=0
    </button>
    <button type="button" onClick={closableFn}>
      closable
    </button>
    <button type="button" onClick={manualClose}>
      controlled close
    </button>
    <button type="button" onClick={updatableFn}>
      updatable
    </button>
    <button type="button" onClick={customCloseIconFn}>
      custom close icon
    </button>
  </div>
);

export default Demo;
