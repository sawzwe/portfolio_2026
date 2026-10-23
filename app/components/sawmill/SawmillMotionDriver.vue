<!-- components/sawmill/SawmillMotionDriver.vue -->
<!--
  Renderless. Runs first in the frame loop:
  - moves the shown progress towards the scroll target with maath's damp, so
    motion eases instead of jumping with the scroll wheel (with reduced
    motion, progress is pinned to the end: everything already stacked), and
    tracks which entry is being cut (ui.current) for the caption;
  - flags the first rendered frame (ui.ready) so the fallback image can hand
    over to the canvas;
  - pauses the render loop while the hero is off screen (ui.visible).
-->
<template><TresGroup /></template>

<script setup lang="ts">
import { easing } from "maath";
import { MOTION, STEP_COUNT } from "~/sawmill/scene-config";
import { MOTION_STATE, SAWMILL_UI } from "~/sawmill/motion";

const state = inject(MOTION_STATE)!;
const ui = inject(SAWMILL_UI)!;
const { onBeforeRender, onRender, start, stop } = useLoop();

onBeforeRender(({ delta }) => {
  if (state.reduced) state.progress = STEP_COUNT;
  else easing.damp(state, "progress", state.target, MOTION.scrollSmoothTime, delta);
  // Caption follows the step being cut; written only when it changes so the
  // reactive UI is not touched every frame.
  const current = Math.min(Math.floor(state.progress + 1e-3), STEP_COUNT);
  if (current !== ui.current) ui.current = current;
});

const { off } = onRender(() => {
  ui.ready = true;
  off();
});

watch(
  () => ui.visible,
  (visible) => (visible ? start() : stop()),
);

// Dev only: expose state and renderer stats for debugging and perf checks.
if (import.meta.dev) {
  const { renderer } = useTres();
  (window as unknown as Record<string, unknown>).__sawmill = { state, ui, renderer };
}
</script>
