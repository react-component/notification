import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { useNotification } from '../src';
import type { NotificationAPI } from '../src';

describe('stack hover recovery', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function step(time: number) {
    act(() => {
      for (let elapsed = 0; elapsed < time; elapsed += 16) {
        vi.advanceTimersByTime(16);
      }
    });
  }

  it.each(['open', 'closed'] as const)('preserves hover within a %s shadow container', (mode) => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const outerRoot = host.attachShadow({ mode: 'closed' });
    const innerHost = document.createElement('div');
    const outside = document.createElement('button');
    outerRoot.append(innerHost, outside);
    const shadowRoot = innerHost.attachShadow({ mode });
    let api: NotificationAPI;
    const Demo = () => {
      const [instance, holder] = useNotification({
        getContainer: () => shadowRoot,
        stack: { threshold: 1 },
        pauseOnHover: true,
      });
      api = instance;
      return holder;
    };
    const { unmount } = render(<Demo />);
    for (const destination of [outside, document.body, innerHost, host]) {
      act(() => {
        for (let key = 0; key < 3; key += 1) {
          api.open({ key, description: `Notice ${key}`, duration: 1, closable: true });
        }
      });
      const notices = shadowRoot.querySelectorAll('.rc-notification-notice');
      expect(notices).toHaveLength(3);
      const list = shadowRoot.querySelector('.rc-notification-list');
      let pointerInside = true;
      const matches = list.matches.bind(list);
      // jsdom has no pointer hit testing. Model only its native :hover result.
      const hoverState = vi
        .spyOn(list, 'matches')
        .mockImplementation((selector) =>
          selector === ':hover' ? pointerInside : matches(selector),
        );
      fireEvent.mouseEnter(notices[0]);
      fireEvent.mouseMove(notices[1]);
      expect(shadowRoot.querySelector('.rc-notification-list-hovered')).not.toBeNull();
      step(2000);
      expect(shadowRoot.querySelectorAll('.rc-notification-notice')).toHaveLength(3);
      fireEvent.click(notices[0].querySelector('button'));
      pointerInside = false;
      fireEvent.mouseMove(destination);
      expect(shadowRoot.querySelector('.rc-notification-list-hovered')).toBeNull();
      step(1100);
      expect(shadowRoot.querySelectorAll('.rc-notification-notice')).toHaveLength(0);
      hoverState.mockRestore();
    }
    unmount();
    host.remove();
  });

  it.each([
    [4, 3],
    [5, 3],
    [4, 2],
  ])('resumes after removing a hovered notice (%i notices, threshold %i)', (count, threshold) => {
    let api: NotificationAPI;
    const closed: number[] = [];
    const Demo = () => {
      const [instance, holder] = useNotification({ stack: { threshold }, pauseOnHover: true });
      api = instance;
      return (
        <>
          {holder}
          <button onMouseMove={(event) => event.stopPropagation()}>Outside</button>
        </>
      );
    };
    const { getByText, unmount } = render(<Demo />);

    for (let round = 0; round < 2; round += 1) {
      act(() => {
        for (let key = 0; key < count; key += 1) {
          api.open({
            key,
            description: `Existing content ${key}`,
            duration: key === 1 ? 0 : 1,
            closable: true,
            onClose: () => closed.push(key),
          });
        }
      });
      expect(document.querySelectorAll('.rc-notification-notice')).toHaveLength(count);
      step(320);
      const firstNotice = getByText('Existing content 0').closest('.rc-notification-notice');
      fireEvent.mouseEnter(firstNotice);
      fireEvent.click(firstNotice.querySelector('button'));
      expect(getByText('Existing content 1')).toBeInTheDocument();
      expect(document.querySelectorAll('.rc-notification-notice')).toHaveLength(count - 1);

      // Removing the hovered DOM node can omit React's mouseleave event.
      step(2000);
      fireEvent.mouseMove(getByText('Existing content 2'));
      step(2000);
      expect(document.querySelectorAll('.rc-notification-notice')).toHaveLength(count - 1);

      fireEvent.mouseMove(getByText('Outside'));
      expect(document.querySelector('.rc-notification-list-hovered')).toBeNull();
      expect(!!document.querySelector('.rc-notification-stack-expanded')).toBe(
        count - 1 <= threshold,
      );
      step(400);
      expect(document.querySelectorAll('.rc-notification-notice')).toHaveLength(count - 1);
      step(400);
      expect(document.querySelectorAll('.rc-notification-notice')).toHaveLength(1);
      expect(getByText('Existing content 1')).toBeInTheDocument();
      expect(closed.slice(round * (count - 1))).toEqual([
        0,
        ...Array.from({ length: count - 2 }, (_, index) => index + 2),
      ]);
    }
    unmount();
    fireEvent.mouseMove(document.body);
  });
});
