<!-- components/sawmill/Saw.vue -->
<!--
  Saw gantry (exploded.png, mill-*.png): four posts on foot plates, a top
  frame, thin guide rods, and a cross rail. The saw head (carriage, a
  telescoping arm, hub and blade) slides along the rail: for each cut it
  lowers, slides across the log and rises (sawHead in sawmill/motion.ts).
  The blade stands in the XY plane at the seam behind the front slice and
  spins continuously. Origin: gantry centre on the floor.
-->
<template>
  <TresGroup :position="G.position">
    <InstancedParts :geometry="postGeometry" color="machine" :items="posts" />
    <InstancedParts :geometry="footGeometry" color="details" :items="feet" />
    <InstancedParts :geometry="rodGeometry" color="details" :items="rods" />

    <!-- Top frame: long beams across the conveyor (X), short beams along it (Z). -->
    <RBox
      v-for="z in [-postZ, postZ]"
      :key="`beam-x-${z}`"
      :size="[G.span, beam, beam]"
      color="machine"
      :position="[0, topY, z]"
    />
    <RBox
      v-for="x in [-postX, postX]"
      :key="`beam-z-${x}`"
      :size="[beam, beam, G.depth - beam * 2]"
      color="machine"
      :position="[x, topY, 0]"
    />

    <!-- Cross rail and carriage carrying the saw head. -->
    <RBox
      :size="[G.span - post * 2, G.crossRail.thickness, G.crossRail.thickness]"
      color="machine"
      :position="[0, G.crossRail.y, B.offsetZ]"
    />
    <!-- Saw head. Carriage rides the rail (X); the arm stretches from the
         carriage down to the hub; hub and blade move with `head`. -->
    <TresMesh
      ref="carriage"
      :geometry="carriageGeometry"
      :material="material('machine')"
      :position="[0, G.crossRail.y, B.offsetZ]"
      cast-shadow
      receive-shadow
    />
    <TresMesh
      ref="arm"
      :geometry="armGeometry"
      :material="material('details')"
      :position="[0, G.crossRail.y, armZ]"
      cast-shadow
    />
    <TresGroup ref="head" :position="[0, restY, B.offsetZ]">
      <!-- Blade in the XY plane; it spins about its own axis (local Z). -->
      <TresMesh
        ref="blade"
        :geometry="bladeGeometry"
        :material="material('blade')"
        cast-shadow
        receive-shadow
      />
      <TresMesh
        :geometry="hubGeometry"
        :material="material('bladeHub')"
        :rotation="[Math.PI / 2, 0, 0]"
        cast-shadow
      />
    </TresGroup>
  </TresGroup>
</template>

<script setup lang="ts">
import type { Object3D } from "three";
import RBox from "./RBox.vue";
import InstancedParts, { type PartTransform } from "./InstancedParts.vue";
import { cylinder, roundedBox, sawBlade } from "~/sawmill/geometries";
import { material } from "~/sawmill/materials";
import { BLADE as B, GANTRY as G, MOTION } from "~/sawmill/scene-config";
import { MOTION_STATE, sawHead } from "~/sawmill/motion";

const post = G.post.size[0];
const beam = G.topBeam.thickness;
const postX = G.span / 2 - post / 2;
const postZ = G.depth / 2 - post / 2;
const postHeight = G.post.size[1];
const topY = postHeight - beam / 2;
const corners = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => [sx, sz] as const));

const postGeometry = roundedBox([post, postHeight - beam, post], 3);
const posts: PartTransform[] = corners.map(([sx, sz]) => ({
  position: [sx * postX, (postHeight - beam) / 2, sz * postZ],
}));

const footGeometry = roundedBox(G.foot.size, 2);
const feet: PartTransform[] = corners.map(([sx, sz]) => ({
  position: [sx * postX, G.foot.size[1] / 2, sz * postZ],
}));

// Guide rods stand just inside each post, from the floor to the cross rail.
const rodGeometry = roundedBox([G.guideRod.thickness, G.crossRail.y, G.guideRod.thickness], 2);
const rods: PartTransform[] = corners.map(([sx, sz]) => ({
  position: [sx * (postX - G.guideRod.offset), G.crossRail.y / 2, sz * postZ],
}));

const bladeGeometry = sawBlade(B.radius, B.thickness, B.teeth, B.toothDepth);
const hubGeometry = cylinder(B.hub.radius, B.hub.thickness, 24);

// The arm is a unit-height box scaled to the gap between the carriage and the
// hub each frame, beside the blade on its +Z side.
const armGeometry = roundedBox([B.arm.thickness, 1, B.arm.thickness], 0.4, 1);
const carriageGeometry = roundedBox(G.carriage.size, 4);
const armZ = B.offsetZ + B.hub.thickness / 2 + B.arm.thickness / 2;
const restY = B.centerY + MOTION.blade.raise;

// Motion: the head rests raised on the start side; each cut lowers it, slides
// it across, raises it, then it slides back. The blade spins continuously,
// faster while cutting.
const state = inject(MOTION_STATE)!;
const carriage = shallowRef<Object3D>();
const arm = shallowRef<Object3D>();
const head = shallowRef<Object3D>();
const blade = shallowRef<Object3D>();
const TAU = Math.PI * 2;

useLoop().onBeforeRender(({ delta }) => {
  const { lower, slide } = sawHead(state.progress);
  const x = -B.traverse + 2 * B.traverse * slide;
  const y = B.centerY + MOTION.blade.raise * (1 - lower);
  if (head.value) head.value.position.set(x, y, B.offsetZ);
  if (carriage.value) carriage.value.position.x = x;
  if (arm.value) {
    const length = G.crossRail.y - y;
    arm.value.scale.y = length;
    arm.value.position.set(x, y + length / 2, armZ);
  }
  if (blade.value && !state.reduced) {
    const rps = MOTION.blade.idleRps + (MOTION.blade.cuttingRps - MOTION.blade.idleRps) * lower;
    // Frame-rate independent; wrapped so the angle never grows unbounded.
    blade.value.rotation.z = (blade.value.rotation.z - rps * TAU * delta) % TAU;
  }
});
</script>
