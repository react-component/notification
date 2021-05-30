import * as React from 'react';
import { Component } from 'react';
import type { ReactText } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import { CSSMotionList } from 'rc-motion';
import type { NoticeProps } from './Notice';
import Notice from './Notice';
import useNotification from './useNotification';

let seed = 0;
const now = Date.now();

function getUuid() {
  const id = seed;
  seed += 1;
  return `rcNotification_${now}_${id}`;
}

export interface NoticeContent
  extends Omit<NoticeProps, 'prefixCls' | 'children' | 'noticeKey' | 'onClose'> {
  prefixCls?: string;
  key?: React.Key;
  updateMark?: string;
  content?: React.ReactNode;
  onClose?: () => void;
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
    notice: NoticeContent & {
      userPassKey?: React.Key;
    };
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

  /**
   * @private Internal props do not call it directly.
   * We do not make this as private is caused TS will trade private as
   * different prop that between es and lib
   */
  hookRefs = new Map<React.Key, HTMLDivElement>();

  getTransitionName() {
    const { prefixCls, animation } = this.props;
    let { transitionName } = this.props;
    if (!transitionName && animation) {
      transitionName = `${prefixCls}-${animation}`;
    }
    return transitionName;
  }

  add = (originNotice: NoticeContent, holderCallback?: HolderReadyCallback) => {
    const key = originNotice.key || getUuid();
    const notice: NoticeContent & { key: React.Key; userPassKey?: React.Key } = {
      ...originNotice,
      key,
    };
    const { maxCount } = this.props;
    this.setState((previousState: NotificationState) => {
      const { notices } = previousState;
      const noticeIndex = notices.map((v) => v.notice.key).indexOf(key);
      const updatedNotices = notices.concat();
      if (noticeIndex !== -1) {
        updatedNotices.splice(noticeIndex, 1, { notice, holderCallback });
      } else {
        if (maxCount && notices.length >= maxCount) {
          // XXX, use key of first item to update new added (let React to move exsiting
          // instead of remove and mount). Same key was used before for both a) external
          // manual control and b) internal react 'key' prop , which is not that good.
          // eslint-disable-next-line no-param-reassign

          // zombieJ: Not know why use `updateKey`. This makes Notice infinite loop in jest.
          // Change to `updateMark` for compare instead.
          // https://github.com/react-component/notification/commit/32299e6be396f94040bfa82517eea940db947ece
          notice.key = updatedNotices[0].notice.key as React.Key;
          notice.updateMark = getUuid();

          // zombieJ: That's why. User may close by key directly.
          // We need record this but not re-render to avoid upper issue
          // https://github.com/react-component/notification/issues/129
          notice.userPassKey = key;

          updatedNotices.shift();
        }
        updatedNotices.push({ notice, holderCallback });
      }
      return {
        notices: updatedNotices,
      };
    });
  };

  remove = (removeKey: React.Key) => {
    this.setState(({ notices }: NotificationState) => ({
      notices: notices.filter(({ notice: { key, userPassKey } }) => {
        const mergedKey = userPassKey || key;
        return mergedKey !== removeKey;
      }),
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
      const updateMark = index === notices.length - 1 ? notice.updateMark : undefined;
      const { key, userPassKey } = notice;

      const noticeProps = {
        prefixCls,
        closeIcon,
        ...notice,
        ...notice.props,
        key,
        noticeKey: userPassKey || key,
        updateMark,
        onClose: (noticeKey: React.Key) => {
          this.remove(noticeKey);
          notice.onClose?.();
        },
        onClick: notice.onClick,
        children: notice.content,
      } as NoticeProps & { key: ReactText };

      // Give to motion
      noticeKeys.push(key as React.Key);
      this.noticePropsMap[key as React.Key] = { props: noticeProps, holderCallback };
    });

    return (
      <div className={classNames(prefixCls, className)} style={style}>
        <CSSMotionList
          keys={noticeKeys}
          motionName={this.getTransitionName()}
          onVisibleChanged={(changedVisible, { key }) => {
            if (!changedVisible) {
              delete this.noticePropsMap[key];
            }
          }}
        >
          {({ key, className: motionClassName, style: motionStyle, visible }) => {
            const { props: noticeProps, holderCallback } = this.noticePropsMap[key];
            if (holderCallback) {
              return (
                <div
                  key={key}
                  className={classNames(motionClassName, `${prefixCls}-hook-holder`)}
                  style={{ ...motionStyle }}
                  ref={(div) => {
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
                visible={visible}
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
