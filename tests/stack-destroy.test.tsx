import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { useNotification } from '../src';
import type { NotificationAPI } from '../src';

describe('stack destroy', () => {
  it('resumes remaining timers only when a hovered notice is destroyed', () => {
    vi.useFakeTimers();
    const step = (time: number) => {
      act(() => {
        for (let elapsed = 0; elapsed < time; elapsed += 16) {
          vi.advanceTimersByTime(16);
        }
      });
    };
    let api: NotificationAPI;
    const Demo = () => {
      const [instance, holder] = useNotification({ stack: true });
      api = instance;
      return holder;
    };
    const { getByText, unmount } = render(<Demo />);
    try {
      act(() => {
        for (let key = 0; key < 6; key += 1) {
          api.open({ key, description: `Notice ${key}`, duration: key === 1 ? 0 : 1 });
        }
      });
      step(320);
      fireEvent.mouseEnter(getByText('Notice 0'));
      act(() => api.close(5));
      step(2000);
      expect(document.querySelector('.rc-notification-list-hovered')).not.toBeNull();
      expect(document.querySelectorAll('.rc-notification-notice')).toHaveLength(5);

      // Unmount the hovered notice without dispatching mouseleave.
      act(() => api.close(0));
      expect(document.querySelector('.rc-notification-list-hovered')).toBeNull();
      expect(document.querySelector('.rc-notification-stack-expanded')).toBeNull();
      step(400);
      expect(document.querySelectorAll('.rc-notification-notice')).toHaveLength(4);
      step(400);
      expect(document.querySelectorAll('.rc-notification-notice')).toHaveLength(1);
      expect(getByText('Notice 1')).toBeInTheDocument();
    } finally {
      unmount();
      vi.useRealTimers();
    }
  });
});
