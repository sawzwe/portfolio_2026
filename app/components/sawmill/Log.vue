<!-- components/sawmill/Log.vue -->
<!--
  A static log (the waiting one, "what's next"): LOG.waitingSlices blank planks
  standing on edge across the conveyor, like the main log before its first
  cut. Centred on `position` (bottom of the log on the belt).
-->
<template>
  <TresGroup :position="position">
    <Plank
      v-for="i in LOG.waitingSlices"
      :key="i"
      :entry="null"
      :position="[0, LOG_HEIGHT / 2, -length / 2 + PLANK.thickness / 2 + (i - 1) * LOG_PITCH]"
      :rotation="ON_EDGE"
    />
  </TresGroup>
</template>

<script setup lang="ts">
import Plank from "./Plank.vue";
import { LOG, LOG_HEIGHT, LOG_PITCH, PLANK, logLength } from "~/sawmill/scene-config";

defineProps<{ position: readonly [number, number, number] }>();

const length = logLength(LOG.waitingSlices);

// Plank built flat along Z -> on edge: length along X, width up, thickness
// along Z (the same orientation CutTimeline uses for the main log).
const ON_EDGE = [Math.PI / 2, Math.PI / 2, 0] as const;
</script>
