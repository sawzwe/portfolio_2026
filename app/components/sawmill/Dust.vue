<!-- components/sawmill/Dust.vue -->
<!--
  Fine dust drifting in the air above the platform: tiny wood-coloured cubes
  rising slowly with a gentle sway, wrapping round inside MOTION.dust.volume.
  One instanced mesh; positions are a pure function of time, so nothing is
  allocated per frame. Hidden with reduced motion.
-->
<template>
  <TresInstancedMesh
    ref="mesh"
    :args="[geometry, material('wood'), D.count]"
    :frustum-culled="false"
    :visible="!reduced"
  />
</template>

<script setup lang="ts">
import { Matrix4, Quaternion, Vector3, type InstancedMesh } from "three";
import { roundedBox } from "~/sawmill/geometries";
import { material } from "~/sawmill/materials";
import { MOTION } from "~/sawmill/scene-config";
import { MOTION_STATE } from "~/sawmill/motion";

const D = MOTION.dust;
const V = D.volume;
const state = inject(MOTION_STATE)!;
const mesh = shallowRef<InstancedMesh>();
const geometry = roundedBox([D.size, D.size, D.size], 0.4, 1);
const reduced = ref(false);

// Fixed per-mote randomness (seeded, so every load looks the same).
let seed = 23;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const motes = Array.from({ length: D.count }, () => ({
  x: (rand() * 2 - 1) * V.x,
  z: (rand() * 2 - 1) * V.z,
  y0: rand(),
  rise: D.rise[0] + rand() * (D.rise[1] - D.rise[0]),
  phase: rand() * Math.PI * 2,
  scale: 0.5 + rand() * 0.8,
}));

const matrix = new Matrix4();
const position = new Vector3();
const rotation = new Quaternion();
const scale = new Vector3();
const Y_AXIS = new Vector3(0, 1, 0);
const height = V.yMax - V.yMin;
let clock = 0;

useLoop().onBeforeRender(({ delta }) => {
  if (reduced.value !== state.reduced) reduced.value = state.reduced;
  const m = mesh.value;
  if (!m || state.reduced) return;
  clock += delta;
  for (let i = 0; i < motes.length; i++) {
    const d = motes[i]!;
    // Rise and wrap; fade in/out (by size) near the bottom and top.
    const u = (d.y0 + (clock * d.rise) / height) % 1;
    const fade = Math.sin(Math.PI * u);
    position.set(
      d.x + Math.sin(clock * 0.4 + d.phase) * D.sway,
      V.yMin + u * height,
      d.z + Math.cos(clock * 0.3 + d.phase) * D.sway,
    );
    rotation.setFromAxisAngle(Y_AXIS, clock + d.phase);
    const s = d.scale * fade;
    scale.set(s, s, s);
    matrix.compose(position, rotation, scale);
    m.setMatrixAt(i, matrix);
  }
  m.instanceMatrix.needsUpdate = true;
});
</script>
