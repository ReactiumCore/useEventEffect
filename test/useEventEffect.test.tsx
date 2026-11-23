// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Event, EventTarget, useEventEffect, type EventHandlers } from '../src';

afterEach(cleanup);

describe('useEventEffect', () => {
  it('adds handlers by type and passes the event with its detail', () => {
    const target = new EventTarget();
    const onChange = vi.fn();
    const onOther = vi.fn();
    renderHook(() =>
      useEventEffect(target, { change: onChange, other: onOther }),
    );

    target.dispatchEvent(new Event('change', { value: 42 }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toMatchObject({
      type: 'change',
      value: 42,
      target,
    });
    expect(onOther).not.toHaveBeenCalled();
  });

  it('removes its handlers on unmount', () => {
    const target = new EventTarget();
    const onChange = vi.fn();
    const { unmount } = renderHook(() =>
      useEventEffect(target, { change: onChange }),
    );

    unmount();
    target.dispatchEvent(new Event('change'));

    expect(onChange).not.toHaveBeenCalled();
    expect(target.listeners.size).toBe(0);
  });

  it('skips entries that are not functions', () => {
    const target = new EventTarget();
    const onChange = vi.fn();
    const handlers: EventHandlers = {
      change: onChange,
      a: undefined,
      b: null,
      c: false,
    };
    renderHook(() => useEventEffect(target, handlers));

    expect(Array.from(target.listeners.keys())).toEqual(['change']);
  });

  it('does nothing without a target, then subscribes once one is given', () => {
    const target = new EventTarget();
    const onChange = vi.fn();
    const { rerender } = renderHook(
      ({ t }: { t: EventTarget | null }) =>
        useEventEffect(t, { change: onChange }),
      { initialProps: { t: null as EventTarget | null } },
    );

    rerender({ t: target });
    target.dispatchEvent(new Event('change'));

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('moves its handlers when the target changes', () => {
    const first = new EventTarget();
    const second = new EventTarget();
    const onChange = vi.fn();
    const { rerender } = renderHook(
      ({ t }) => useEventEffect(t, { change: onChange }),
      { initialProps: { t: first } },
    );

    rerender({ t: second });
    first.dispatchEvent(new Event('change'));
    second.dispatchEvent(new Event('change'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(first.listeners.size).toBe(0);
  });

  it('keeps the first handlers until deps change', () => {
    const target = new EventTarget();
    const calls: string[] = [];
    const { rerender } = renderHook(
      ({ label, dep }) =>
        useEventEffect(target, { change: () => calls.push(label) }, [dep]),
      { initialProps: { label: 'a', dep: 1 } },
    );

    rerender({ label: 'b', dep: 1 });
    target.dispatchEvent(new Event('change'));

    rerender({ label: 'c', dep: 2 });
    target.dispatchEvent(new Event('change'));

    expect(calls).toEqual(['a', 'c']);
    expect(target.listeners.get('change')?.size).toBe(1);
  });

  it('works with a DOM EventTarget', () => {
    const onClick = vi.fn();
    renderHook(() => useEventEffect(window, { click: onClick }));

    act(() => {
      window.dispatchEvent(new window.Event('click'));
    });

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
