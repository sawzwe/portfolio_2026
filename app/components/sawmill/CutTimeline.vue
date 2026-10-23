<!-- components/sawmill/CutTimeline.vue -->
<!--
  The scroll-driven part of the scene (storyboard-1..4.png): the main log,
  made of one plank-shaped slice per timeline entry plus the blank "next"
  slice. Each frame it places them from the smoothed scroll progress
  (sawmill/motion.ts): slices ride the log towards the blade; the slice the
  saw cuts off is the plank itself, so it tips over flat, lifts, arcs to its
  stack slot and lands with a small settle. Fully reversible: everything is a
  function of progress.

  Planks are interactive: hover (desktop) or tap (touch) lifts the plank and
  shows its caption. The caption (rendered by SawmillCanvas) floats above the
  plank it describes; this component moves it there every frame.
-->
<template>
  <TresGroup>
    <TresGroup
      v-for="(entry, i) in slices"
      :key="entry ? entryKey(entry, i) : 'next'"
      :ref="(el: any) => (plankObjects[i] = el)"
      @pointerenter="entry && (ui.hovered = i)"
      @pointerleave="ui.hovered === i && (ui.hovered = null)"
      @click="entry && select(i)"
    >
      <!-- The visible plank lifts on hover; the invisible hit box stays put
           and covers both positions, so the pointer never "leaves" just
           because the plank moved up from under it. -->
      <TresGroup :ref="(el: any) => (visualObjects[i] = el)">
        <Plank :entry="entry" />
      </TresGroup>
      <TresMesh
        :geometry="hitGeometry"
        :material="hitProxyMaterial()"
        :position="[0, MOTION.plank.hoverLift / 2, 0]"
      />
    </TresGroup>
  </TresGroup>
</template>

<script setup lang="ts">
import { Matrix4, Quaternion, Vector3, type Object3D } from "three";
import type { TimelineEntry } from "~/types/site";
import { easing } from "maath";
import Plank from "./Plank.vue";
import { roundedBox } from "~/sawmill/geometries";
import { hitProxyMaterial } from "~/sawmill/materials";
import {
  BLADE_Z,
  CONVEYOR,
  CONVEYORS,
  LOG_HEIGHT,
  LOG_PITCH,
  MOTION,
  PLANK,
  STACK,
} from "~/sawmill/scene-config";
import {
  CAPTION_ANCHOR,
  MOTION_STATE,
  SAWMILL_ENTRIES,
  SAWMILL_UI,
  easeIn,
  easeInOut,
  easeOut,
  logOffset,
  plankPhase,
} from "~/sawmill/motion";

const state = inject(MOTION_STATE)!;
const ui = inject(SAWMILL_UI)!;
const caption = inject(CAPTION_ANCHOR)!;
// Timeline entries from the CMS, newest first (provided by SawmillCanvas).
const entries = inject(SAWMILL_ENTRIES)!;
const { camera, sizes } = useTres();

// One plank per entry, then the blank "next" slice that never leaves the log.
const slices = computed<(TimelineEntry | null)[]>(() => [...entries.value, null]);
const entryKey = (e: TimelineEntry, i: number) => e.id ?? `${i}-${e.year}-${e.title}`;
const plankObjects: (Object3D | null)[] = [];
const visualObjects: (Object3D | null)[] = [];
const hitGeometry = roundedBox([PLANK.width, PLANK.thickness + MOTION.plank.hoverLift, PLANK.length], 0.5, 1);

function select(i: number) {
  ui.selected = ui.selected === i ? null : i;
  ui.lastHitAt = performance.now();
}

// Fixed geometry of the motion, computed once.
const logX = CONVEYORS.main.position[0];
const logY = CONVEYOR.topY + LOG_HEIGHT / 2;
const liftedY = CONVEYOR.topY + LOG_HEIGHT + MOTION.plank.liftHeight;

// A plank is built lying flat along Z. In the log it stands on edge across
// the conveyor: its length along X, its width up, its thickness along Z.
const ON_EDGE = new Quaternion().setFromRotationMatrix(
  new Matrix4().makeBasis(new Vector3(0, 1, 0), new Vector3(0, 0, 1), new Vector3(1, 0, 0)),
);
const FLAT = new Quaternion();

// Stack slot i: column i % columns, layer floor(i / columns). Any number of
// entries fits: the stack just grows taller.
const slots = computed(() => entries.value.map((_, i) => {
  const column = i % STACK.columns;
  const layer = Math.floor(i / STACK.columns);
  return {
    x: STACK.position[0] + (column - (STACK.columns - 1) / 2) * (PLANK.width + STACK.gap),
    y: STACK.position[1] + PLANK.thickness / 2 + layer * PLANK.thickness,
    z: STACK.position[2],
  };
}));

// Per-plank hover lift, damped each frame (plain numbers, no allocation in
// the loop; the array is rebuilt only when the entries change).
const hoverLift = computed(() => slices.value.map(() => ({ y: 0 })));

// Caption placement: project the point above the caption's plank to canvas
// pixels and move the anchor there. Last written values avoid redundant DOM
// writes; the vector is reused.
const captionPoint = new Vector3();
// Infinity (not NaN, which compares false) so the first frame always writes.
let lastX = Infinity;
let lastY = Infinity;
let lastShift = Infinity;
let lastLine = Infinity;

function placeCaption() {
  const el = caption.el;
  const cam = camera.value;
  // Same rule as the card's content: tapped, hovered, else the step's plank.
  const index = ui.selected ?? ui.hovered ?? (state.reduced ? null : ui.current);
  const plank = index === null ? null : plankObjects[index];
  if (!el || !cam || !plank || index === null) return;

  // Pin point: the middle of the plank's top face (taller while it stands on
  // edge in the log), lifted with the plank when hovered.
  const onEdge = index >= entries.value.length || plankPhase(state.progress, index).phase === "inLog";
  captionPoint.copy(plank.position);
  captionPoint.y += (onEdge ? LOG_HEIGHT : PLANK.thickness) / 2 + (hoverLift.value[index]?.y ?? 0);
  captionPoint.project(cam);
  const width = sizes.width.value;
  const height = sizes.height.value;
  const x = ((captionPoint.x + 1) / 2) * width;
  const y = ((1 - captionPoint.y) / 2) * height;

  // The line shortens near the top so the card stays on screen; the card
  // slides sideways near the edges while the pin stays on the plank.
  const { lineLength, minLineLength, edgeMargin } = MOTION.caption;
  const line = Math.max(minLineLength, Math.min(lineLength, y - caption.height - edgeMargin));
  const half = caption.width / 2;
  const centre = Math.min(Math.max(x, half + edgeMargin), Math.max(half + edgeMargin, width - half - edgeMargin));
  const shift = centre - x;

  if (Math.abs(x - lastX) > 0.25 || Math.abs(y - lastY) > 0.25) {
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    lastX = x;
    lastY = y;
  }
  if (Math.abs(shift - lastShift) > 0.25) {
    el.style.setProperty("--card-shift", `${shift}px`);
    lastShift = shift;
  }
  if (Math.abs(line - lastLine) > 0.25) {
    el.style.setProperty("--pin-line", `${line}px`);
    lastLine = line;
  }
}

/** Centre of slice j on the log, which has advanced `offset` slices. The
 *  front slice's back face meets the blade's plane. */
function sliceZ(j: number, offset: number) {
  return BLADE_Z - LOG_PITCH / 2 + (j - offset) * LOG_PITCH;
}

useLoop().onBeforeRender(({ delta }) => {
  const P = state.progress;
  const offset = logOffset(P, state.steps);
  const count = entries.value.length;
  const slotList = slots.value;
  const lifts = hoverLift.value;

  // Every entry plus the blank last slice.
  for (let i = 0; i <= count; i++) {
    const plank = plankObjects[i];
    if (!plank) continue;

    // The blank last slice, and every slice before its cut, sits in the log.
    const life = i < count ? plankPhase(P, i) : null;
    const visual = visualObjects[i];
    if (!life || life.phase === "inLog") {
      if (visual) visual.position.y = 0;
      plank.quaternion.copy(ON_EDGE);
      plank.position.set(logX, logY, sliceZ(i, offset));
      continue;
    }
    const { phase, u } = life;

    const slot = slotList[i]!;
    const lift = lifts[i]!;
    const lifted = ui.hovered === i || ui.selected === i;
    easing.damp(lift, "y", lifted ? MOTION.plank.hoverLift : 0, MOTION.plank.hoverSmoothTime, delta);
    // Only the visible part lifts; the group (and its hit box) stays put.
    if (visual) visual.position.y = phase === "stacked" ? lift.y : 0;
    plank.rotation.set(0, 0, 0);

    if (phase === "lift") {
      // Tip over from on-edge to flat while rising off the conveyor.
      const e = easeOut(u);
      plank.quaternion.slerpQuaternions(ON_EDGE, FLAT, e);
      plank.position.set(logX, logY + (liftedY - logY) * e, sliceZ(i, i));
    } else if (phase === "travel") {
      const e = easeInOut(u);
      const arc = Math.sin(Math.PI * u);
      const startZ = sliceZ(i, i);
      plank.position.set(
        logX + (slot.x - logX) * e,
        liftedY + (slot.y + MOTION.plank.dropHeight - liftedY) * e + MOTION.plank.travelArc * arc,
        startZ + (slot.z - startZ) * e,
      );
      plank.rotation.z = MOTION.plank.travelTilt * arc;
    } else if (phase === "land") {
      // Drop for the first 70%, then a small hop to settle.
      const drop = easeIn(Math.min(u / 0.7, 1));
      const settle = u > 0.7 ? Math.sin(Math.PI * ((u - 0.7) / 0.3)) * MOTION.plank.settleBounce : 0;
      plank.position.set(slot.x, slot.y + MOTION.plank.dropHeight * (1 - drop) + settle, slot.z);
    } else {
      plank.position.set(slot.x, slot.y, slot.z);
    }
  }

  placeCaption();
});
</script>
