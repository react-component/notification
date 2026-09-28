import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import NotificationList from '../src/NotificationList';
import type { NotificationListConfig } from '../src/NotificationList';

function notices(count: number): NotificationListConfig[] {
  return Array.from({ length: count }, (_, key) => ({
    key,
    description: `Notice ${key}`,
    duration: 0,
  }));
}

function step(time: number) {
  act(() => {
    for (let elapsed = 0; elapsed < time; elapsed += 16) {
      vi.advanceTimersByTime(16);
    }
  });
}

describe('stack hover cleanup', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it.each([
    [4, 3],
    [5, 3],
    [4, 2],
  ])(
    'resumes remaining duration when the hovered notice unmounts (%i notices, threshold %i)',
    (count, threshold) => {
      const onClose = vi.fn();
      const configs = notices(count).map((config) => ({
        ...config,
        duration: config.key === 1 ? 0 : 1,
        onClose,
      }));
      const renderList = (configList: NotificationListConfig[]) => (
        <NotificationList placement="topRight" stack={{ threshold }} configList={configList} />
      );
      const { container, getByText, rerender } = render(renderList(configs));
      step(320);
      fireEvent.mouseEnter(getByText('Notice 0'));
      step(2000);
      expect(onClose).not.toHaveBeenCalled();
      rerender(renderList(configs.slice(1)));
      expect(container.querySelector('.rc-notification-list-hovered')).toBeNull();
      expect(!!container.querySelector('.rc-notification-stack-expanded')).toBe(
        count - 1 <= threshold,
      );
      step(400);
      expect(onClose).not.toHaveBeenCalled();
      step(400);
      expect(onClose).toHaveBeenCalledTimes(count - 2);
    },
  );

  it('keeps hovering when an unrelated notice unmounts', () => {
    const configs = notices(5);
    const { container, getByText, rerender } = render(
      <NotificationList placement="topRight" stack configList={configs} />,
    );
    fireEvent.mouseEnter(getByText('Notice 0'));
    rerender(<NotificationList placement="topRight" stack configList={configs.slice(0, -1)} />);
    expect(container.querySelector('.rc-notification-list-hovered')).not.toBeNull();
    expect(container.querySelector('.rc-notification-stack-expanded')).not.toBeNull();
  });

  it('does not let an old hovered notice clear a newer hover', () => {
    const configs = notices(5);
    const { container, getByText, rerender } = render(
      <NotificationList placement="topRight" stack configList={configs} />,
    );
    fireEvent.mouseEnter(getByText('Notice 0'));
    // A leaving notice can unmount after another notice receives mouseenter.
    fireEvent.mouseEnter(getByText('Notice 1'));
    rerender(<NotificationList placement="topRight" stack configList={configs.slice(1)} />);
    expect(container.querySelector('.rc-notification-list-hovered')).not.toBeNull();
    rerender(<NotificationList placement="topRight" stack configList={configs.slice(2)} />);
    expect(container.querySelector('.rc-notification-list-hovered')).toBeNull();
  });

  it('preserves hover in list gaps and forwards mouse callbacks', () => {
    const onMouseEnter = vi.fn();
    const onMouseLeave = vi.fn();
    const configs = notices(5);
    configs[0] = { ...configs[0], onMouseEnter, onMouseLeave };
    const { container, getByText, rerender } = render(
      <NotificationList placement="topRight" stack configList={configs} />,
    );
    const list = container.querySelector('.rc-notification-list');
    const notice = getByText('Notice 0').closest('.rc-notification-notice');
    fireEvent.mouseEnter(notice);
    fireEvent.mouseLeave(notice, { relatedTarget: list });
    expect(onMouseEnter).toHaveBeenCalledTimes(1);
    expect(onMouseLeave).toHaveBeenCalledTimes(1);
    rerender(<NotificationList placement="topRight" stack configList={configs.slice(1)} />);
    expect(container.querySelector('.rc-notification-list-hovered')).not.toBeNull();
    fireEvent.mouseLeave(list);
    expect(container.querySelector('.rc-notification-list-hovered')).toBeNull();
  });
});
