import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import type { NotificationAPI, NotificationConfig } from '../src';
import { Notification, NotificationList, useNotification } from '../src';

describe('closable attributes', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function renderDemo(config?: NotificationConfig) {
    let instance: NotificationAPI;
    const Demo = () => {
      const [api, holder] = useNotification(config);
      instance = api;
      return holder;
    };
    return { ...render(<Demo />), instance };
  }

  it.each(['root', 'notice'])('forwards %s closable attributes to the close button', (source) => {
    const closableOnClose = vi.fn();
    const onClose = vi.fn();
    const onAllRemoved = vi.fn();
    const onClick = vi.fn();
    const closable = {
      'data-testid': 'notification-close',
      'data-count': 0,
      'aria-label': 'Dismiss notification',
      role: 'button',
      closeIcon: 'Dismiss',
      disabled: true,
      onClose: closableOnClose,
      title: 'Not a close button attribute',
      onClick,
    };
    const { instance, getByTestId } = renderDemo({
      closable: source === 'root' ? closable : false,
      onAllRemoved,
    });

    act(() => {
      instance.open({
        key: 'notice',
        duration: 0,
        description: 'Notice',
        closable: source === 'notice' ? closable : undefined,
        onClose,
        onClick,
      });
    });

    const button = getByTestId('notification-close');
    expect(button).toBe(document.querySelector('button.rc-notification-notice-close'));
    expect(button).toHaveAttribute('data-count', '0');
    expect(button).toHaveAttribute('aria-label', 'Dismiss notification');
    expect(button).toHaveAttribute('role', 'button');
    expect(button).toHaveTextContent('Dismiss');
    // Notification currently keeps the close button enabled for disabled configs.
    expect(button).not.toBeDisabled();
    expect(button).not.toHaveAttribute('title');
    expect(button).not.toHaveAttribute('closeIcon');
    expect(closableOnClose).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(onAllRemoved).not.toHaveBeenCalled();

    fireEvent.click(button);
    act(() => {
      vi.runAllTimers();
    });
    expect(closableOnClose).toHaveBeenCalledTimes(1);
    expect(closableOnClose).toHaveBeenCalledWith();
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith();
    expect(onAllRemoved).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
    expect(document.querySelector('.rc-notification-notice')).toBeNull();
  });

  it('replaces default closable attributes with the notice config', () => {
    const { instance, getByTestId } = renderDemo({
      duration: 0,
      closable: { 'data-testid': 'root-close', 'data-root': 'root', 'aria-label': 'Root' },
    });
    act(() => {
      instance.open({ key: 'notice', closable: undefined });
    });
    expect(getByTestId('root-close')).toHaveAttribute('aria-label', 'Root');

    act(() => {
      instance.open({ key: 'notice', closable: { 'data-testid': 'notice-close' } });
    });
    expect(getByTestId('notice-close')).toHaveAttribute('aria-label', 'Close');
    expect(getByTestId('notice-close')).not.toHaveAttribute('data-root');

    act(() => {
      instance.open({ key: 'notice', closable: true });
    });
    const button = document.querySelector('button.rc-notification-notice-close');
    expect(button).toHaveAttribute('aria-label', 'Close');
    expect(button).not.toHaveAttribute('data-testid');
    expect(button).not.toHaveAttribute('data-root');

    act(() => {
      instance.open({ key: 'notice', closable: false });
    });
    expect(document.querySelector('.rc-notification-notice-close')).toBeNull();
  });

  it('supports closable data-* through Notification and NotificationList', () => {
    const { getByTestId } = render(
      <>
        <Notification
          prefixCls="rc-notification"
          duration={0}
          closable={{ 'data-testid': 'component-close' }}
        />
        <NotificationList
          placement="topRight"
          configList={[{ key: 'notice', duration: 0, closable: { 'data-testid': 'list-close' } }]}
        />
      </>,
    );
    for (const testId of ['component-close', 'list-close']) {
      const button = getByTestId(testId);
      expect(button.tagName).toBe('BUTTON');
      expect(button).toHaveClass('rc-notification-notice-close');
      expect(button).toHaveAttribute('aria-label', 'Close');
    }
  });
});
