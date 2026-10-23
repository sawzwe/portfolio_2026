<!-- components/sawmill/MotorBox.vue -->
<!-- The big grey machine right of the gantry: a rounded box, a round motor
     face on its +Z side and a smaller block on its -Z side (master.png). -->
<template>
  <TresGroup :position="M.position">
    <RBox :size="M.size" :radius="M.radius" color="machineDark" :position="[0, M.size[1] / 2, 0]" />
    <TresMesh
      :geometry="faceGeometry"
      :material="material('details')"
      :position="[0, M.size[1] * 0.55, M.size[2] / 2 + M.motorFace.depth / 2]"
      :rotation="[Math.PI / 2, 0, 0]"
      cast-shadow
      receive-shadow
    />
    <RBox
      :size="M.sideBlock.size"
      color="details"
      :position="[0, M.sideBlock.size[1] / 2, -M.size[2] / 2 - M.sideBlock.size[2] / 2]"
    />
  </TresGroup>
</template>

<script setup lang="ts">
import RBox from "./RBox.vue";
import { cylinder } from "~/sawmill/geometries";
import { material } from "~/sawmill/materials";
import { MOTOR_BOX as M } from "~/sawmill/scene-config";

const faceGeometry = cylinder(M.motorFace.radius, M.motorFace.depth, 32);
</script>
