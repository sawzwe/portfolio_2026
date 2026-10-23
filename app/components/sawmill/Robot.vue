<!-- components/sawmill/Robot.vue -->
<!--
  Floating AI robot worker (references/ai/robot-*.png). Every size comes from
  ROBOT in scene-config. No legs: the torso hovers ROBOT.hover above the floor
  over a thruster plate and a soft light pool.

  Head: rounded cube with a dark visor, a small badge above it and a module on
  each side. Torso: accent colour with grey side plates and a round chest
  badge. Badges show the model's logo when ROBOT badge.logo is set, else blank.

  Same pivot layout and exposed handles as Worker.vue (head, torso, arms), plus
  `body` (the hovering group) for the idle bob, so Workers.vue animates both
  kinds the same way. Poses use the arm and lean parts of POSES.

  Local frame: faces +Z, its left side is +X, floor at Y 0. The default slot
  renders at the bottom of the torso, leaning with it (the carried plank).
-->
<template>
  <TresGroup :position="position" :rotation="[0, rotation, 0]">
    <!-- Light pool on the floor (does not bob). -->
    <TresMesh
      :geometry="floorGlow"
      :material="glow.floor"
      :rotation="[-Math.PI / 2, 0, 0]"
      :position="[0, 0.6, 0]"
      :render-order="1"
    />

    <TresGroup ref="body" :position="[0, R.hover, 0]">
      <!-- Thruster plate under the torso. -->
      <TresMesh :geometry="plate" :material="glow.plate" :position="[0, -1, 0]" />

      <!-- Upper body leans from the bottom of the torso. -->
      <TresGroup ref="torso" :rotation="[p.torsoLean, 0, 0]">
        <RBox :size="[tw, th, td]" :radius="R.torso.radius" :color="accent" :position="[0, th / 2, 0]" />
        <RBox
          v-for="sx in [-1, 1]"
          :key="`trim-${sx}`"
          :size="[R.torso.trim.width, th - 14, R.torso.trim.depth]"
          :radius="1"
          color="robotBody"
          :position="[sx * (tw / 2 + R.torso.trim.width / 2 - 1), th / 2, 0]"
          :cast-shadow="false"
        />
        <!-- Chest badge: a disc facing +Z, with the logo on top when set. -->
        <TresMesh
          :geometry="chestBadge"
          :material="material('robotBadge')"
          :position="[0, th * R.chestBadge.y, td / 2 + R.chestBadge.depth / 2 - 0.5]"
          :rotation="[Math.PI / 2, 0, 0]"
          cast-shadow
        />
        <TresMesh
          v-if="logo"
          :geometry="chestLogo"
          :material="logo"
          :position="[0, th * R.chestBadge.y, td / 2 + R.chestBadge.depth + 0.2]"
        />

        <RBox :size="R.neck.size" :radius="2" color="robotJoint" :position="[0, th + R.neck.size[1] / 2, 0]" />

        <!-- Head pivot at the top of the neck. -->
        <TresGroup ref="head" :position="[0, th + R.neck.size[1], 0]">
          <RBox :size="R.head.size" :radius="R.head.radius" color="robotBody" :position="[0, hh / 2, 0]" />
          <RBox
            :size="R.visor.size"
            :radius="2"
            color="robotVisor"
            :position="[0, hh * R.visor.y, hd / 2 + R.visor.size[2] / 2 - 1]"
            :cast-shadow="false"
          />
          <RBox
            :size="R.headBadge.size"
            :radius="1.5"
            color="robotBadge"
            :position="[0, hh * R.headBadge.y, hd / 2 + R.headBadge.size[2] / 2 - 1]"
            :cast-shadow="false"
          />
          <TresMesh
            v-if="logo"
            :geometry="headLogo"
            :material="logo"
            :position="[0, hh * R.headBadge.y, hd / 2 + R.headBadge.size[2] + 0.1]"
          />
          <RBox
            v-for="sx in [-1, 1]"
            :key="`ear-${sx}`"
            :size="R.earModule.size"
            :radius="1.5"
            color="robotBody"
            :position="[sx * (hw / 2 + R.earModule.size[0] / 2 - 1), hh * R.earModule.y, 0]"
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
          <RBox :size="R.arm.sleeve" :radius="R.radius" color="robotBody" :position="[0, -sleeveH / 2, 0]" />
          <RBox :size="R.arm.hand" :radius="3" color="robotBody" :position="[0, -sleeveH - R.arm.hand[1] / 2 + 1, 0]" />
        </TresGroup>

        <slot />
      </TresGroup>
    </TresGroup>
  </TresGroup>
</template>

<script setup lang="ts">
import { CircleGeometry, PlaneGeometry, type Object3D } from "three";
import RBox from "./RBox.vue";
import { cylinder } from "~/sawmill/geometries";
import { glowMaterials, logoMaterial, material } from "~/sawmill/materials";
import {
  POSES,
  ROBOT as R,
  type Pose,
  type PoseName,
  type RobotAccent,
  type RobotBadge,
} from "~/sawmill/scene-config";

const props = withDefaults(
  defineProps<{
    accent: RobotAccent;
    pose: PoseName | Pose;
    badge?: RobotBadge;
    position?: readonly [number, number, number];
    /** Rotation about Y, radians. 0 faces +Z. */
    rotation?: number;
  }>(),
  { position: () => [0, 0, 0], rotation: 0, badge: undefined },
);

// Exposed for per-frame motion (Workers.vue): head turn, torso lean, arm
// swing, and the hovering body for the idle bob.
const head = shallowRef<Object3D>();
const torso = shallowRef<Object3D>();
const body = shallowRef<Object3D>();
const armPivots: (Object3D | null)[] = [];
defineExpose({ head, torso, body, arms: armPivots });

const p = computed<Pose>(() => (typeof props.pose === "string" ? POSES[props.pose] : props.pose));
const logo = computed(() => (props.badge?.logo ? logoMaterial(props.badge.logo) : null));

const [tw, th, td] = R.torso.size;
const [hw, hh, hd] = R.head.size;
const sleeveH = R.arm.sleeve[1];
const shoulderX = tw / 2 + R.arm.sleeve[0] / 2 - R.arm.shoulderInset;
const shoulderY = th - R.arm.sleeve[0] / 2;

const arms = computed(() => [
  { side: "L", x: shoulderX, swing: p.value.shoulderL, spread: p.value.armSpread },
  { side: "R", x: -shoulderX, swing: p.value.shoulderR, spread: -p.value.armSpread },
]);

// Shared geometry (one per robot is fine: four robots, a handful of meshes).
const glow = glowMaterials();
const floorGlow = new CircleGeometry(R.glow.floorRadius, 32);
const plate = cylinder(R.glow.plateRadius, 2, 24);
const chestBadge = cylinder(R.chestBadge.radius, R.chestBadge.depth, 32);
const chestLogo = new CircleGeometry(R.chestBadge.radius * 0.78, 32);
const headLogo = new PlaneGeometry(R.headBadge.size[0] * 0.8, R.headBadge.size[1] * 0.8);
onBeforeUnmount(() => {
  floorGlow.dispose();
  chestLogo.dispose();
  headLogo.dispose();
});
</script>
