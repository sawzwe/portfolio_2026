<!-- components/sawmill/CarriedPlanks.vue -->
<!-- Planks held flat across the body at waist height (pose-4-carrying.png).
     Rendered inside a Worker, in its waist frame (worker faces +Z). -->
<template>
  <Plank
    v-for="i in CARRY.planks"
    :key="i"
    :entry="null"
    :position="[0, CARRY.height + PLANK.thickness / 2 + (i - 1) * (PLANK.thickness + CARRY.gap), CARRY.forward]"
    :rotation="[0, Math.PI / 2, 0]"
  />
</template>

<script setup lang="ts">
import Plank from "./Plank.vue";
import { CARRY, PLANK } from "~/sawmill/scene-config";
</script>
