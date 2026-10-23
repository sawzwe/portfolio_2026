<!-- components/sawmill/Sawdust.vue -->
<!--
  Sawdust spraying from the cut while the blade is down (storyboard-2.png).
  One instanced mesh of tiny wood cubes. Each particle loops on its own clock
  with fixed random direction and speed; the burst's strength follows the
  blade drop, so there is no dust between cuts. Nothing is allocated per frame.
-->
<template>
  <TresInstancedMesh ref="mesh" :args="[geometry, material('wood'), D.count]" :frustum-culled="false" />
</template>

<script setup lang="ts">
import { Matrix4, Quaternion, Vector3, type InstancedMesh } from "three";
import { roundedBox } from "~/sawmill/geometries";
import { material } from "~/sawmill/materials";
import { BLADE, BLADE_Z, CONVEYOR, CONVEYORS, LOG_HEIGHT, MOTION } from "~/sawmill/scene-config";
import { MOTION_STATE, sawHead } from "~/sawmill/motion";

const D = MOTION.sawdust;
const state = inject(MOTION_STATE)!;
const mesh = shallowRef<InstancedMesh>();
const geometry = roundedBox([D.size, D.size, D.size], 0.5, 1);

// Emitter: where the blade meets the top of the log; it follows the head
// across the log (x is set each frame).
const origin = new Vector3(CONVEYORS.main.position[0], CONVEYOR.topY + LOG_HEIGHT, BLADE_Z);

// Fixed per-particle randomness (seeded, so every load looks the same).
let seed = 11;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const particles = Array.from({ length: D.count }, () => {
  const yaw = (rand() - 0.5) * 2 * D.spread;
  const pitch = 0.3 + rand() * 0.9;
  const speed = D.speed[0] + rand() * (D.speed[1] - D.speed[0]);
  return {
    // Mostly +Z (out of the cut towards the camera's left), fanned in X by
    // yaw, upwards by pitch.
    vx: Math.sin(yaw) * Math.cos(pitch) * speed,
    vy: Math.sin(pitch) * speed,
    vz: Math.cos(yaw) * Math.cos(pitch) * speed,
    offset: rand(),
  };
});

const matrix = new Matrix4();
const position = new Vector3();
const scale = new Vector3();
const identity = new Quaternion();
let clock = 0;

useLoop().onBeforeRender(({ delta }) => {
  const m = mesh.value;
  if (!m) return;
  const head = sawHead(state.progress);
  // Only while the blade is in the wood: down and sliding.
  const strength = state.reduced ? 0 : head.lower * (head.slide > 0 && head.slide < 1 ? 1 : 0.3);
  origin.x = CONVEYORS.main.position[0] - BLADE.traverse + 2 * BLADE.traverse * head.slide;
  clock += delta;
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]!;
    const age = ((clock / D.lifetime + p.offset) % 1) * D.lifetime;
    position.set(
      origin.x + p.vx * age,
      origin.y + p.vy * age - 0.5 * D.gravity * age * age,
      origin.z + p.vz * age,
    );
    // Shrink with age and with the cut's strength; zero when idle.
    const s = strength * (1 - age / D.lifetime);
    scale.set(s, s, s);
    matrix.compose(position, identity, scale);
    m.setMatrixAt(i, matrix);
  }
  m.instanceMatrix.needsUpdate = true;
});
</script>
