<!-- components/sawmill/SawmillCamera.vue -->
<!--
  Locked orthographic camera at master.png's angle (CAMERA.azimuth/elevation
  by default).

  TresJS v5 only updates the aspect ratio of perspective cameras on resize, and
  cientos has no OrthographicCamera helper, so we set the frustum ourselves:
  left/right/top/bottom are ± half the canvas size in pixels, and zoom (pixels
  per world unit) is computed so CAMERA_FIT_POINTS fill the canvas minus
  CAMERA.fitMargin, centred. No controls: the view never moves.

  Must be a child of <TresCanvas> (useTres needs the canvas context).
-->
<template>
  <TresOrthographicCamera
    :position="view.position"
    :zoom="view.zoom"
    :left="-halfWidth"
    :right="halfWidth"
    :top="halfHeight"
    :bottom="-halfHeight"
    :near="CAMERA.near"
    :far="CAMERA.far"
    :look-at="view.lookAt"
  />
</template>

<script setup lang="ts">
import { Vector3 } from "three";
import { CAMERA, CAMERA_FIT_POINTS } from "~/sawmill/scene-config";

type Margin = { top: number; bottom: number; left: number; right: number };

// Defaults frame the whole scene like master.png; the dev worker lab passes
// its own angle and bounds.
const props = withDefaults(
  defineProps<{
    azimuth?: number;
    elevation?: number;
    fitPoints?: readonly (readonly [number, number, number])[];
    fitMargin?: Margin;
    /** Shrinks (<1) or grows the fitted scene around the same centre. */
    scale?: number;
  }>(),
  {
    azimuth: CAMERA.azimuth,
    elevation: CAMERA.elevation,
    fitPoints: () => CAMERA_FIT_POINTS,
    fitMargin: () => CAMERA.fitMargin,
    scale: CAMERA.sceneScale,
  },
);

const { sizes } = useTres();

// Fall back to 1 so the frustum is never degenerate before the first measure.
const width = computed(() => sizes.width.value || 1);
const height = computed(() => sizes.height.value || 1);
const halfWidth = computed(() => width.value / 2);
const halfHeight = computed(() => height.value / 2);

// View basis from azimuth/elevation (`back` points from the scene to the
// camera), and the fit points projected onto the screen plane: their extent
// and its centre, in world units.
const frame = computed(() => {
  const back = new Vector3(
    Math.cos(props.elevation) * Math.sin(props.azimuth),
    Math.sin(props.elevation),
    Math.cos(props.elevation) * Math.cos(props.azimuth),
  );
  const right = new Vector3(0, 1, 0).cross(back).normalize();
  const up = back.clone().cross(right).normalize();
  let minR = Infinity, maxR = -Infinity, minU = Infinity, maxU = -Infinity;
  const p = new Vector3();
  for (const point of props.fitPoints) {
    p.set(...point);
    const r = p.dot(right);
    const u = p.dot(up);
    minR = Math.min(minR, r); maxR = Math.max(maxR, r);
    minU = Math.min(minU, u); maxU = Math.max(maxU, u);
  }
  const center = new Vector3()
    .addScaledVector(right, (minR + maxR) / 2)
    .addScaledVector(up, (minU + maxU) / 2);
  return { back, right, up, center, boxWidth: maxR - minR, boxHeight: maxU - minU };
});

const view = computed(() => {
  const { back, right, up, center, boxWidth, boxHeight } = frame.value;
  const m = props.fitMargin;
  const usableW = width.value * (1 - m.left - m.right);
  const usableH = height.value * (1 - m.top - m.bottom);
  const zoom = Math.min(usableW / boxWidth, usableH / boxHeight) * props.scale;
  // Shift the view so the fitted box sits in the usable area, not the canvas
  // centre: convert the margin imbalance from pixels to world units.
  const shiftR = ((m.right - m.left) * width.value) / 2 / zoom;
  const shiftU = ((m.top - m.bottom) * height.value) / 2 / zoom;
  const look = center.clone().addScaledVector(right, shiftR).addScaledVector(up, shiftU);
  return {
    zoom,
    position: look.clone().addScaledVector(back, CAMERA.distance).toArray(),
    lookAt: look.toArray(),
  };
});
</script>
