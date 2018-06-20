import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

export default class Notice extends Component {
  static propTypes = {
    duration: PropTypes.number,
    onClose: PropTypes.func,
    children: PropTypes.any,
    update: PropTypes.bool,
  };

  static defaultProps = {
    onEnd() {
    },
    onClose() {
    },
    duration: 1.5,
    style: {
      right: '50%',
    },
  };

  componentDidMount() {
    this.startCloseTimer();
  }

  componentDidUpdate(prevProps) {
    if (this.props.duration !== prevProps.duration
      || this.props.update) {
      this.restartCloseTimer();
    }
  }

  componentWillUnmount() {
    this.clearCloseTimer();
  }

  close = () => {
    this.clearCloseTimer();
    this.props.onClose();
  }

  startCloseTimer = () => {
    if (this.props.duration) {
      this.closeTimer = setTimeout(() => {
        this.close();
      }, this.props.duration * 1000);
    }
  }

  clearCloseTimer = () => {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }

  restartCloseTimer() {
    this.clearCloseTimer();
    this.startCloseTimer();
  }

  render() {
    const props = this.props;
    const componentClass = `${props.prefixCls}-notice`;
    const className = {
      [`${componentClass}`]: 1,
      [`${componentClass}-closable`]: props.closable,
      [props.className]: !!props.className,
    };
    const dataOrAriaAttributeProps = Object.keys(props).reduce((prev, key) => {
      if ((key.substr(0, 5) === 'data-' || key.substr(0, 5) === 'aria-' || key === 'role')) {
        prev[key] = props[key];
      }
      return prev;
    }, {});
    return (
      <div
        className={classNames(className)}
        style={props.style}
        onMouseEnter={this.clearCloseTimer}
        onMouseLeave={this.startCloseTimer}
        {...dataOrAriaAttributeProps}
      >
        <div className={`${componentClass}-content`}>{props.children}</div>
          {props.closable ?
            <a tabIndex="0" onClick={this.close} className={`${componentClass}-close`}>
              <span className={`${componentClass}-close-x`}></span>
            </a> : null
          }
      </div>
    );
  }
}
