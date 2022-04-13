import React from 'react';
// import ReactDOM from "react-dom";
import { createRoot } from 'react-dom/client';

class Notification extends React.Component<any, any> {
  static instance: any;
  render() {
    return <div>Notification</div>;
  }
}
Notification.instance = function (_, callback) {
  debugger;
  const div = document.createElement('div');
  document.body.appendChild(div);
  const ref = () => {
    console.log('before callback');
    callback({});
  };

  // react 18
  const root = createRoot(div);
  root.render(<Notification ref={ref} />);
  // before react 18
  // ReactDOM.render(<Notification ref={ref} />, div);
};

export default Notification;
