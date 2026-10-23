<!-- components/sawmill/Console.vue -->
<!--
  The desk on the right of master.png: a flat wooden desk (top, two side
  panels, a modesty panel on the +Z side) with a grey monitor facing -Z,
  towards the seated worker.
-->
<template>
  <TresGroup :position="D.position" :rotation="[0, D.rotationY, 0]">
    <RBox :size="[w, D.topThickness, d]" color="wood" :position="[0, h - D.topThickness / 2, 0]" />
    <RBox
      v-for="x in [-sideX, sideX]"
      :key="x"
      :size="[D.sideThickness, h - D.topThickness, d]"
      color="wood"
      :position="[x, (h - D.topThickness) / 2, 0]"
    />
    <RBox
      :size="[w - D.sideThickness * 2, (h - D.topThickness) * 0.6, D.sideThickness / 2]"
      color="wood"
      :position="[0, h - D.topThickness - ((h - D.topThickness) * 0.6) / 2, d / 2 - D.sideThickness]"
    />

    <!-- Monitor: base, stand, then the screen box with its dark face to -Z. -->
    <TresGroup :position="[0, h, d / 4]">
      <RBox :size="M.base" :radius="1.5" color="details" :position="[0, M.base[1] / 2, 0]" />
      <RBox :size="M.stand" :radius="2" color="details" :position="[0, M.base[1] + M.stand[1] / 2, 0]" />
      <RBox :size="M.size" :radius="3" color="machine" :position="[0, screenY, 0]" />
      <RBox
        :size="[M.size[0] - 6, M.size[1] - 6, 1]"
        :radius="0.4"
        color="screen"
        :position="[0, screenY, -M.size[2] / 2 - 0.3]"
        :cast-shadow="false"
      />
    </TresGroup>
  </TresGroup>
</template>

<script setup lang="ts">
import RBox from "./RBox.vue";
import { DESK as D } from "~/sawmill/scene-config";

const [w, h, d] = D.size;
const M = D.monitor;
const sideX = w / 2 - D.sideThickness / 2;
const screenY = M.base[1] + M.stand[1] + M.size[1] / 2;
</script>
