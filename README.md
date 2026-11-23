# @atomic-reactor/use-event-effect

A tiny React hook that subscribes a component to an
[`@atomic-reactor/event-handle`](https://github.com/ReactiumCore/EventHandle)
target, or to any DOM `EventTarget`, and unsubscribes on unmount. Works in
React DOM and React Native, and ships ESM, CommonJS and TypeScript types.

## Install

```sh
npm install --save @atomic-reactor/use-event-effect
```

`react` (16.8+) is a peer dependency. `@atomic-reactor/event-handle` is
installed with this package, and its `Event` and `EventTarget` are re-exported,
so one import covers both.

## Usage

```tsx
import { useState } from 'react';
import {
  Event,
  EventTarget,
  useEventEffect,
} from '@atomic-reactor/use-event-effect';

class DatePicker extends EventTarget {
  setDate(value: Date) {
    this.dispatchEvent(new Event('date-changed', { value }));
  }
}

export const picker = new DatePicker();

export function SelectedDate() {
  const [date, setDate] = useState<Date>();

  useEventEffect(picker, {
    'date-changed': (event) => setDate(event.value),
  });

  return <span>{date?.toDateString()}</span>;
}
```

### `useEventEffect(target, handlers, deps?)`

| Argument   | Description                                                                                               |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| `target`   | Anything with `addEventListener`/`removeEventListener`. When `null` or `undefined`, nothing is added      |
| `handlers` | `{ [type]: listener }`. Entries that aren't functions are skipped, e.g. `{ change: enabled && onChange }` |
| `deps`     | Re-adds the handlers when these change. Defaults to `[]`                                                  |

The handlers are added when the component mounts and removed when it
unmounts. They're also moved when `target` changes, and replaced when `deps`
change.

### Stale closures

With no `deps`, the handlers from the first render are the ones that stay
subscribed. A handler that reads props or state should either list them in
`deps`, or read current values from a ref or a SyncState:

```tsx
useEventEffect(picker, { 'date-changed': onDateChanged }, [onDateChanged]);
```

### DOM targets

Any DOM `EventTarget` works too, such as `window` or an element:

```tsx
useEventEffect(window, { resize: onResize });
```

## Compatibility

The hook uses only React and ES2019 built-ins and is compiled to ES2019, so
it needs no polyfills in any current browser, React Native 0.60+ or Node 12+.

## License

MIT
