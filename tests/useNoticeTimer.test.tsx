import React, { act } from 'react';
import { fireEvent, render } from '@testing-library/react';
import useNoticeTimer from '../src/hooks/useNoticeTimer';

function TimerDemo({
  duration,
  onClose,
  onUpdate,
}: {
  duration: number | false;
  onClose: VoidFunction;
  onUpdate: (ptg: number) => void;
}) {
  const [onResume, onPause] = useNoticeTimer(duration, onClose, onUpdate);

  return (
    <>
      <button type="button" data-testid="pause" onClick={onPause} />
      <button type="button" data-testid="resume" onClick={onResume} />
    </>
  );
}

describe('useNoticeTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('closes after duration and reports progress from 0 to 1', () => {
    const onClose = vi.fn();
    const updates: number[] = [];

    render(<TimerDemo duration={1} onClose={onClose} onUpdate={(ptg) => updates.push(ptg)} />);

    expect(updates.at(-1) ?? 0).toBe(0);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onClose).not.toHaveBeenCalled();
    expect(updates.at(-1) ?? 0).toBeGreaterThan(0.4);
    expect(updates.at(-1) ?? 0).toBeLessThan(0.7);

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(updates.at(-1)).toBe(1);
  });

  it('keeps the remaining time across pause and resume', () => {
    const onClose = vi.fn();
    const updates: number[] = [];

    const { getByTestId } = render(
      <TimerDemo duration={1} onClose={onClose} onUpdate={(ptg) => updates.push(ptg)} />,
    );

    act(() => {
      vi.advanceTimersByTime(400);
    });

    const pausedProgress = updates.at(-1) ?? 0;

    act(() => {
      fireEvent.click(getByTestId('pause'));
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onClose).not.toHaveBeenCalled();
    expect(updates.at(-1)).toBe(pausedProgress);

    act(() => {
      fireEvent.click(getByTestId('resume'));
    });

    act(() => {
      vi.advanceTimersByTime(550);
    });

    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(updates.at(-1)).toBe(1);
  });

  it('recomputes progress and remaining time when duration changes', () => {
    const onClose = vi.fn();
    const updates: number[] = [];

    const { rerender } = render(
      <TimerDemo duration={1} onClose={onClose} onUpdate={(ptg) => updates.push(ptg)} />,
    );

    act(() => {
      vi.advanceTimersByTime(400);
    });

    act(() => {
      rerender(
        <TimerDemo duration={0.5} onClose={onClose} onUpdate={(ptg) => updates.push(ptg)} />,
      );
    });

    expect(updates.at(-1) ?? 0).toBeGreaterThan(0.75);
    expect(updates.at(-1) ?? 0).toBeLessThanOrEqual(1);

    act(() => {
      vi.advanceTimersByTime(64);
    });

    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(96);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(updates.at(-1)).toBe(1);
  });

  it('resets progress to 0 and stops closing when duration becomes false', () => {
    const onClose = vi.fn();
    const updates: number[] = [];

    const { getByTestId, rerender } = render(
      <TimerDemo duration={1} onClose={onClose} onUpdate={(ptg) => updates.push(ptg)} />,
    );

    act(() => {
      vi.advanceTimersByTime(400);
    });

    act(() => {
      rerender(
        <TimerDemo duration={false} onClose={onClose} onUpdate={(ptg) => updates.push(ptg)} />,
      );
    });

    expect(updates.at(-1)).toBe(0);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onClose).not.toHaveBeenCalled();
    expect(updates.at(-1)).toBe(0);

    act(() => {
      fireEvent.click(getByTestId('resume'));
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onClose).not.toHaveBeenCalled();
    expect(updates.at(-1)).toBe(0);
  });
});
