<!-- components/sawmill/Workers.vue -->
<!--
  The workers placed as in master-ai.png (WORKERS in scene-config): four
  floating AI robots doing the work and the human (you) at the desk. The
  carrier holds CARRY.planks blank planks across its body.

  Motion, per frame: every head turns towards the cursor (clamped to
  MOTION.heads.maxYaw) or glances around when there is none, the pusher leans
  into each cut, and everyone has a little idle life (MOTION.idle): robots
  bob as they hover (ROBOT.bob), the human breathes, the panel robot taps
  buttons, the desk worker types.
-->
<template>
  <template v-for="(w, i) in WORKERS" :key="w.id">
    <Robot
      v-if="w.kind === 'robot'"
      :ref="(el: any) => (workers[i] = el)"
      :accent="w.accent!"
      :badge="w.badge"
      :pose="w.pose"
      :position="w.position"
      :rotation="w.rotationY"
    >
      <CarriedPlanks v-if="w.pose === 'carrying'" />
    </Robot>
    <Worker
      v-else
      :ref="(el: any) => (workers[i] = el)"
      :color="w.outfit ?? 'cream'"
      :pose="w.pose"
      :position="w.position"
      :rotation="w.rotationY"
    >
      <CarriedPlanks v-if="w.pose === 'carrying'" />
    </Worker>
  </template>
</template>

<script setup lang="ts">
import { Plane, Raycaster, Vector2, Vector3, type Object3D } from "three";
import { easing } from "maath";
import Worker from "./Worker.vue";
import Robot from "./Robot.vue";
import CarriedPlanks from "./CarriedPlanks.vue";
import { MOTION, POSES, ROBOT, WORKERS } from "~/sawmill/scene-config";
import { MOTION_STATE, bladeDrop } from "~/sawmill/motion";

type WorkerHandle = {
  head?: Object3D;
  torso?: Object3D;
  body?: Object3D; // robots only: the hovering group
  arms?: (Object3D | null)[];
} | null;

const state = inject(MOTION_STATE)!;
const { camera } = useTres();
const workers: WorkerHandle[] = [];

// Preallocated for the per-frame cursor ray.
const raycaster = new Raycaster();
const ndc = new Vector2();
const headPlane = new Plane(new Vector3(0, 1, 0), -MOTION.heads.planeY);
const hit = new Vector3();
const yaw = WORKERS.map(() => ({ y: 0 }));
const pusherIndex = WORKERS.findIndex((w) => w.pose === "pushing");

function wrapAngle(a: number) {
  return Math.atan2(Math.sin(a), Math.cos(a));
}

const I = MOTION.idle;
let clock = 0;

/** Idle motion for worker i at time t (seconds); phase-shifted per worker. */
function idle(i: number, w: (typeof WORKERS)[number], t: number) {
  const handle = workers[i];
  const torso = handle?.torso;
  const phase = i * 1.7;
  if (handle?.body) {
    handle.body.position.y = ROBOT.hover + Math.sin(t * ROBOT.bob.speed + phase) * ROBOT.bob.amplitude;
  } else if (torso) {
    torso.position.y = Math.sin(t * I.breathe.speed + phase) * I.breathe.amplitude;
    if (w.pose === "standing") torso.rotation.z = Math.sin(t * I.sway.speed + phase) * I.sway.amplitude;
  }
  const [left, right] = handle?.arms ?? [];
  if (!left || !right) return;
  const pose = POSES[w.pose];
  if (w.pose === "controlPanel") {
    // Alternate hands pressing down on the panel.
    left.rotation.x = -(pose.shoulderL + Math.max(0, Math.sin(t * I.tap.speed)) * I.tap.amplitude);
    right.rotation.x = -(pose.shoulderR + Math.max(0, Math.sin(t * I.tap.speed + Math.PI)) * I.tap.amplitude);
  } else if (w.pose === "switch") {
    // Slow pull on the lever now and then.
    right.rotation.x = -(pose.shoulderR + Math.max(0, Math.sin(t * I.tap.speed * 0.35 + phase)) ** 3 * I.tap.amplitude * 1.6);
  } else if (w.pose === "seated") {
    left.rotation.x = -(pose.shoulderL + Math.sin(t * I.typing.speed) * I.typing.amplitude);
    right.rotation.x = -(pose.shoulderR + Math.sin(t * I.typing.speed + 2) * I.typing.amplitude);
  }
}

useLoop().onBeforeRender(({ delta }) => {
  clock += delta;
  const cam = camera.value;
  let haveHit = false;
  if (cam && state.pointer.active && !state.reduced) {
    ndc.set(state.pointer.x, state.pointer.y);
    raycaster.setFromCamera(ndc, cam);
    haveHit = raycaster.ray.intersectPlane(headPlane, hit) !== null;
  }

  for (let i = 0; i < WORKERS.length; i++) {
    const head = workers[i]?.head;
    if (!head) continue;
    const w = WORKERS[i]!;
    // No cursor: a slow look around, different for each worker.
    let target = state.reduced
      ? 0
      : Math.sin(clock * I.glance.speed + i * 2.1) * I.glance.amplitude * 0.7 +
        Math.sin(clock * I.glance.speed * 0.43 + i) * I.glance.amplitude * 0.3;
    if (haveHit) {
      // Direction to the cursor in world space, then relative to where the
      // worker faces (rotationY 0 faces +Z).
      const worldYaw = Math.atan2(hit.x - w.position[0], hit.z - w.position[2]);
      const local = wrapAngle(worldYaw - w.rotationY);
      target = Math.max(-MOTION.heads.maxYaw, Math.min(MOTION.heads.maxYaw, local));
    }
    easing.damp(yaw[i]!, "y", target, MOTION.heads.smoothTime, delta);
    head.rotation.y = yaw[i]!.y;
    if (!state.reduced) idle(i, w, clock);
  }

  const torso = workers[pusherIndex]?.torso;
  if (torso) {
    const lean = state.reduced ? 0 : MOTION.pusher.cutLean * bladeDrop(state.progress, state.steps);
    torso.rotation.x = POSES.pushing.torsoLean + lean;
  }
});
</script>
