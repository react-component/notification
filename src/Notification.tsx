import React, { Component, ReactText } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import { CSSMotionList } from 'rc-motion';
import createChainedFunction from 'rc-util/lib/createChainedFunction';
import Notice, { NoticeProps } from './Notice';
import useNotification from './useNotification';

let seed = 0;
const now = Date.now();

function getUuid() {
  const id = seed;
  seed += 1;
  return `rcNotification_${now}_${id}`;
}

export interface NoticeContent extends Omit<NoticeProps, 'prefixCls' | 'children'> {
  prefixCls?: string;
  key?: React.Key;
  updateKey?: React.Key;
  content?: React.ReactNode;
}

export type NoticeFunc = (noticeProps: NoticeContent) => void;
export type HolderReadyCallback = (
  div: HTMLDivElement,
  noticeProps: NoticeProps & { key: React.Key },
) => void;

export interface NotificationInstance {
  notice: NoticeFunc;
  removeNotice: (key: React.Key) => void;
  destroy: () => void;
  component: Notification;

  useNotification: () => [NoticeFunc, React.ReactElement];
}

export interface NotificationProps {
  prefixCls?: string;
  className?: string;
  style?: React.CSSProperties;
  transitionName?: string;
  animation?: string | object;
  maxCount?: number;
  closeIcon?: React.ReactNode;
}

interface NotificationState {
  notices: {
    notice: NoticeContent;
    holderCallback?: HolderReadyCallback;
  }[];
}

class Notification extends Component<NotificationProps, NotificationState> {
  static newInstance: (
    properties: NotificationProps & { getContainer?: () => HTMLElement },
    callback: (instance: NotificationInstance) => void,
  ) => void;

  static defaultProps = {
    prefixCls: 'rc-notification',
    animation: 'fade',
    style: {
      top: 65,
      left: '50%',
    },
  };

  state: NotificationState = {
    notices: [],
  };

  private hookRefs = new Map<React.Key, HTMLDivElement>();

  getTransitionName() {
    const { prefixCls, animation } = this.props;
    let { transitionName } = this.props;
    if (!transitionName && animation) {
      transitionName = `${prefixCls}-${animation}`;
    }
    return transitionName;
  }

  add = (notice: NoticeContent, holderCallback?: HolderReadyCallback) => {
    // eslint-disable-next-line no-param-reassign
    notice.key = notice.key || getUuid();
    const { key } = notice;
    const { maxCount } = this.props;
    this.setState(previousState => {
      const { notices } = previousState;
      const noticeIndex = notices.map(v => v.notice.key).indexOf(key);
      const updatedNotices = notices.concat();
      if (noticeIndex !== -1) {
        updatedNotices.splice(noticeIndex, 1, { notice, holderCallback });
      } else {
        if (maxCount && notices.length >= maxCount) {
          // XXX, use key of first item to update new added (let React to move exsiting
          // instead of remove and mount). Same key was used before for both a) external
          // manual control and b) internal react 'key' prop , which is not that good.
          // eslint-disable-next-line no-param-reassign
          notice.updateKey = updatedNotices[0].notice.updateKey || updatedNotices[0].notice.key;
          updatedNotices.shift();
        }
        updatedNotices.push({ notice, holderCallback });
      }
      return {
        notices: updatedNotices,
      };
    });
  };

  remove = (key: React.Key) => {
    this.setState(({ notices }) => ({
      notices: notices.filter(({ notice }) => notice.key !== key),
    }));
  };

  noticePropsMap: Record<
    React.Key,
    {
      props: NoticeProps & {
        key: ReactText;
      };
      holderCallback?: HolderReadyCallback;
    }
  > = {};

  render() {
    const { notices } = this.state;
    const { prefixCls, className, closeIcon, style } = this.props;

    const noticeKeys: React.Key[] = [];

    notices.forEach(({ notice, holderCallback }, index) => {
      const update = Boolean(index === notices.length - 1 && notice.updateKey);
      const key = notice.updateKey ? notice.updateKey : notice.key;

      const onClose = createChainedFunction(
        this.remove.bind(this, notice.key!),
        notice.onClose,
      ) as any;

      const noticeProps = {
        prefixCls,
        closeIcon,
        ...notice,
        ...notice.props,
        key,
        update,
        onClose,
        onClick: notice.onClick,
        children: notice.content,
      } as NoticeProps & { key: ReactText };

      // Give to motion
      noticeKeys.push(key);
      this.noticePropsMap[key] = { props: noticeProps, holderCallback };
    });

    return (
      <div className={classNames(prefixCls, className)} style={style}>
        <CSSMotionList
          keys={noticeKeys}
          motionName={this.getTransitionName()}
          onLeaveEnd={(_, __, { key }) => {
            delete this.noticePropsMap[key];
          }}
        >
          {({ key, className: motionClassName, style: motionStyle }) => {
            const { props: noticeProps, holderCallback } = this.noticePropsMap[key];
            if (holderCallback) {
              return (
                <div
                  key={key}
                  className={classNames(motionClassName, `${prefixCls}-hook-holder`)}
                  style={{ ...motionStyle }}
                  ref={div => {
                    if (typeof key === 'undefined') {
                      return;
                    }

                    if (div) {
                      this.hookRefs.set(key, div);
                      holderCallback(div, noticeProps);
                    } else {
                      this.hookRefs.delete(key);
                    }
                  }}
                />
              );
            }

            return (
              <Notice
                {...noticeProps}
                className={classNames(motionClassName, noticeProps?.className)}
                style={{ ...motionStyle, ...noticeProps?.style }}
              />
            );
          }}
        </CSSMotionList>
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
  function ref(notification: Notification) {
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
        if (div.parentNode) {
          div.parentNode.removeChild(div);
        }
      },

      // Hooks
      useNotification() {
        return useNotification(notification);
      },
    });
  }

  // Only used for test case usage
  if (process.env.NODE_ENV === 'test' && (properties as any).TEST_RENDER) {
    (properties as any).TEST_RENDER(<Notification {...props} ref={ref} />);
    return;
  }

  ReactDOM.render(<Notification {...props} ref={ref} />, div);
};

export default Notification;
