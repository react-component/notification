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
  const id = seed;
  seed += 1;
  return `rcNotification_${now}_${id}`;
}

class Notification extends Component {
  static propTypes = {
    prefixCls: PropTypes.string,
    transitionName: PropTypes.string,
    animation: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    style: PropTypes.object,
    maxCount: PropTypes.number,
    closeIcon: PropTypes.node,
  };

  static defaultProps = {
    prefixCls: 'rc-notification',
    animation: 'fade',
    style: {
      top: 65,
      left: '50%',
    },
  };

  state = {
    notices: [],
  };

  getTransitionName() {
    const { prefixCls, animation } = this.props;
    let { transitionName } = this.props;
    if (!transitionName && animation) {
      transitionName = `${prefixCls}-${animation}`;
    }
    return transitionName;
  }

  add = notice => {
    notice.key = notice.key || getUuid();
    const { key } = notice;
    const { maxCount } = this.props;
    this.setState(previousState => {
      const { notices } = previousState;
      const noticeIndex = notices.map(v => v.key).indexOf(key);
      const updatedNotices = notices.concat();
      if (noticeIndex !== -1) {
        updatedNotices.splice(noticeIndex, 1, notice);
      } else {
        if (maxCount && notices.length >= maxCount) {
          // XXX, use key of first item to update new added (let React to move exsiting
          // instead of remove and mount). Same key was used before for both a) external
          // manual control and b) internal react 'key' prop , which is not that good.
          notice.updateKey = updatedNotices[0].updateKey || updatedNotices[0].key;
          updatedNotices.shift();
        }
        updatedNotices.push(notice);
      }
      return {
        notices: updatedNotices,
      };
    });
  };

  remove = key => {
    this.setState(previousState => ({
      notices: previousState.notices.filter(notice => notice.key !== key),
    }));
  };

  render() {
    const { notices } = this.state;
    const { prefixCls, className, closeIcon, style } = this.props;
    const noticeNodes = notices.map((notice, index) => {
      const update = Boolean(index === notices.length - 1 && notice.updateKey);
      const key = notice.updateKey ? notice.updateKey : notice.key;
      const onClose = createChainedFunction(this.remove.bind(this, notice.key), notice.onClose);
      return (
        <Notice
          prefixCls={prefixCls}
          closeIcon={closeIcon}
          {...notice}
          key={key}
          update={update}
          onClose={onClose}
          onClick={notice.onClick}
        >
          {notice.content}
        </Notice>
      );
    });
    return (
      <div className={classnames(prefixCls, className)} style={style}>
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

  // Only used for test case usage
  if (process.env.NODE_ENV === 'test' && properties.TEST_RENDER) {
    properties.TEST_RENDER(<Notification {...props} ref={ref} />);
    return;
  }

  ReactDOM.render(<Notification {...props} ref={ref} />, div);
};

export default Notification;
