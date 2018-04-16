import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import Animate from 'rc-animate';
import createChainedFunction from 'rc-util/lib/createChainedFunction';
import classnames from 'classnames';
import Notice from './Notice';

let seed = 0;
const now = Date.now();

function getUuid() {
  return `rcNotification_${now}_${seed++}`;
}

class Notification extends Component {
  static propTypes = {
    prefixCls: PropTypes.string,
    transitionName: PropTypes.string,
    animation: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    style: PropTypes.object,
    maxItems: PropTypes.number,
  };

  static defaultProps = {
    prefixCls: 'rc-notification',
    animation: 'fade',
    style: {
      top: 65,
      left: '50%',
    },
    maxItems: 99,
  };

  state = {
    notices: [],
  };

  getTransitionName() {
    const props = this.props;
    let transitionName = props.transitionName;
    if (!transitionName && props.animation) {
      transitionName = `${props.prefixCls}-${props.animation}`;
    }
    return transitionName;
  }

  add = (notice) => {
    const key = notice.key = notice.key || getUuid();
    const { maxItems } = this.props;
    this.setState(previousState => {
      const notices = previousState.notices;
      const noticeIndex = notices.map(v => v.key).indexOf(key);
      const updatedNotices = notices.concat();
      if (noticeIndex !== -1) {
        updatedNotices.splice(noticeIndex, 1, notice);
      } else {
        if (notices.length < maxItems) {
          updatedNotices.push(notice);
        } else {
          notice.key = updatedNotices[maxItems - 1].key;
          notice.update = true;
          updatedNotices[maxItems - 1] = notice;
        }
      }
      return {
        notices: updatedNotices,
      };
    });
  }

  remove = (key) => {
    this.setState(previousState => {
      return {
        notices: previousState.notices.filter(notice => notice.key !== key),
      };
    });
  }

  render() {
    const props = this.props;
    const noticeNodes = this.state.notices.map((notice) => {
      const onClose = createChainedFunction(this.remove.bind(this, notice.key), notice.onClose);
      return (<Notice
        prefixCls={props.prefixCls}
        {...notice}
        onClose={onClose}
      >
        {notice.content}
      </Notice>);
    });
    const className = {
      [props.prefixCls]: 1,
      [props.className]: !!props.className,
    };
    return (
      <div className={classnames(className)} style={props.style}>
        <Animate transitionName={this.getTransitionName()}>{noticeNodes}</Animate>
      </div>
    );
  }
}

Notification.newInstance = function newNotificationInstance(properties, callback) {
  const { getContainer, ...props } = properties || {};
  const div = document.createElement('div');
  if (getContainer) {
    const root = getContainer();
    root.appendChild(div);
  } else {
    document.body.appendChild(div);
  }
  let called = false;
  function ref(notification) {
    if (called) {
      return;
    }
    called = true;
    callback({
      notice(noticeProps) {
        notification.add(noticeProps);
      },
      removeNotice(key) {
        notification.remove(key);
      },
      component: notification,
      destroy() {
        ReactDOM.unmountComponentAtNode(div);
        div.parentNode.removeChild(div);
      },
    });
  }
  ReactDOM.render(<Notification {...props} ref={ref} />, div);
};

export default Notification;
