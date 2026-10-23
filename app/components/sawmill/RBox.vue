<!-- components/sawmill/RBox.vue -->
<!--
  Rounded box: the basic building block of the scene. Geometry comes from the
  shared cache and material from the shared materials module, so many RBoxes
  of the same size and colour cost one geometry and one material.
-->
<template>
  <TresMesh
    :geometry="geometry"
    :material="material(color)"
    :position="position"
    :rotation="rotation"
    :cast-shadow="castShadow"
    :receive-shadow="receiveShadow"
  />
</template>

<script setup lang="ts">
import { roundedBox } from "~/sawmill/geometries";
import { material } from "~/sawmill/materials";
import type { ColorName } from "~/sawmill/scene-config";

const props = withDefaults(
  defineProps<{
    size: readonly [number, number, number];
    color: ColorName;
    radius?: number;
    position?: readonly [number, number, number];
    rotation?: readonly [number, number, number];
    castShadow?: boolean;
    receiveShadow?: boolean;
  }>(),
  {
    radius: 4,
    position: () => [0, 0, 0],
    rotation: () => [0, 0, 0],
    castShadow: true,
    receiveShadow: true,
  },
);

const geometry = computed(() => roundedBox(props.size, props.radius));
</script>
