import * as React from 'react';
import { Component } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

interface DivProps extends React.HTMLProps<HTMLDivElement> {
  // Ideally we would allow all data-* props but this would depend on https://github.com/microsoft/TypeScript/issues/28960
  'data-testid'?: string;
}

export interface NoticeProps {
  prefixCls: string;
  style?: React.CSSProperties;
  className?: string;
  duration?: number | null;
  children?: React.ReactNode;
  updateMark?: string;
  /** Mark as final key since set maxCount may keep the key but user pass key is different */
  noticeKey: React.Key;
  closeIcon?: React.ReactNode;
  closable?: boolean;
  props?: DivProps;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onClose?: (key: React.Key) => void;

  /** @private Only for internal usage. We don't promise that we will refactor this */
  holder?: HTMLDivElement;

  /** @private Provided by CSSMotionList */
  visible?: boolean;
}

export default class Notice extends Component<NoticeProps> {
  static defaultProps = {
    onClose() {},
    duration: 1.5,
  };

  closeTimer: number | null = null;

  componentDidMount() {
    this.startCloseTimer();
  }

  componentDidUpdate(prevProps: NoticeProps) {
    if (
      this.props.duration !== prevProps.duration ||
      this.props.updateMark !== prevProps.updateMark ||
      // Visible again need reset timer
      (this.props.visible !== prevProps.visible && this.props.visible)
    ) {
      this.restartCloseTimer();
    }
  }

  componentWillUnmount() {
    this.clearCloseTimer();
  }

  close = (e?: React.MouseEvent<HTMLAnchorElement>) => {
    if (e) {
      e.stopPropagation();
    }
    this.clearCloseTimer();
    const { onClose, noticeKey } = this.props;
    if (onClose) {
      onClose(noticeKey);
    }
  };

  startCloseTimer = () => {
    if (this.props.duration) {
      this.closeTimer = window.setTimeout(() => {
        this.close();
      }, this.props.duration * 1000);
    }
  };

  clearCloseTimer = () => {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  };

  restartCloseTimer() {
    this.clearCloseTimer();
    this.startCloseTimer();
  }

  render() {
    const { prefixCls, className, closable, closeIcon, style, onClick, children, holder } =
      this.props;
    const componentClass = `${prefixCls}-notice`;
    const dataOrAriaAttributeProps = Object.keys(this.props).reduce(
      (acc: Record<string, string>, key: string) => {
        if (key.substr(0, 5) === 'data-' || key.substr(0, 5) === 'aria-' || key === 'role') {
          acc[key] = (this.props as any)[key];
        }
        return acc;
      },
      {},
    );
    const node = (
      <div
        className={classNames(componentClass, className, {
          [`${componentClass}-closable`]: closable,
        })}
        style={style}
        onMouseEnter={this.clearCloseTimer}
        onMouseLeave={this.startCloseTimer}
        onClick={onClick}
        {...dataOrAriaAttributeProps}
      >
        <div className={`${componentClass}-content`}>{children}</div>
        {closable ? (
          <a tabIndex={0} onClick={this.close} className={`${componentClass}-close`}>
            {closeIcon || <span className={`${componentClass}-close-x`} />}
          </a>
        ) : null}
      </div>
    );

    if (holder) {
      return ReactDOM.createPortal(node, holder);
    }

    return node;
  }
}
