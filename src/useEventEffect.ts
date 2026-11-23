// A hook to subscribe a component to an event target's events. Built for
// @atomic-reactor/event-handle, where listeners get a copy of the event with
// its detail spread onto it, e.g. dispatching
// new Event('date-changed', { value }) reaches listeners as
// ({ type, value, ... }).
//
// Uses only React and ES2019 built-ins (no DOM or Node APIs), so it runs the
// same in React DOM and React Native.
import { useEffect } from 'react';
import type { Listener } from '@atomic-reactor/event-handle';

// Anything listeners can be added to and removed from: an event-handle
// EventTarget, or a DOM EventTarget such as window or an element
export interface EventTargetLike {
  addEventListener(type: string, listener: Listener): unknown;
  removeEventListener(type: string, listener: Listener): unknown;
}

// Listeners by event type. Entries that aren't functions are skipped, so
// handlers can be added conditionally ({ change: enabled && onChange }).
export type EventHandlers = Record<string, Listener | false | null | undefined>;

// Adds `handlers` ({ type: listener }) to `target` and removes them on unmount
// or when `target` or `deps` change. With no deps they're added once per
// target, so a listener should read current values from a SyncState or a ref
// rather than from its render's closure.
export const useEventEffect = (
  target: EventTargetLike | null | undefined,
  handlers: EventHandlers = {},
  deps: unknown[] = [],
) => {
  useEffect(() => {
    if (!target) return;

    const subs: Array<[string, Listener]> = [];
    Object.keys(handlers).forEach((type) => {
      const listener = handlers[type];
      if (typeof listener === 'function') subs.push([type, listener]);
    });

    subs.forEach(([type, listener]) => target.addEventListener(type, listener));

    return () => {
      subs.forEach(([type, listener]) =>
        target.removeEventListener(type, listener),
      );
    };
    // Handlers are read when the effect runs; callers opt in to re-running it
    // through `deps`
  }, [target, ...deps]);
};
