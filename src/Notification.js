import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import Animate from 'rc-animate';
import {createChainedFunction} from 'rc-util';
import Notice from './Notice';

let seed = 0;
const now = Date.now();

function getUuid() {
  return 'rcNotification_' + now + '_' + (seed++);
}

const Notification = React.createClass({
  getDefaultProps() {
    return {
      prefixCls: 'rc-notification',
      animation: 'fade',
      style: {
        'top': 65,
        left: '50%',
      },
    };
  },

  getInitialState() {
    return {
      notices: [],
    };
  },

  getTransitionName() {
    const props = this.props;
    let transitionName = props.transitionName;
    if (!transitionName && props.animation) {
      transitionName = `${props.prefixCls}-${props.animation}`;
    }
    return transitionName;
  },

  add(notice) {
    const key = notice.key = notice.key || getUuid();
    const notices = this.state.notices;
    if (!notices.filter((v) => v.key === key).length) {
      this.setState({
        notices: notices.concat(notice),
      });
    }
  },

  remove(key) {
    const notices = this.state.notices.filter((notice) => {
      return notice.key !== key;
    });
    this.setState({
      notices: notices,
    });
  },

  render() {
    const props = this.props;
    const noticeNodes = this.state.notices.map((notice)=> {
      const onClose = createChainedFunction(this.remove.bind(this, notice.key), notice.onClose);
      return (<Notice prefixCls={props.prefixCls} {...notice} onClose={onClose}>{notice.content}</Notice>);
    });
    const className = {
      [props.prefixCls]: 1,
      [props.className]: !!props.className,
    };
    return (
      <div className={classNames(className)} style={props.style}>
        <Animate transitionName={this.getTransitionName()}>{noticeNodes}</Animate>
      </div>
    );
  },
});

Notification.newInstance = (props) => {
  const notificationProps = props || {};
  const div = document.createElement('div');
  document.body.appendChild(div);
  const notification = ReactDOM.render(<Notification {...notificationProps}/>, div);
  return {
    notice(noticeProps) {
      notification.add(noticeProps);
    },
    removeNotice(key) {
      notification.remove(key);
    },
    component: notification,
    destroy() {
      React.unmountComponentAtNode(div);
      document.body.removeChild(div);
    },
  };
};

export default Notification;
