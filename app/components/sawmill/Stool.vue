<!-- components/sawmill/Stool.vue -->
<!-- Low grey stool with a backrest on its -Z side; the seated worker faces +Z.
     `at-origin` places it at the local origin (used by the dev worker lab). -->
<template>
  <TresGroup :position="atOrigin ? [0, 0, 0] : S.position">
    <RBox :size="S.seat" :radius="2" color="details" :position="[0, S.height - S.seat[1] / 2, 0]" />
    <InstancedParts :geometry="legGeometry" color="details" :items="legs" />
    <RBox
      :size="S.backrest.size"
      :radius="2"
      color="details"
      :position="[0, S.height + S.backrest.size[1] / 2, -S.seat[2] / 2 + S.backrest.size[2] / 2]"
    />
  </TresGroup>
</template>

<script setup lang="ts">
import RBox from "./RBox.vue";
import InstancedParts, { type PartTransform } from "./InstancedParts.vue";
import { roundedBox } from "~/sawmill/geometries";
import { STOOL as S } from "~/sawmill/scene-config";

defineProps<{ atOrigin?: boolean }>();

const legHeight = S.height - S.seat[1];
const legGeometry = roundedBox([S.legThickness, legHeight, S.legThickness], 1.5);
const inset = S.seat[0] / 2 - S.legThickness / 2 - 2;
const legs: PartTransform[] = [-1, 1].flatMap((sx) =>
  [-1, 1].map((sz) => ({ position: [sx * inset, legHeight / 2, sz * inset] as const })),
);
</script>
