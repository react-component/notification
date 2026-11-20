import { act, render } from '@testing-library/react';
import React from 'react';
import Notification from '../src/Notification';

function advanceFrames(count: number) {
  for (let frame = 0; frame < count; frame += 1) {
    act(() => vi.advanceTimersByTime(16));
  }
}

describe('Notification timer rendering', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it.each([undefined, false])(
    'does not render hidden progress on timer ticks (%s)',
    (showProgress) => {
      const onRender = vi.fn();
      const onClose = vi.fn();
      const { queryByRole, unmount } = render(
        <React.Profiler id="notification" onRender={onRender}>
          <Notification
            prefixCls="rc-notification"
            description="Notice"
            duration={1}
            showProgress={showProgress}
            onClose={onClose}
          />
        </React.Profiler>,
      );
      const initialRenderCount = onRender.mock.calls.length;

      advanceFrames(32);

      expect(onRender).toHaveBeenCalledTimes(initialRenderCount);
      expect(queryByRole('progressbar')).toBeNull();
      expect(onClose).not.toHaveBeenCalled();

      advanceFrames(32);
      expect(onClose).toHaveBeenCalledTimes(1);
      unmount();
    },
  );

  it('continues rendering visible progress and closes at the original duration', () => {
    const onClose = vi.fn();
    const { getByRole, unmount } = render(
      <Notification prefixCls="rc-notification" duration={1} showProgress onClose={onClose} />,
    );

    advanceFrames(32);
    expect((getByRole('progressbar') as HTMLProgressElement).value).toBeCloseTo(48.8, 1);
    expect(onClose).not.toHaveBeenCalled();

    advanceFrames(32);
    expect(onClose).toHaveBeenCalledTimes(1);
    unmount();
  });

  it('updates progress when enabled during an existing countdown without restarting it', () => {
    const onClose = vi.fn();
    const onRender = vi.fn();
    const notice = (showProgress: boolean) => (
      <React.Profiler id="notification" onRender={onRender}>
        <Notification
          prefixCls="rc-notification"
          duration={1}
          showProgress={showProgress}
          onClose={onClose}
        />
      </React.Profiler>
    );
    const { rerender, getByRole, unmount } = render(notice(false));

    advanceFrames(16);
    rerender(notice(true));
    advanceFrames(16);
    expect((getByRole('progressbar') as HTMLProgressElement).value).toBeCloseTo(48.8, 1);

    rerender(notice(false));
    const renderCount = onRender.mock.calls.length;
    advanceFrames(16);
    expect(onRender).toHaveBeenCalledTimes(renderCount);
    expect(onClose).not.toHaveBeenCalled();

    advanceFrames(16);
    expect(onClose).toHaveBeenCalledTimes(1);
    unmount();
  });

  it('shows elapsed progress when enabled while the countdown is paused', () => {
    const onClose = vi.fn();
    const notice = (showProgress: boolean, hovering: boolean) => (
      <Notification
        prefixCls="rc-notification"
        duration={1}
        showProgress={showProgress}
        hovering={hovering}
        onClose={onClose}
      />
    );
    const { rerender, getByRole, unmount } = render(notice(false, false));

    advanceFrames(16);
    rerender(notice(false, true));
    advanceFrames(32);
    rerender(notice(true, true));

    expect((getByRole('progressbar') as HTMLProgressElement).value).toBeCloseTo(74.4, 1);
    advanceFrames(16);
    expect((getByRole('progressbar') as HTMLProgressElement).value).toBeCloseTo(74.4, 1);
    expect(onClose).not.toHaveBeenCalled();

    rerender(notice(true, false));
    advanceFrames(48);
    expect(onClose).toHaveBeenCalledTimes(1);
    unmount();
  });
});
