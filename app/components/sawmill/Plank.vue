<!-- components/sawmill/Plank.vue -->
<!--
  One plank (plank-single.png): a rounded board lying along Z with the thin
  label groove on its top face and the entry's year printed flat in the
  recess. Only the year is printed, large enough to read; the full entry
  is in the HTML caption. `entry` null gives a blank plank. Origin is the
  plank centre.
-->
<template>
  <TresGroup :position="position" :rotation="rotation">
    <RBox :size="PLANK_SIZE" :radius="PLANK.radius" color="wood" />
    <!-- Groove: a long line near the far (-X) edge and a short one across the
         closed (-Z) end. The +Z end stays open. -->
    <RBox
      :size="[R.grooveWidth, R.depth, longGrooveLength]"
      :radius="0.2"
      color="woodSeam"
      :position="[grooveX, topY, (R.inset - R.openEnd) / 2]"
      :cast-shadow="false"
    />
    <RBox
      :size="[shortGrooveLength, R.depth, R.grooveWidth]"
      :radius="0.2"
      color="woodSeam"
      :position="[grooveX + shortGrooveLength / 2 - R.grooveWidth / 2, topY, -PLANK.length / 2 + R.inset]"
      :cast-shadow="false"
    />
    <PlankLabel
      v-if="entry"
      :text="entry.year"
      :position="[labelX, PLANK.thickness / 2 + PLANK.label.lift, labelZ]"
    />
  </TresGroup>
</template>

<script setup lang="ts">
import RBox from "./RBox.vue";
import PlankLabel from "./PlankLabel.vue";
import { PLANK, PLANK_SIZE } from "~/sawmill/scene-config";
import type { TimelineEntry } from "~/sawmill/timeline";

withDefaults(
  defineProps<{
    entry: TimelineEntry | null;
    position?: readonly [number, number, number];
    rotation?: readonly [number, number, number];
  }>(),
  { position: () => [0, 0, 0], rotation: () => [0, 0, 0] },
);

const R = PLANK.recess;
// Groove strips sit half-sunk in the top face so they read as a cut line.
const topY = PLANK.thickness / 2 - R.depth / 4;
const grooveX = -PLANK.width / 2 + R.inset;
const longGrooveLength = PLANK.length - R.inset - R.openEnd;
const shortGrooveLength = PLANK.width - R.inset * 2;
// Label sits in the middle of the recess: between the long groove and the
// near edge, and from the closed-end groove to the open end.
const labelX = (grooveX + PLANK.width / 2 - R.inset) / 2;
const labelZ = R.inset / 2;
</script>
