<!-- components/sawmill/InstancedParts.vue -->
<!--
  Many copies of one shared geometry + material in a single draw call
  (rollers, legs, buttons, posts). Pass the geometry from sawmill/geometries
  and one transform per copy.
-->
<template>
  <TresInstancedMesh
    ref="mesh"
    :args="[geometry, material(color), items.length]"
    :cast-shadow="castShadow"
    :receive-shadow="receiveShadow"
  />
</template>

<script setup lang="ts">
import { Euler, Matrix4, Quaternion, Vector3, type BufferGeometry, type InstancedMesh } from "three";
import { material } from "~/sawmill/materials";
import type { ColorName } from "~/sawmill/scene-config";

export interface PartTransform {
  position: readonly [number, number, number];
  rotation?: readonly [number, number, number];
}

const props = withDefaults(
  defineProps<{
    geometry: BufferGeometry;
    color: ColorName;
    items: readonly PartTransform[];
    castShadow?: boolean;
    receiveShadow?: boolean;
  }>(),
  { castShadow: true, receiveShadow: true },
);

const mesh = shallowRef<InstancedMesh>();
defineExpose({ mesh });

watchEffect(() => {
  const m = mesh.value;
  if (!m) return;
  const matrix = new Matrix4();
  const q = new Quaternion();
  const scale = new Vector3(1, 1, 1);
  props.items.forEach((item, i) => {
    q.setFromEuler(new Euler(...(item.rotation ?? [0, 0, 0])));
    matrix.compose(new Vector3(...item.position), q, scale);
    m.setMatrixAt(i, matrix);
  });
  m.instanceMatrix.needsUpdate = true;
  // Instanced bounds default to the single geometry; recompute for culling.
  m.computeBoundingSphere();
});
</script>
