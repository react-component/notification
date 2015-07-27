'use strict';

import React from 'react';
import Animate from 'rc-animate';
import {createChainedFunction, classSet} from 'rc-util';

var Notice = React.createClass({
  getDefaultProps() {
    return {
      onEnd() {
      },
      duration: 1.5,
      style: {
        right: '50%'
      }
    };
  },

  clearCloseTimer() {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  },

  componentDidUpdate() {
    this.componentDidMount();
  },

  componentDidMount() {
    this.clearCloseTimer();
    if (this.props.duration) {
      this.closeTimer = setTimeout(()=> {
        this.close();
      }, this.props.duration * 1000);
    }
  },

  componentWillUnmount() {
    this.clearCloseTimer();
  },

  close() {
    this.clearCloseTimer();
    this.props.onClose();
  },

  render() {
    var props = this.props;
    var componentClass = `${props.prefixCls}-notice`;
    var className = {
      [`${componentClass}`]: 1,
      [`${componentClass}-closable`]: props.closable,
      [props.className]: !!props.className
    };
    return (
      <div className={classSet(className)} style={props.style}>
        <div className={`${componentClass}-content`}>{this.props.children}</div>
        {props.closable ?
          <a tabIndex="0" onClick={this.close} className={`${componentClass}-close`}>
            <span className={`${componentClass}-close-x`}></span>
          </a> : null
        }
      </div>
    );
  }
});

var seed = 0;
var now = Date.now();

function getUuid() {
  return 'rcNotification_' + now + '_' + (seed++);
}

var Notification = React.createClass({
  getInitialState() {
    return {
      notices: []
    };
  },

  getDefaultProps() {
    return {
      prefixCls: 'rc-notification',
      animation: 'fade',
      style: {
        'top': 65,
        left: '50%'
      }
    };
  },

  remove(key) {
    var notices = this.state.notices.filter((notice) => {
      return notice.key !== key;
    });
    this.setState({
      notices: notices
    });
  },

  add(notice) {
    var key = notice.key = notice.key || getUuid();
    var notices = this.state.notices;
    if (!notices.filter((v) =>  v.key === key).length) {
      this.setState({
        notices: notices.concat(notice)
      });
    }
  },

  getTransitionName() {
    var props = this.props;
    var transitionName = props.transitionName;
    if (!transitionName && props.animation) {
      transitionName = `${props.prefixCls}-${props.animation}`;
    }
    return transitionName;
  },

  render() {
    var props = this.props;
    var noticeNodes = this.state.notices.map((notice)=> {
      var onClose = createChainedFunction(this.remove.bind(this, notice.key), notice.onClose);
      return (<Notice prefixCls={props.prefixCls} {...notice} onClose={onClose}>{notice.content}</Notice>);
    });
    var className = {
      [props.prefixCls]: 1,
      [props.className]: !!props.className
    };
    return (
      <div className={classSet(className)} style={props.style}>
        <Animate transitionName={this.getTransitionName()}>{noticeNodes}</Animate>
      </div>
    );
  }
});

Notification.newInstance = function (props) {
  props = props || {};
  var div = document.createElement('div');
  document.body.appendChild(div);
  var notification = React.render(<Notification {...props}/>, div);
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
    }
  };
};

module.exports = Notification;
