<!-- components/sawmill/Conveyor.vue -->
<!--
  Conveyor from prop-conveyor.png: a belt slab with rounded ends, a row of
  rollers on each side and square legs. Runs along Z, centred on `position`;
  `length` defaults to CONVEYOR.length.
  Used for both the main and the waiting conveyor.
-->
<template>
  <TresGroup :position="position">
    <RBox
      :size="[C.width, C.bedThickness, length]"
      :radius="C.endRadius"
      color="belt"
      :position="[0, bedY, 0]"
    />
    <InstancedParts ref="rollerParts" :geometry="rollerGeometry" color="machine" :items="rollers" />
    <InstancedParts :geometry="legGeometry" color="details" :items="legs" />
  </TresGroup>
</template>

<script setup lang="ts">
import RBox from "./RBox.vue";
import InstancedParts, { type PartTransform } from "./InstancedParts.vue";
import { cylinder, roundedBox } from "~/sawmill/geometries";
import { Matrix4, Quaternion, Vector3, type InstancedMesh } from "three";
import { CONVEYOR as C, LOG_PITCH } from "~/sawmill/scene-config";
import { MOTION_STATE, logOffset } from "~/sawmill/motion";

const props = withDefaults(
  defineProps<{
    position: readonly [number, number, number];
    length?: number;
    /** Rollers turn as the main log advances (rolling with the belt). */
    driven?: boolean;
  }>(),
  { length: C.length, driven: false },
);
const length = props.length;

const bedY = C.topY - C.bedThickness / 2;

// Rollers: short cylinders along X, poking out of both long sides of the bed.
const rollerGeometry = cylinder(C.rollers.radius, C.rollers.length, 16);
const rollerSpan = length - C.endRadius * 2;
const rollers: PartTransform[] = [];
// Same roller spacing on every conveyor, whatever its length.
const rollerCount = Math.max(2, Math.round((C.rollers.count - 1) * (length / C.length)) + 1);
for (const side of [-1, 1]) {
  for (let i = 0; i < rollerCount; i++) {
    rollers.push({
      position: [
        side * (C.width / 2 + C.rollers.length / 2),
        bedY,
        -rollerSpan / 2 + (rollerSpan * i) / (rollerCount - 1),
      ],
      rotation: [0, 0, Math.PI / 2],
    });
  }
}

// Legs: from the floor to the underside of the bed.
const legHeight = C.topY - C.bedThickness;
const legGeometry = roundedBox([C.legs.thickness, legHeight, C.legs.thickness], 2);
const legSpan = length - C.legs.inset * 2;
const legX = C.width / 2 - C.legs.sideInset - C.legs.thickness / 2;
const legs: PartTransform[] = [];
for (let i = 0; i < C.legs.pairs; i++) {
  const z = -legSpan / 2 + (legSpan * i) / (C.legs.pairs - 1);
  for (const side of [-1, 1]) legs.push({ position: [side * legX, legHeight / 2, z] });
}

// Driven rollers: the belt moves with the log, so each roller turns by the
// distance travelled over its radius. Matrices are rewritten only when the
// angle changes; nothing is allocated per frame.
const rollerParts = shallowRef<{ mesh?: InstancedMesh }>();
if (props.driven) {
  const state = inject(MOTION_STATE)!;
  const axis = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2);
  const spin = new Quaternion();
  const q = new Quaternion();
  const up = new Vector3(0, 1, 0);
  const one = new Vector3(1, 1, 1);
  const p = new Vector3();
  const m = new Matrix4();
  let lastAngle = Number.POSITIVE_INFINITY;
  useLoop().onBeforeRender(() => {
    const mesh = rollerParts.value?.mesh;
    if (!mesh) return;
    const angle = (logOffset(state.progress) * LOG_PITCH) / C.rollers.radius;
    if (Math.abs(angle - lastAngle) < 1e-4) return;
    lastAngle = angle;
    spin.setFromAxisAngle(up, angle);
    q.multiplyQuaternions(axis, spin);
    for (let i = 0; i < rollers.length; i++) {
      const pos = rollers[i]!.position;
      p.set(pos[0], pos[1], pos[2]);
      m.compose(p, q, one);
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });
}
</script>
