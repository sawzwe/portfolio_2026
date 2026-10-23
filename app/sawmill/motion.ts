// sawmill/motion.ts
// Shared motion state for the sawmill scene, and the pure maths that turns
// scroll progress into where each segment and plank is.
//
// The state object is plain (not reactive): it is written by input handlers
// and the frame loop and read in frame callbacks, so nothing here triggers a
// Vue re-render. Frame callbacks mutate three.js objects directly and reuse
// preallocated vectors, so the render loop allocates nothing.

import type { ComputedRef, InjectionKey } from "vue";
import type { TimelineEntry } from "~/types/site";
import { MOTION } from "./scene-config";

export interface MotionState {
  /** Scroll steps: one per timeline entry (set from the CMS data). */
  steps: number;
  /** Scroll target, 0..steps, set from the page's scroll position. */
  target: number;
  /** Smoothed progress actually shown, damped towards `target`. */
  progress: number;
  /** prefers-reduced-motion: no scroll animation, no spin, everything stacked. */
  reduced: boolean;
  /** Cursor in canvas NDC (-1..1); `active` false when it is off the canvas. */
  pointer: { x: number; y: number; active: boolean };
}

export function createMotionState(): MotionState {
  return {
    steps: 0,
    target: 0,
    progress: 0,
    reduced: false,
    pointer: { x: 0, y: 0, active: false },
  };
}

export const MOTION_STATE: InjectionKey<MotionState> = Symbol("sawmill-motion");

/**
 * The timeline as the sawmill uses it: CMS entries newest first, so index 0
 * is the slice under the saw at the top of the page.
 */
export const SAWMILL_ENTRIES: InjectionKey<ComputedRef<readonly TimelineEntry[]>> = Symbol("sawmill-entries");

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** 0..1 position of `t` inside the window [a, b]. */
export function windowed(t: number, [a, b]: readonly [number, number]) {
  return clamp01((t - a) / (b - a));
}

export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
export const easeIn = (t: number) => t * t;
export const easeOut = (t: number) => 1 - (1 - t) * (1 - t);

// These run every frame, so they return numbers or reuse one output object
// instead of allocating.

/** Current step index at progress P (0..steps-1). */
function stepIndex(progress: number, steps: number) {
  const p = Math.min(Math.max(progress, 0), steps);
  return Math.min(Math.floor(p), steps - 1);
}

/**
 * How many segments the log has advanced at progress P: one per completed
 * step, eased in during each step's advance window. At P = steps the
 * blank "next" segment sits under the blade.
 */
export function logOffset(progress: number, steps: number) {
  if (steps <= 0) return 0;
  const step = stepIndex(progress, steps);
  const t = Math.min(Math.max(progress, 0), steps) - step;
  return step + easeInOut(windowed(t, MOTION.phases.advance));
}

const headOut = { lower: 0, slide: 0 };

/**
 * Saw head at progress P. `lower` is 0 raised .. 1 down at cutting height;
 * `slide` is 0 at the start side of the log .. 1 at the far side. During each
 * cut the head lowers, slides across the log, and rises; it then slides back
 * raised. Returns a shared object: read it before the next call.
 */
export function sawHead(progress: number, steps: number): Readonly<typeof headOut> {
  headOut.lower = 0;
  headOut.slide = 0;
  if (progress >= steps || progress <= 0) return headOut;
  const t = progress - stepIndex(progress, steps);
  const { lowerEnd, slideEnd } = MOTION.blade;
  const c = windowed(t, MOTION.phases.cut);
  if (t <= MOTION.phases.cut[1]) {
    if (c < lowerEnd) {
      headOut.lower = easeInOut(c / lowerEnd);
    } else if (c < slideEnd) {
      headOut.lower = 1;
      headOut.slide = easeInOut((c - lowerEnd) / (slideEnd - lowerEnd));
    } else {
      headOut.lower = easeInOut((1 - c) / (1 - slideEnd));
      headOut.slide = 1;
    }
  } else {
    headOut.slide = 1 - easeInOut(windowed(t, MOTION.phases.headReturn));
  }
  return headOut;
}

/** How far down the blade is at progress P (0 raised, 1 cutting). */
export function bladeDrop(progress: number, steps: number) {
  return sawHead(progress, steps).lower;
}

export type PlankPhase = "inLog" | "lift" | "travel" | "land" | "stacked";

const phaseOut: { phase: PlankPhase; u: number } = { phase: "inLog", u: 0 };

/**
 * Where plank `index` is in its life at progress P, with the phase-local
 * 0..1 position `u`. Before its step it is still a log segment; after it, it
 * is on the stack. Returns a shared object: read it before the next call.
 */
export function plankPhase(progress: number, index: number): Readonly<typeof phaseOut> {
  const t = progress - index;
  const { cut, lift, travel, land } = MOTION.phases;
  if (t <= cut[1]) set("inLog", 0);
  else if (t >= 1) set("stacked", 1);
  else if (t < lift[1]) set("lift", windowed(t, lift));
  else if (t < travel[1]) set("travel", windowed(t, travel));
  else if (t < land[1]) set("land", windowed(t, land));
  else set("stacked", 1);
  return phaseOut;
}

function set(phase: PlankPhase, u: number) {
  phaseOut.phase = phase;
  phaseOut.u = u;
}

/**
 * UI state shared between the canvas and the DOM around it. Reactive (it
 * drives the HTML card, the fade-in and the loop pause), but it only changes
 * on events, never per frame.
 */
export interface SawmillUi {
  /** Plank (timeline index) under the pointer, and the one tapped/clicked. */
  hovered: number | null;
  selected: number | null;
  /** performance.now() of the last plank click, so the canvas-level click
   *  handler can tell a plank tap from a tap on empty space. */
  lastHitAt: number;
  /** The hero is on screen; the render loop is paused while it is not. */
  visible: boolean;
  /** The first frame has rendered (until then the fallback image shows). */
  ready: boolean;
  /** Entry whose slice is being cut at the current scroll step (0..n-1), or
   *  n once everything is stacked. Updated only when it changes. */
  current: number;
}

export const SAWMILL_UI: InjectionKey<SawmillUi> = Symbol("sawmill-ui");

/**
 * The floating caption's DOM anchor, filled in by SawmillCanvas. CutTimeline
 * moves it each frame to sit above the plank the caption describes; the
 * card's measured size is cached here so the frame loop never reads layout.
 */
export interface CaptionAnchor {
  el: HTMLElement | null;
  width: number;
  height: number;
}

export const CAPTION_ANCHOR: InjectionKey<CaptionAnchor> = Symbol("sawmill-caption-anchor");
