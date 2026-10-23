<!-- components/sawmill/ControlPanel.vue -->
<!--
  Control panel (prop-control-panel.png): a grey box whose top slopes down
  towards the operator (+X in local space), with 2x3 round buttons and a
  small dark screen on the slope.
-->
<template>
  <TresGroup :position="P.position" :rotation="[0, P.rotationY, 0]">
    <TresMesh :geometry="bodyGeometry" :material="material('machineDark')" cast-shadow receive-shadow />
    <InstancedParts :geometry="buttonGeometry" color="button" :items="buttons" :cast-shadow="false" />
    <RBox
      :size="P.screen.size"
      :radius="0.6"
      color="screen"
      :position="onSlope(0.62, screenZ, P.screen.size[1] / 2)"
      :rotation="slopeRotation"
      :cast-shadow="false"
    />
  </TresGroup>
</template>

<script setup lang="ts">
import RBox from "./RBox.vue";
import InstancedParts, { type PartTransform } from "./InstancedParts.vue";
import { cylinder, slopedBox } from "~/sawmill/geometries";
import { material } from "~/sawmill/materials";
import { CONTROL_PANEL as P } from "~/sawmill/scene-config";

const [depth, height, width] = P.size;
const bodyGeometry = slopedBox(P.size, P.slopeDrop, P.radius);

// The slope runs from the front edge (+X, low) to the back edge (-X, high).
const tilt = Math.atan2(P.slopeDrop, depth);
const slopeRotation = [0, 0, -tilt] as const;

/** Point on the sloped face: t = 0 front edge .. 1 back edge, z across, lifted along the normal. */
function onSlope(t: number, z: number, lift: number): [number, number, number] {
  const x = depth / 2 - t * depth;
  const y = height - P.slopeDrop + t * P.slopeDrop;
  return [x + Math.sin(tilt) * lift, y + Math.cos(tilt) * lift, z];
}

const { rows, cols, radius, depth: buttonDepth, gap } = P.buttons;
const buttonGeometry = cylinder(radius, buttonDepth, 16);
const buttons: PartTransform[] = [];
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    buttons.push({
      position: onSlope(0.3 + r * 0.28, -width / 2 + 12 + c * gap, buttonDepth / 2),
      rotation: slopeRotation,
    });
  }
}

const screenZ = width / 2 - P.screen.size[2] / 2 - 8;
</script>
