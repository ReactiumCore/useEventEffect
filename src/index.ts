export { useEventEffect } from './useEventEffect';
export type { EventHandlers, EventTargetLike } from './useEventEffect';

// Re-exported so one import covers both creating targets and subscribing
export { Event, EventTarget } from '@atomic-reactor/event-handle';
export type { AppEvent, Listener } from '@atomic-reactor/event-handle';
