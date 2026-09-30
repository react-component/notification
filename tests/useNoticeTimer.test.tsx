import { act, renderHook } from '@testing-library/react';
import useNoticeTimer from '../src/hooks/useNoticeTimer';

describe('useNoticeTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('preserves the remaining duration when paused repeatedly', () => {
    const onClose = vi.fn();
    const onUpdate = vi.fn();
    const { result, unmount } = renderHook(() => useNoticeTimer(1, onClose, onUpdate));

    act(() => vi.advanceTimersByTime(200));
    act(() => result.current[1]());
    const updateCount = onUpdate.mock.calls.length;

    for (let i = 0; i < 3; i += 1) {
      act(() => vi.advanceTimersByTime(2000));
      act(() => result.current[1]());
    }

    expect(onUpdate).toHaveBeenCalledTimes(updateCount);
    expect(onClose).not.toHaveBeenCalled();

    act(() => result.current[0]());
    expect(onUpdate).toHaveBeenLastCalledWith(0.2);
    expect(onClose).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(700));
    expect(onClose).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(200));
    expect(onUpdate).toHaveBeenLastCalledWith(1);
    expect(onClose).toHaveBeenCalledTimes(1);

    unmount();
  });
});
