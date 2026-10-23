<!-- components/sawmill/Worker.vue -->
<!--
  Blocky worker (worker-turnaround.png). Every size comes from WORKER in
  scene-config; no facial features.

  Each limb hangs from a pivot group placed at its joint (hip, knee,
  shoulder), so a pose is just a set of pivot rotations (POSES). The upper
  body leans from the waist and the head turns from the neck.

  Local frame: the worker faces +Z, its left side is +X, feet on Y 0.
  The default slot renders in the waist frame, leaning with the torso (used
  for the carried plank). The head and torso pivots are exposed for motion.
-->
<template>
  <TresGroup :position="position" :rotation="[0, rotation, 0]">
    <!-- Pelvis: origin at hip height. -->
    <TresGroup :position="[0, pelvisY, 0]">
      <TresGroup
        v-for="leg in legs"
        :key="leg.side"
        :position="[leg.x, 0, 0]"
        :rotation="[-leg.hip, 0, 0]"
      >
        <template v-if="leg.knee === 0">
          <RBox :size="W.leg.size" :radius="W.radius" :color="cloth" :position="[0, -legLength / 2, 0]" />
        </template>
        <template v-else>
          <RBox :size="[legWidth, thigh, legDepth]" :radius="W.radius" :color="cloth" :position="[0, -thigh / 2, 0]" />
        </template>
        <!-- Knee pivot: the shin and shoe hang from here. -->
        <TresGroup :position="[0, -thigh, 0]" :rotation="[-leg.knee, 0, 0]">
          <RBox
            v-if="leg.knee !== 0"
            :size="[legWidth, shin, legDepth]"
            :radius="W.radius"
            :color="cloth"
            :position="[0, -shin / 2, 0]"
          />
          <RBox
            :size="W.shoe.size"
            :radius="2"
            color="shoe"
            :position="[0, -shin - W.shoe.size[1] / 2, W.shoe.forward]"
          />
        </TresGroup>
      </TresGroup>

      <!-- Upper body leans forward from the waist. -->
      <TresGroup ref="torso" :rotation="[p.torsoLean, 0, 0]">
        <RBox :size="W.torso.size" :radius="W.torso.radius" :color="cloth" :position="[0, torsoH / 2, 0]" />
        <RBox :size="W.neck.size" :radius="1" color="skin" :position="[0, torsoH + W.neck.size[1] / 2, 0]" />

        <!-- Head pivot at the top of the neck. -->
        <TresGroup ref="head" :position="[0, torsoH + W.neck.size[1], 0]">
          <RBox :size="W.head.size" :radius="W.radius" color="skin" :position="[0, headH / 2, 0]" />
          <RBox :size="H.cap" :radius="W.radius" color="hair" :position="[0, capY, 0]" />
          <RBox :size="H.back" :radius="W.radius" color="hair" :position="[0, backY, backZ]" />
          <!-- Fringe notch: a sliver of skin set into the cap's front face. -->
          <RBox
            :size="[H.notch.width, H.notch.height, 2]"
            :radius="0.5"
            color="skin"
            :position="[H.notch.offsetX, capBottom + H.notch.height / 2 - 0.5, H.cap[2] / 2 - 0.6]"
            :cast-shadow="false"
          />
        </TresGroup>

        <!-- Shoulder pivots: spread first (Z), then swing forward (X). -->
        <TresGroup
          v-for="(arm, i) in arms"
          :key="arm.side"
          :ref="(el: any) => (armPivots[i] = el)"
          :position="[arm.x, shoulderY, 0]"
          :rotation="[-arm.swing, 0, arm.spread]"
        >
          <RBox :size="W.arm.sleeve" :radius="W.radius" :color="cloth" :position="[0, -sleeveH / 2, 0]" />
          <RBox :size="W.arm.hand" :radius="3" color="skin" :position="[0, -sleeveH - W.arm.hand[1] / 2 + 1, 0]" />
        </TresGroup>

        <slot />
      </TresGroup>
    </TresGroup>
  </TresGroup>
</template>

<script setup lang="ts">
import type { Object3D } from "three";
import RBox from "./RBox.vue";
import {
  OUTFIT_COLOR,
  POSES,
  WORKER as W,
  type Outfit,
  type Pose,
  type PoseName,
} from "~/sawmill/scene-config";

const props = withDefaults(
  defineProps<{
    color: Outfit;
    pose: PoseName | Pose;
    position?: readonly [number, number, number];
    /** Rotation about Y, radians. 0 faces +Z. */
    rotation?: number;
  }>(),
  { position: () => [0, 0, 0], rotation: 0 },
);

// The head pivot (turn with rotation.y), the upper-body pivot (lean with
// rotation.x) and the shoulder pivots are exposed so motion code can animate
// them directly each frame, without re-rendering the component.
const head = shallowRef<Object3D>();
const torso = shallowRef<Object3D>();
// Shoulder pivots, left then right (swing forward with -rotation.x).
const armPivots: (Object3D | null)[] = [];
defineExpose({ head, torso, arms: armPivots });

const H = W.hair;
const cloth = computed(() => OUTFIT_COLOR[props.color]);
const p = computed<Pose>(() => (typeof props.pose === "string" ? POSES[props.pose] : props.pose));

const [legWidth, legLength, legDepth] = W.leg.size;
const thigh = legLength * W.leg.kneeRatio;
const shin = legLength - thigh;
const torsoH = W.torso.size[1];
const headH = W.head.size[1];
const sleeveH = W.arm.sleeve[1];

const hipY = W.shoe.size[1] + legLength;
const pelvisY = computed(() => hipY - p.value.pelvisDrop);

// Shoulder joint: at the top outer edge of the torso, centred in the sleeve.
const shoulderX = W.torso.size[0] / 2 + W.arm.sleeve[0] / 2 - W.arm.shoulderInset;
const shoulderY = torsoH - W.arm.sleeve[0] / 2;

const legs = computed(() => [
  { side: "L", x: legWidth / 2 + W.leg.gap / 2, hip: p.value.hipL, knee: p.value.kneeL },
  { side: "R", x: -(legWidth / 2 + W.leg.gap / 2), hip: p.value.hipR, knee: p.value.kneeR },
]);

const arms = computed(() => [
  { side: "L", x: shoulderX, swing: p.value.shoulderL, spread: p.value.armSpread },
  { side: "R", x: -shoulderX, swing: p.value.shoulderR, spread: -p.value.armSpread },
]);

// Hair, in the head pivot's frame (head bottom at Y 0).
const capTop = headH - H.overlap + H.cap[1];
const capBottom = headH - H.overlap;
const capY = capBottom + H.cap[1] / 2;
// Back block hangs from the cap top, over the back of the head.
const backY = capTop - H.back[1] / 2;
const backZ = -H.cap[2] / 2 + H.back[2] / 2;
</script>
